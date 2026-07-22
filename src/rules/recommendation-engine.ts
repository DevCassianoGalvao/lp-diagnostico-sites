import { Lead } from "../state/lead-state";
import { modules, Recommendation, recommendations } from "../content/recommendations";

export type RecommendationResult = {
  recommendation: Recommendation;
  moduleKeys: (keyof typeof modules)[];
  summary: string;
  indicators: { presence: string; visibility: string; conversion: string };
};

export function getRecommendation(lead: Lead): RecommendationResult {
  let key: keyof typeof recommendations = "mvp";

  if (lead.caminhoProjeto === "site_497") key = "mvp";
  else if (lead.objetivo === "catalogo" || lead.situacao === "produtos_catalogo" || lead.modeloVenda === "produto_contato") key = "catalogo";
  else if (lead.objetivo === "inscricoes" || lead.situacao === "lancamento") key = "lancamento";
  else if (lead.situacao === "site_desatualizado") key = "redesign";
  else if (lead.objetivo === "orcamento" || lead.modeloVenda === "orcamento") key = "orcamento";
  else if (lead.objetivo === "agendamento") key = "agendamento";
  else if (lead.objetivo === "organizar_comercial") key = "funil";
  else if (lead.objetivo === "whatsapp" && lead.modeloVenda === "decisao_rapida") key = "landing";
  else if (lead.canal === "trafego_pago" || lead.situacao === "ads_nao_converte") key = "landing";
  else if (lead.objetivo === "autoridade" || ["saude", "juridico", "consultoria"].includes(lead.nicho)) key = "autoridade";
  else if (lead.objetivo === "servicos") key = "institucional";

  const moduleSet = new Set<keyof typeof modules>();
  if (["local", "regional", "hibrido"].includes(lead.alcance)) moduleSet.add("seo_local");
  if (["encontra_perfil", "informacoes_incompletas", "concorrentes", "nao_sei"].includes(lead.visibilidadeGoogle)) moduleSet.add("seo_local");
  if (lead.canal === "trafego_pago" || lead.situacao === "ads_nao_converte") moduleSet.add("mensuracao");
  if (["reuniao", "orcamento"].includes(lead.modeloVenda) || lead.objetivo === "organizar_comercial") moduleSet.add("crm");
  if (lead.objetivo === "autoridade" || ["saude", "juridico", "consultoria"].includes(lead.nicho)) moduleSet.add("autoridade");
  if (lead.situacao === "instagram" || lead.canal === "instagram") moduleSet.add("rede_propria");
  if (lead.canal === "google" || lead.modeloVenda === "pesquisa") moduleSet.add("conteudo");
  if (lead.caminhoProjeto === "recursos_integracoes") moduleSet.add("automacao");

  const business = lead.tipoNegocio === "indefinido" ? "seu projeto" : lead.negocio || "seu negócio";
  return {
    recommendation: recommendations[key],
    moduleKeys: Array.from(moduleSet),
    summary: `Pelo que você respondeu, ${business} precisa priorizar ${label(lead.objetivo, lead.objetivoOutro)}, considerando o momento atual e o caminho de decisão do cliente.`,
    indicators: {
      presence: lead.situacao === "sem_site" ? "Precisa de uma base" : lead.situacao === "site_desatualizado" ? "Estrutura existente que precisa evoluir" : "Presença parcial",
      visibility: lead.visibilidadeGoogle === "encontra_site" ? "Base existente, com oportunidade de melhoria" : lead.visibilidadeGoogle === "informacoes_incompletas" ? "Informações incompletas" : "Precisa de atenção",
      conversion: ["sem_contatos", "ads_nao_converte"].includes(lead.situacao) ? "Estrutura de contato precisa ser otimizada" : ["orcamento", "organizar_comercial"].includes(lead.objetivo) ? "Oportunidade de gerar contatos com mais contexto" : "Próximo passo pouco claro"
    }
  };
}

function label(value: string, fallback: string) {
  return fallback || value.replace(/_/g, " ") || "um próximo passo claro";
}
