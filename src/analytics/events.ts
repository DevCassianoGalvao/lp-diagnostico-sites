type EventParams = Record<string, string | number | boolean | string[] | undefined>;

declare global {
  interface Window {
    dataLayer?: EventParams[];
    fbq?: (...args: unknown[]) => void;
  }
}

export const analyticsEvents = [
  "page_view",
  "intro_view",
  "start_diagnosis",
  "answer_name",
  "answer_business",
  "answer_niche",
  "answer_reach",
  "answer_city",
  "answer_current_situation",
  "contact_captured",
  "answer_goal",
  "answer_google_visibility",
  "answer_acquisition_channel",
  "answer_sales_model",
  "answer_project_path",
  "answer_deadline",
  "google_education_view",
  "portfolio_preview_view",
  "portfolio_project_preview",
  "portfolio_full_view",
  "diagnosis_complete",
  "recommendation_view",
  "contact_form_view",
  "lead_submit",
  "lead_notification_sent",
  "offer_gift_reveal",
  "whatsapp_click",
  "restart_diagnosis",
  "edit_answer"
] as const;

type AnalyticsEvent = (typeof analyticsEvents)[number];

function safeParam(params: EventParams, key: string) {
  const value = params[key];
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? value : undefined;
}

function trackMeta(event: AnalyticsEvent, params: EventParams) {
  if (typeof window.fbq !== "function") return;

  if (event === "start_diagnosis") {
    window.fbq("trackCustom", "DiagnosisStarted");
  } else if (event === "contact_captured") {
    window.fbq("trackCustom", "ContactCaptured", { source: safeParam(params, "source") });
  } else if (event === "diagnosis_complete") {
    window.fbq("trackCustom", "DiagnosisCompleted", { recommendation: safeParam(params, "recommendation") });
  } else if (event === "offer_gift_reveal") {
    window.fbq("trackCustom", "GiftRevealed", { offer: safeParam(params, "offer") });
  } else if (event === "whatsapp_click") {
    window.fbq("track", "Contact", { content_name: "whatsapp", source: safeParam(params, "source") });
  } else if (event === "lead_notification_sent") {
    window.fbq("track", "Lead", { content_name: "diagnostico_site", content_category: "site_profissional" });
  }
}

export function track(event: AnalyticsEvent, params: EventParams = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
  trackMeta(event, params);
}
