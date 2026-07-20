import { RecommendationResult } from "../rules/recommendation-engine";
import { Lead } from "../state/lead-state";

export function getResultCopy(lead: Lead, result: RecommendationResult) {
  return {
    title: `${lead.nome || "Você"}, este é um bom ponto de partida para ${businessName(lead)}.`,
    limit: "Esta é uma leitura inicial. Antes de fechar o escopo, ainda precisamos olhar o seu público, o conteúdo disponível e o que já existe no projeto.",
    understood: `${situationSentence(lead)} ${objectiveSentence(lead)} ${channelSentence(lead)}`,
    challenge: challengeSentence(lead),
    opportunity: opportunitySentence(lead),
    why: `${decisionSentence(lead)} ${levelSentence(lead)}`,
    notPriority: notPriorityFor(lead, result),
    proof: "A experiência com mais de 200 websites ajuda a reconhecer caminhos, mas não substitui uma conversa sobre o seu negócio. A recomendação final ainda depende do público, do conteúdo, dos materiais e da sua rotina de atendimento."
  };
}

function businessName(lead: Lead) {
  if (lead.tipoNegocio === "marca_pessoal") return "o seu trabalho";
  if (lead.tipoNegocio === "indefinido") return "o seu projeto";
  return lead.negocio || "o seu negócio";
}

function situationSentence(lead: Lead) {
  const sentences: Record<string, string> = {
    sem_site: "Hoje você ainda não tem um site, então estamos construindo o ponto de partida, não corrigindo uma estrutura antiga.",
    site_desatualizado: "Seu negócio evoluiu, mas o site atual parece ter ficado para trás.",
    sem_contatos: "Você já tem um site, mas ele ainda não ajuda as pessoas a darem o próximo passo.",
    instagram: "Hoje boa parte da sua presença está concentrada no Instagram.",
    ads_nao_converte: "Você já investe para atrair visitas, mas esse interesse não está virando contatos como deveria.",
    lancamento: "Existe uma nova oferta que precisa ser apresentada de forma simples e convincente.",
    produtos_catalogo: "Seus produtos existem, mas as informações ainda estão espalhadas e exigem atendimento demais.",
    outro: lead.situacaoOutro ? `O momento que você descreveu foi: ${lead.situacaoOutro}.` : "Seu momento atual precisa de uma leitura mais individual."
  };
  return sentences[lead.situacao] || "Seu projeto está em um momento de organização da presença digital.";
}

function objectiveSentence(lead: Lead) {
  const sentences: Record<string, string> = {
    whatsapp: "A prioridade agora é transformar esse interesse em conversas pelo WhatsApp.",
    orcamento: "O que você mais precisa é receber pedidos de orçamento com informações melhores.",
    agendamento: "A prioridade é facilitar o agendamento sem deixar dúvidas importantes para depois.",
    autoridade: "Neste momento, o mais importante é fazer o seu trabalho transmitir a confiança que ele já merece.",
    servicos: "O foco é ajudar as pessoas a entenderem seus serviços sem depender de uma explicação individual.",
    catalogo: "A prioridade é organizar os produtos para que as pessoas encontrem o que procuram e saibam como pedir.",
    inscricoes: "O objetivo é apresentar a oferta com clareza e facilitar a inscrição.",
    organizar_comercial: "O foco é fazer os contatos chegarem mais organizados e com contexto.",
    outro: lead.objetivoOutro ? `O resultado que você busca é ${lowerFirst(lead.objetivoOutro)}.` : "O objetivo ainda precisa ser detalhado em uma conversa."
  };
  return sentences[lead.objetivo] || "O primeiro objetivo ainda precisa ser refinado.";
}

function channelSentence(lead: Lead) {
  const sentences: Record<string, string> = {
    indicacao: "Como a indicação já abre a porta, o site precisa confirmar essa boa impressão quando alguém pesquisar por você.",
    instagram: "O site pode aprofundar o interesse que nasce nas redes, sem tentar ocupar o lugar delas.",
    google: "Como muitas pessoas chegam pesquisando, elas precisam encontrar respostas claras logo no primeiro acesso.",
    trafego_pago: "Quem chega pelo anúncio precisa encontrar a mesma promessa e um caminho direto para agir.",
    prospeccao: "Depois do primeiro contato da prospecção, a página pode funcionar como confirmação e prova.",
    terceiros: "A nova estrutura pode dar mais autonomia ao negócio sem abandonar os canais de terceiros que já trazem visibilidade.",
    sem_canal: "Como ainda não existe um canal consistente, a primeira estrutura deve ser simples o bastante para apoiar os próximos testes.",
    outro: lead.canalOutro ? `Hoje as pessoas chegam principalmente por ${lowerFirst(lead.canalOutro)}.` : "O canal de entrada ainda precisa ser entendido melhor."
  };
  return sentences[lead.canal] || "O caminho usado pelas pessoas para chegar até você ainda precisa ser detalhado.";
}

