import { Question, QuestionOption, questions } from "./questions";
import { RecommendationResult } from "../rules/recommendation-engine";
import { Lead } from "../state/lead-state";

export const chapters: Record<string, string> = {
  name: "QUERO CONHECER VOCÊ",
  business: "AGORA, O SEU PROJETO",
  niche: "O CONTEXTO DO NEGÓCIO",
  reach: "QUEM VOCÊ ATENDE",
  situation: "O MOMENTO ATUAL",
  goal: "O QUE PRECISA MELHORAR",
  channel: "COMO AS PESSOAS CHEGAM",
  "sales-model": "O QUE ACONTECE ANTES DO CONTATO",
  level: "O TAMANHO DO PRIMEIRO PASSO",
  budget: "PRIORIDADES E LIMITES",
  deadline: "ÚLTIMO CONTEXTO"
};

type Feedback = { title: string; body: string };

const situationFeedback: Record<string, Feedback> = {
  sem_site: {
    title: "Já entendi o ponto de partida.",
    body: "Seu negócio ainda não possui uma estrutura própria. Isso não exige começar com algo grande; primeiro precisamos definir qual função essa presença deveria cumprir."
  },
  site_desatualizado: {
    title: "Talvez o site não acompanhe mais o negócio.",
    body: "Isso pode envolver conteúdo, apresentação, navegação ou experiência no celular. Antes de falar em refazer tudo, precisamos entender o que você deseja melhorar."
  },
  sem_contatos: {
    title: "O problema pode não estar apenas no visual.",
    body: "Clareza da oferta, organização das informações, canal de entrada e próximo passo podem influenciar. A próxima resposta ajudará a identificar a prioridade."
  },
  instagram: {
    title: "O canal já cria uma porta de entrada.",
    body: "O Instagram pode continuar gerando atenção e proximidade. A oportunidade talvez esteja em organizar o interesse que ele já produz, sem tentar substituí-lo."
  },
  ads_nao_converte: {
    title: "Precisamos olhar o caminho completo.",
    body: "A dificuldade pode estar na continuidade entre anúncio, mensagem, página e ação esperada. Ainda é cedo para concluir a causa; primeiro vamos definir o objetivo."
  },
  lancamento: {
    title: "Existe uma nova oferta para organizar.",
    body: "Antes de escolher a página, precisamos compreender o que o público deve entender e qual ação fará sentido."
  },
  produtos_catalogo: {
    title: "As informações podem estar exigindo atendimento demais.",
    body: "Uma possibilidade é facilitar a descoberta dos produtos e preparar o pedido, sem transformar o projeto em loja virtual."
  },
  outro: {
    title: "Obrigado pelo contexto.",
    body: "Vou considerar sua descrição junto ao objetivo e à forma como os clientes chegam. A recomendação final deixará claro o que ainda precisa de conversa."
  }
};

export function getFeedback(question: Question, option: QuestionOption, lead: Lead): Feedback {
  if (question.id === "situation" && situationFeedback[option.id]) return situationFeedback[option.id];

  if (question.id === "goal" && lead.situacao === "instagram") {
    return {
      title: "Agora a oportunidade está mais clara.",
      body: `Hoje o Instagram já ajuda pessoas a encontrarem seu trabalho. Como a prioridade é ${humanLower(answerLabel("objetivo", option.id, lead.objetivoOutro))}, uma nova estrutura pode organizar melhor o que elas precisam compreender antes de avançar.`
    };
  }

  if (question.id === "channel") {
    return {
      title: "Entendi como o interesse começa.",
      body: `${option.ack} Vou relacionar esse caminho ao seu momento atual e ao objetivo principal, sem tentar substituir o que já funciona.`
    };
  }

  return {
    title: feedbackTitle(question.id),
    body: option.ack
  };
}

function feedbackTitle(questionId: string) {
  const titles: Record<string, string> = {
    business: "Entendi como tratar o projeto.",
    niche: "Esse contexto importa.",
    reach: "Agora sei quem a estrutura precisa atender.",
    goal: "A prioridade ficou mais clara.",
    "sales-model": "Entendi quanto contexto a decisão exige.",
    level: "O primeiro passo ganhou um limite.",
    budget: "Vou organizar a recomendação por etapas.",
    deadline: "Contexto suficiente para uma leitura inicial."
  };
  return titles[questionId] || "Entendi."
}

