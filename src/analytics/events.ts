type EventParams = Record<string, string | number | boolean | string[] | undefined>;

declare global {
  interface Window {
    dataLayer?: EventParams[];
  }
}

export const analyticsEvents = [
  "page_view",
  "intro_view",
  "start_diagnosis",
  "answer_name",
  "answer_business",
  "answer_niche",
  "answer_current_situation",
  "answer_goal",
  "answer_acquisition_channel",
  "recommendation_view",
  "contact_form_view",
  "lead_submit",
  "qualified_lead",
  "whatsapp_click",
  "restart_diagnosis",
  "edit_answer"
] as const;

export function track(event: (typeof analyticsEvents)[number], params: EventParams = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}
