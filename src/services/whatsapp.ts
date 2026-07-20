import { Lead } from "../state/lead-state";
import { RecommendationResult } from "../rules/recommendation-engine";

export const WHATSAPP_NUMBER = "5500000000000";
export const hasConfiguredWhatsapp = !/^55(?:0)+$/.test(WHATSAPP_NUMBER);

export function buildWhatsappUrl(lead: Lead, result: RecommendationResult) {
  const nome = lead.nome || "Nao informado";
  const negocio = lead.negocio || "meu projeto";
  const message = [
    "Ola, Cassiano! Meu nome e " + nome + ".",
    "",
    "Conclui a analise interativa para " + negocio + ".",
    "",
    "Nicho: " + (lead.nichoOutro || lead.nicho || "Nao informado"),
    "Situacao atual: " + (lead.situacaoOutro || lead.situacao || "Nao informado"),
    "Objetivo principal: " + (lead.objetivoOutro || lead.objetivo || "Nao informado"),
    "Origem dos clientes: " + (lead.canalOutro || lead.canal || "Nao informado"),
    "Modelo de venda: " + (lead.modeloVenda || "Nao informado"),
    "Estrutura recomendada: " + result.recommendation.title,
    "Prazo: " + (lead.prazo || "Nao informado"),
    "",
    "Gostaria de conversar sobre a melhor primeira etapa."
  ].join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
