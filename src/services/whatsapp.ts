import { Lead } from "../state/lead-state";
import { RecommendationResult } from "../rules/recommendation-engine";
import { answerLabel } from "../content/copy-engine";

export const WHATSAPP_NUMBER = "5522997560717";

export function buildWhatsappUrl(lead: Lead, result: RecommendationResult) {
  const nome = lead.nome || "não informado";
  const negocio = lead.negocio || "meu projeto";
  const lines = [
    "Olá, Cassiano. Concluí meu diagnóstico de site.",
    "",
    `Meu nome é ${nome} e o negócio é ${negocio}.`,
    lead.nicho ? `Área: ${answerLabel("nicho", lead.nicho, lead.nichoOutro)}.` : "",
    lead.cidade ? `Cidade/região: ${lead.cidade}.` : "",
    lead.situacao ? `Momento atual: ${answerLabel("situacao", lead.situacao, lead.situacaoOutro)}.` : "",
    lead.objetivo ? `Objetivo principal: ${answerLabel("objetivo", lead.objetivo, lead.objetivoOutro)}.` : "",
    lead.visibilidadeGoogle ? `Situação no Google: ${answerLabel("visibilidadeGoogle", lead.visibilidadeGoogle)}.` : "",
    lead.caminhoProjeto ? `Caminho considerado: ${answerLabel("caminhoProjeto", lead.caminhoProjeto)}.` : "",
    `Estrutura sugerida: ${result.recommendation.title}.`,
    lead.prazo ? `Prazo: ${answerLabel("prazo", lead.prazo)}.` : "",
    "",
    "Quero conversar para entender como começar."
  ];
  const message = lines.filter((line, index) => line || index === 1 || index === lines.length - 2).join("\n");

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildCapturedWhatsappUrl(lead: Lead) {
  const business = lead.tipoNegocio === "indefinido" ? "meu projeto" : lead.negocio || "meu negócio";
  const message = `Olá, Cassiano. Sou ${lead.nome || "visitante"} e comecei o diagnóstico para ${business}. Prefiro conversar agora.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
