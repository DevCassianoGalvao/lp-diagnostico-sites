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
  "whatsapp_click",
  "restart_diagnosis",
  "edit_answer"
] as const;

export function track(event: (typeof analyticsEvents)[number], params: EventParams = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...params });
}
