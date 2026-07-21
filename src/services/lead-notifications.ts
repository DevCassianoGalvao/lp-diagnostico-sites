export type LeadNotificationPayload = {
  phase: "started" | "completed";
  leadId: string;
  contact: {
    name: string;
    whatsapp: string;
    email: string;
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
  };
  website?: string;
};

export async function sendLeadNotification(payload: LeadNotificationPayload) {
  const response = await fetch(`${import.meta.env.BASE_URL}api/leads.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) throw new Error("lead_notification_failed");
  return response.json() as Promise<{ ok: true; delivered: boolean; messageId?: string }>;
}
