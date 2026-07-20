import { Lead } from "../state/lead-state";
import { RecommendationResult } from "../rules/recommendation-engine";
import { answerLabel } from "../content/copy-engine";

export const WHATSAPP_NUMBER = "5500000000000";
export const hasConfiguredWhatsapp = !/^55(?:0)+$/.test(WHATSAPP_NUMBER);

export function buildWhatsappUrl(lead: Lead, result: RecommendationResult) {
  const nome = lead.nome || "não informado";
  const negocio = lead.negocio || "meu projeto";
  const message = [
    "Olá, Cassiano. Concluí a análise inicial do meu projeto.",
    "",
    `Meu nome é ${nome} e o negócio é ${negocio}.`,
    `Hoje, o principal contexto é ${answerLabel("situacao", lead.situacao, lead.situacaoOutro)}.`,
    `Meu objetivo é ${answerLabel("objetivo", lead.objetivo, lead.objetivoOutro)}.`,
    `A estrutura sugerida foi ${result.recommendation.title}.`,
    "",
    "Gostaria de conversar para entender se essa direção faz sentido para o projeto."
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