export function answerLabel(field: Question["field"], value: string, fallback = "") {
  if (fallback) return fallback;
  const question = questions.find((item) => item.field === field);
  return question?.options?.find((option) => option.id === value)?.label || value.replaceAll("_", " ") || "não informado";
}

export function getResultCopy(lead: Lead, result: RecommendationResult) {
  const business = lead.tipoNegocio === "indefinido" ? "seu projeto" : lead.negocio || "seu negócio";
  const situation = answerLabel("situacao", lead.situacao, lead.situacaoOutro);
  const objective = answerLabel("objetivo", lead.objetivo, lead.objetivoOutro);
  const channel = answerLabel("canal", lead.canal, lead.canalOutro);
  const decision = answerLabel("modeloVenda", lead.modeloVenda);

  return {
    title: `${lead.nome || "Você"}, organizei uma possível direção para ${business}.`,
    limit: "Esta leitura não substitui uma conversa, uma auditoria do que já existe ou uma análise do público e dos materiais. Ela serve para começar com mais contexto.",
    understood: `Hoje, o contexto que mais se aproxima da sua realidade é: ${humanLower(situation)}. Sua prioridade é ${humanLower(objective)}, e as pessoas chegam principalmente por ${humanLower(channel)}.`,
    challenge: challengeFor(lead),
    opportunity: `A oportunidade pode estar em tornar o caminho até ${humanLower(objective)} mais claro, preservando o papel de ${humanLower(channel)} no que já funciona.`,
    why: `Essa direção considera que ${humanLower(decision)}. O escopo deve acompanhar o nível de estrutura escolhido e ser confirmado com conteúdo, materiais e operação reais.`,
    notPriority: notPriorityFor(lead, result),
    proof: "A experiência com mais de 200 websites ajuda a reconhecer caminhos possíveis, mas não transforma esta leitura em resposta definitiva. Cada projeto ainda precisa considerar público, conteúdo, materiais e operação."
  };
}

function humanLower(value: string) {
  return value.toLowerCase()
    .replaceAll("whatsapp", "WhatsApp")
    .replaceAll("instagram", "Instagram")
    .replaceAll("google", "Google")
    .replaceAll("brasil", "Brasil");
}

function challengeFor(lead: Lead) {
  const messages: Record<string, string> = {
    sem_site: "O principal desafio pode ser definir uma primeira presença que cumpra uma função clara, sem tentar resolver tudo de uma vez.",
    site_desatualizado: "O principal desafio pode ser descobrir o que deixou de representar o negócio antes de decidir o que realmente precisa ser refeito.",
    sem_contatos: "O principal desafio talvez esteja na clareza da oferta e do próximo passo, e não apenas na aparência da página.",
    instagram: "O principal desafio pode ser aprofundar e organizar o interesse gerado nas redes sem depender delas para explicar todo o trabalho.",
    ads_nao_converte: "O principal desafio pode estar na continuidade entre promessa, página e ação. Isso precisa ser verificado antes de aumentar o investimento.",
    lancamento: "O principal desafio pode ser apresentar uma nova oferta com foco suficiente para o público entender e decidir.",
    produtos_catalogo: "O principal desafio pode ser organizar produtos e informações sem manter o atendimento preso a perguntas básicas."
  };
  return messages[lead.situacao] || "O principal desafio ainda precisa ser refinado, porque sua descrição não cabe por inteiro nas alternativas desta análise."
}

function notPriorityFor(lead: Lead, result: RecommendationResult) {
  if (result.recommendation.id === "catalogo") return "Loja virtual, checkout e pagamento on-line não parecem necessários para o objetivo informado. A primeira etapa pode organizar a vitrine e preparar o contato.";
  if (["essencial", "orientacao"].includes(lead.nivel) || result.recommendation.id === "mvp") return "Integrações e automações avançadas podem esperar até o processo principal estar claro.";
  if (lead.canal !== "trafego_pago") return "Uma estrutura complexa de rastreamento não precisa ser o primeiro passo. O essencial é medir as ações que orientam as próximas decisões.";
  return "O escopo final ainda precisa ser refinado antes de excluir qualquer parte importante."
}