function challengeSentence(lead: Lead) {
  const sentences: Record<string, string> = {
    sem_site: "Antes de pensar em quantidade de páginas, precisamos decidir o que essa primeira presença deve resolver. Começar enxuto pode ser mais inteligente do que tentar prever tudo.",
    site_desatualizado: "O cuidado aqui é não refazer tudo por impulso. Primeiro precisamos separar o que ainda funciona do que prejudica a mensagem, a navegação ou o contato.",
    sem_contatos: "Mudar apenas o visual provavelmente não basta. Precisamos entender onde a pessoa perde clareza, confiança ou vontade de entrar em contato.",
    instagram: "As redes despertam interesse, mas não são o melhor lugar para explicar tudo. O desafio é dar profundidade à decisão sem criar mais trabalho para você.",
    ads_nao_converte: "Antes de colocar mais dinheiro em tráfego, precisamos descobrir onde a promessa se quebra: no anúncio, na página, na oferta ou no próximo passo.",
    lancamento: "Uma oferta nova costuma querer dizer muitas coisas ao mesmo tempo. O desafio é escolher a mensagem que realmente ajuda o público a decidir.",
    produtos_catalogo: "O desafio é organizar variedade e detalhes sem transformar a navegação em uma lista cansativa ou levar tudo de volta para o atendimento manual."
  };
  return sentences[lead.situacao] || "Ainda falta entender com mais profundidade o que está travando o projeto. Essa é uma das primeiras coisas que a conversa precisa esclarecer.";
}

function opportunitySentence(lead: Lead) {
  const sentences: Record<string, string> = {
    whatsapp: "A página pode responder o essencial antes do clique e fazer a conversa começar com uma pessoa mais segura e bem informada.",
    orcamento: "Podemos preparar o pedido antes que ele chegue, coletando apenas as informações que realmente ajudam você a avaliar e responder.",
    agendamento: "A experiência pode explicar o atendimento, reduzir inseguranças e levar para a agenda quem já entendeu o próximo passo.",
    autoridade: "Em vez de afirmar autoridade, a estrutura pode demonstrá-la com método, experiência, conteúdo e provas reais.",
    servicos: "Podemos transformar cada serviço em uma escolha mais fácil de entender: para quem é, que problema atende e como a conversa começa.",
    catalogo: "Uma vitrine organizada pode reduzir perguntas básicas, facilitar comparações e levar o cliente ao atendimento já sabendo o que procura.",
    inscricoes: "Uma página focada pode reunir proposta, programa, datas e condições para que a decisão aconteça sem informações espalhadas.",
    organizar_comercial: "O site pode preparar o contato e entregar um resumo útil para que você continue a conversa do ponto certo."
  };
  return sentences[lead.objetivo] || "A oportunidade é transformar o objetivo descrito em um caminho mais simples para quem visita e mais prático para quem atende.";
}

function decisionSentence(lead: Lead) {
  const sentences: Record<string, string> = {
    decisao_rapida: "Como a decisão costuma ser rápida, a estrutura precisa chegar ao ponto sem esconder o que gera confiança.",
    pesquisa: "Como as pessoas pesquisam e comparam, a estrutura precisa oferecer profundidade sem dificultar a navegação.",
    reuniao: "Como a contratação depende de conversa, o site deve preparar uma reunião melhor, não tentar substituir a venda consultiva.",
    orcamento: "Como o orçamento depende de contexto, vale organizar as informações antes de levar a pessoa ao atendimento.",
    produto_contato: "Como a pessoa escolhe antes de chamar, ela precisa explorar os produtos com clareza e levar essa escolha para a conversa.",
    indefinido: "Como o processo comercial ainda não está definido, a primeira versão também deve ajudar a testar um caminho simples."
  };
  return sentences[lead.modeloVenda] || "A forma de decisão do cliente ainda precisa ser confirmada.";
}

function levelSentence(lead: Lead) {
  const sentences: Record<string, string> = {
    essencial: "Por isso, faz sentido começar pelo essencial e deixar as evoluções para depois.",
    personalizada: "A primeira etapa pode ser personalizada, mas ainda precisa manter prioridades claras.",
    completa: "Uma estrutura mais completa pode fazer sentido, desde que cada integração resolva uma necessidade real do processo.",
    orientacao: "O melhor agora é separar o indispensável do que pode esperar, antes de fechar qualquer escopo."
  };
  return sentences[lead.nivel] || "O tamanho da primeira etapa deve ser confirmado antes de fechar o escopo.";
}

function notPriorityFor(lead: Lead, result: RecommendationResult) {
  if (result.recommendation.id === "catalogo") return "Loja virtual, checkout e pagamento on-line não parecem necessários agora. Primeiro vale organizar a vitrine e tornar o pedido mais simples.";
  if (["essencial", "orientacao"].includes(lead.nivel) || result.recommendation.id === "mvp") return "Integrações e automações avançadas podem esperar. Primeiro precisamos fazer o caminho principal funcionar bem.";
  if (lead.canal !== "trafego_pago") return "Uma estrutura complexa de rastreamento não precisa ser o primeiro passo. Podemos medir as ações essenciais e ampliar depois, se os dados pedirem.";
  return "Ainda não é hora de excluir partes importantes do escopo. A conversa precisa confirmar onde está o problema antes dessa decisão.";
}

function lowerFirst(value: string) {
  const text = value.trim();
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}
