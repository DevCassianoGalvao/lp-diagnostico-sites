const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/leads") {
      return handleLeadNotification(request, env, url);
    }

    const portfolioImage = url.pathname.match(/^\/portfolio-image\/([a-z0-9-]+)$/);

    if (portfolioImage) {
      const assetUrl = new URL(`/assets/portfolio/${portfolioImage[1]}.webp`, url);
      const response = await env.ASSETS.fetch(new Request(assetUrl, request));
      return withCorrectContentType(response, assetUrl.pathname);
    }

    const isAsset = url.pathname.includes(".");

    if (url.pathname === "/") url.pathname = "/index.html";
    const response = await env.ASSETS.fetch(new Request(url, request));

    if (response.status !== 404 || isAsset) return withCorrectContentType(response, url.pathname);

    url.pathname = "/index.html";
    return env.ASSETS.fetch(new Request(url, request));
  }
};

const rateLimits = new Map();

async function handleLeadNotification(request, env, url) {
  if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) return json({ error: "invalid_origin" }, 403);

  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (contentLength > 50000) return json({ error: "payload_too_large" }, 413);

  if (!env.BREVO_API_KEY || !env.BREVO_SENDER_EMAIL || !env.LEAD_NOTIFICATION_EMAIL) {
    return json({ ok: true, delivered: false });
  }

  if (isRateLimited(request)) return json({ error: "too_many_requests" }, 429);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const lead = normalizeLeadPayload(payload);
  if (!lead.valid) return json({ error: "invalid_lead", fields: lead.errors }, 400);
  if (lead.value.website) return json({ ok: true, messageId: "accepted" });

  const email = buildLeadEmail(lead.value);
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "api-key": env.BREVO_API_KEY
    },
    body: JSON.stringify({
      sender: {
        name: env.BREVO_SENDER_NAME || "Diagnóstico Cassiano Galvão",
        email: env.BREVO_SENDER_EMAIL
      },
      to: [{
        name: env.LEAD_NOTIFICATION_NAME || "Cassiano Galvão",
        email: env.LEAD_NOTIFICATION_EMAIL
      }],
      replyTo: { name: lead.value.contact.name, email: lead.value.contact.email },
      subject: email.subject,
      htmlContent: email.html,
      tags: ["diagnostico-site", lead.value.phase]
    })
  });

  if (!response.ok) {
    console.error("Brevo notification failed", response.status, await response.text());
    return json({ error: "email_delivery_failed" }, 502);
  }

  const result = await response.json();
  return json({ ok: true, delivered: true, messageId: result.messageId || "sent" });
}

function normalizeLeadPayload(payload) {
  const errors = [];
  const phase = payload?.phase === "completed" ? "completed" : payload?.phase === "started" ? "started" : "";
  const leadId = clean(payload?.leadId, 80);
  const contact = {
    name: clean(payload?.contact?.name, 80),
    whatsapp: clean(payload?.contact?.whatsapp, 24),
    email: clean(payload?.contact?.email, 120).toLowerCase(),
    consent: payload?.contact?.consent === true
  };

  if (!phase) errors.push("phase");
  if (!/^[a-zA-Z0-9-]{8,80}$/.test(leadId)) errors.push("leadId");
  if (contact.name.length < 2) errors.push("name");
  if (!/^\d{10,14}$/.test(contact.whatsapp.replace(/\D/g, ""))) errors.push("whatsapp");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) errors.push("email");
  if (!contact.consent) errors.push("consent");

  const answers = Array.isArray(payload?.answers)
    ? payload.answers.slice(0, 30).map((item) => ({
        question: clean(item?.question, 140),
        answer: clean(item?.answer, 700)
      })).filter((item) => item.question && item.answer)
    : [];

  const diagnosis = payload?.diagnosis ? {
    title: clean(payload.diagnosis.title, 240),
    summary: clean(payload.diagnosis.summary, 1400),
    challenge: clean(payload.diagnosis.challenge, 1000),
    opportunity: clean(payload.diagnosis.opportunity, 1000),
    recommendation: clean(payload.diagnosis.recommendation, 240),
    recommendationBody: clean(payload.diagnosis.recommendationBody, 1400),
    modules: Array.isArray(payload.diagnosis.modules)
      ? payload.diagnosis.modules.slice(0, 12).map((item) => clean(item, 160)).filter(Boolean)
      : []
  } : null;

  if (phase === "completed" && (!diagnosis || !answers.length)) errors.push("diagnosis");

  return {
    valid: errors.length === 0,
    errors,
    value: {
      phase,
      leadId,
      contact,
      answers,
      diagnosis,
      website: clean(payload?.website, 120)
    }
  };
}

