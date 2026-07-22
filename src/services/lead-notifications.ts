export type LeadNotificationPayload = {
  phase: "completed";
  leadId: string;
  contact: {
    name: string;
    whatsapp: string;
    email: string;
    instagram: string;
    consent: boolean;
  };
  answers?: Array<{ question: string; answer: string }>;
  diagnosis?: {
    title: string;
    summary: string;
    challenge: string;
    opportunity: string;
    recommendation: string;
    recommendationBody: string;
    modules: string[];
    indicators?: string[];
    offer?: string;
  };
  campaign?: Record<string, string>;
  timestamp?: string;
  website?: string;
};

export async function sendLeadNotification(payload: LeadNotificationPayload) {
  if (import.meta.env.DEV) {
    await new Promise((resolve) => window.setTimeout(resolve, 120));
    return { ok: true as const, delivered: true, messageId: `dev-${payload.phase}` };
  }
  const response = await fetch(`${import.meta.env.BASE_URL}api/leads.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error("lead_notification_failed");
  return response.json() as Promise<{ ok: true; delivered: boolean; messageId?: string }>;
}

export function getCampaignContext() {
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid"]
      .map((key) => [key, params.get(key) || sessionStorage.getItem(`campaign:${key}`) || ""])
      .filter(([, value]) => value)
      .map(([key, value]) => {
        sessionStorage.setItem(`campaign:${key}`, value);
        return [key, value];
      })
  );
}