function buildLeadEmail(lead) {
  const complete = lead.phase === "completed";
  const subject = complete
    ? `[Diagnóstico completo] ${lead.contact.name}`
    : `[Novo lead] ${lead.contact.name} iniciou o diagnóstico`;
  const answers = lead.answers.map((item) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e6e6e6;color:#666;font-size:13px;vertical-align:top">${escapeHtml(item.question)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e6e6e6;color:#151515;font-size:14px">${escapeHtml(item.answer)}</td>
    </tr>`).join("");
  const diagnosis = lead.diagnosis ? `
    <h2 style="margin:28px 0 12px;font-size:20px;color:#151515">Diagnóstico</h2>
    ${emailBlock("Leitura", lead.diagnosis.summary)}
    ${emailBlock("Principal desafio", lead.diagnosis.challenge)}
    ${emailBlock("Oportunidade", lead.diagnosis.opportunity)}
    ${emailBlock("Recomendação", `${lead.diagnosis.recommendation} — ${lead.diagnosis.recommendationBody}`)}
    ${lead.diagnosis.modules.length ? emailBlock("Apoios possíveis", lead.diagnosis.modules.join("; ")) : ""}
  ` : "";

  return {
    subject,
    html: `<!doctype html><html><body style="margin:0;background:#f4f4f5;font-family:Arial,sans-serif;color:#151515">
      <div style="max-width:720px;margin:0 auto;padding:28px 16px">
        <div style="background:#08080b;border-top:4px solid #00ef9e;padding:24px;color:#fff">
          <p style="margin:0 0 8px;color:#a954ff;font-size:12px;font-weight:700;text-transform:uppercase">${complete ? "Diagnóstico concluído" : "Novo contato capturado"}</p>
          <h1 style="margin:0;font-size:26px">${escapeHtml(lead.contact.name)}</h1>
        </div>
        <div style="background:#fff;padding:24px">
          <h2 style="margin:0 0 14px;font-size:20px">Contato</h2>
          ${emailBlock("WhatsApp", lead.contact.whatsapp)}
          ${emailBlock("E-mail", lead.contact.email)}
          ${emailBlock("ID do lead", lead.leadId)}
          ${answers ? `<h2 style="margin:28px 0 12px;font-size:20px">Respostas</h2><table style="width:100%;border-collapse:collapse">${answers}</table>` : ""}
          ${diagnosis}
        </div>
      </div>
    </body></html>`
  };
}

function emailBlock(label, value) {
  return `<div style="margin:0 0 14px"><strong style="display:block;margin-bottom:4px;color:#666;font-size:12px;text-transform:uppercase">${escapeHtml(label)}</strong><span style="font-size:15px;line-height:1.5">${escapeHtml(value)}</span></div>`;
}

function clean(value, max) {
  return String(value || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[character]);
}

function isRateLimited(request) {
  const now = Date.now();
  const key = request.headers.get("CF-Connecting-IP") || "unknown";
  const recent = (rateLimits.get(key) || []).filter((time) => now - time < 10 * 60 * 1000);
  recent.push(now);
  rateLimits.set(key, recent);
  if (rateLimits.size > 1000) {
    for (const [entry, times] of rateLimits) {
      if (!times.some((time) => now - time < 10 * 60 * 1000)) rateLimits.delete(entry);
    }
  }
  return recent.length > 8;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function withCorrectContentType(response, pathname) {
  if (!pathname.toLowerCase().endsWith(".webp")) return response;

  const headers = new Headers(response.headers);
  headers.set("Content-Type", "image/webp");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

export default worker;
