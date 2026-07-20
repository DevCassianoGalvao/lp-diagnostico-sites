export type Recommendation = {
  id: string;
  title: string;
  headline: string;
  body: string;
  structure: string[];
  cta: string;
};

export const recommendations: Record<string, Recommendation> = {
  landing: {
    id: "landing",
    title: "Landing Page de Conversao",
    headline: "Uma pagina focada em transformar interesse em acao.",
    body: "A estrutura deve girar em torno de uma oferta principal, manter continuidade com o canal de entrada, responder objecoes e conduzir a um proximo passo claro.",
    structure: ["Hero", "Problema", "Solucao", "Beneficios", "Provas reais", "FAQ", "Formulario ou WhatsApp"],
    cta: "Quero planejar minha landing page"
  },
  institucional: {
    id: "institucional",
    title: "Site Institucional Estrategico",
    headline: "Uma presenca completa para explicar, provar e converter.",
    body: "O site organiza a empresa sem virar um catalogo confuso. Cada pagina tem funcao: posicionar, apresentar servicos, mostrar provas e facilitar o contato certo.",
    structure: ["Home", "Sobre", "Servicos", "Paginas de servico", "Cases", "Conteudo", "Contato", "Politicas"],
    cta: "Quero estruturar meu site profissional"
  },
  autoridade: {
    id: "autoridade",
    title: "Site de Autoridade e Conteudo",
    headline: "Transformar experiencia em autoridade visivel.",
    body: "O site mostra competencia por clareza, metodo, historico, conteudo e provas reais, sem transformar a pagina em autopromocao.",
    structure: ["Posicionamento", "Perfil", "Metodo", "Especialidades", "Cases", "Artigos", "FAQ", "Contato"],
    cta: "Quero fortalecer minha autoridade digital"
  },
  orcamento: {
    id: "orcamento",
    title: "Site de Servicos com Orcamento Inteligente",
    headline: "Mais contexto antes do orcamento. Menos tempo perdido depois.",
    body: "A estrutura apresenta servicos e coleta as informacoes que mudam a proposta, para o lead chegar ao WhatsApp com resumo pronto.",
    structure: ["Servicos", "Areas atendidas", "Provas", "Formulario condicional", "Confirmacao", "CRM simples"],
    cta: "Quero organizar meus pedidos de orcamento"
  },
  agendamento: {
    id: "agendamento",
    title: "Site com Agendamento ou Pre-atendimento",
    headline: "Preparar a decisao e organizar o atendimento.",
    body: "O site responde duvidas essenciais, apresenta modalidades e conduz a agendamento ou pre-atendimento com as informacoes certas.",
    structure: ["Servicos", "Profissional/equipe", "FAQ", "Triagem", "Agenda", "Confirmacao", "Contato"],
    cta: "Quero organizar meus agendamentos"
  },
  catalogo: {
    id: "catalogo",
    title: "Site-vitrine e Catalogo de Produtos",
    headline: "Uma vitrine organizada para facilitar a escolha e o pedido.",
    body: "Produtos, categorias, diferenciais e informacoes importantes ficam claros para o visitante avancar pelo WhatsApp, formulario ou atendimento comercial. Sem loja virtual na V1.",
    structure: ["Home", "Categorias", "Paginas de produto", "Busca ou filtros", "Diferenciais", "Formulario", "WhatsApp contextual"],
    cta: "Quero organizar meu catalogo digital"
  },
  lancamento: {
    id: "lancamento",
    title: "Pagina de Lancamento, Evento ou Inscricao",
    headline: "Uma oferta clara para uma decisao com prazo.",
    body: "A pagina apresenta transformacao, publico indicado, programa, responsaveis, provas, condicoes e inscricao. Urgencia apenas quando houver datas reais.",
    structure: ["Hero", "Para quem e", "Beneficios", "Programa", "Responsaveis", "Provas", "FAQ", "Formulario de inscricao"],
    cta: "Quero planejar meu lancamento"
  },
  redesign: {
    id: "redesign",
    title: "Redesign e Otimizacao",
    headline: "Preservar o que funciona e corrigir o que impede o avanco.",
    body: "O projeto comeca com auditoria da estrutura atual, revisando mensagem, navegacao, mobile, velocidade, provas, CTAs, formularios e mensuracao.",
    structure: ["Auditoria", "Arquitetura", "Copy", "Redesign", "Desenvolvimento", "Migracao", "Testes", "Rastreamento"],
    cta: "Quero uma analise do meu site atual"
  },
  funil: {
    id: "funil",
    title: "Site + Funil de Captacao",
    headline: "Uma estrutura que capta, organiza e prepara a proxima conversa.",
    body: "Alem das paginas, o fluxo registra respostas, classifica oportunidades, avisa a equipe e mede quais canais geram leads mais adequados.",
    structure: ["Site ou landing", "Formularios", "CRM", "Tags", "Notificacoes", "Integracoes", "Analytics", "Exportacao"],
    cta: "Quero estruturar meu funil digital"
  },
  mvp: {
    id: "mvp",
    title: "MVP Essencial",
    headline: "Comecar com o essencial, sem parecer improvisado.",
    body: "A primeira versao apresenta uma oferta principal, explica por que confiar, mostra uma prova real e facilita o contato, com base tecnica para evoluir.",
    structure: ["Hero", "Oferta", "Beneficios", "Prova", "Processo", "FAQ", "Contato", "Mensuracao basica"],
    cta: "Quero definir minha primeira versao"
  }
};

export const modules = {
  seo_local: {
    title: "SEO local",
    body: "Conectar servico e localizacao com paginas claras, desempenho, dados estruturados e caminhos rapidos para contato."
  },
  mensuracao: {
    title: "Trafego e mensuracao",
    body: "Registrar visualizacoes, inicio de formulario, contato e conversao para entender onde o funil esta funcionando."
  },
  crm: {
    title: "Qualificacao e CRM",
    body: "As respostas viram resumo, tags e status para evitar perguntas repetidas e preparar melhor a conversa."
  },
  autoridade: {
    title: "Autoridade",
    body: "Metodo, perfil, cases e conteudo demonstram competencia sem depender de frases grandiosas."
  },
  rede_propria: {
    title: "Rede social para estrutura propria",
    body: "As redes continuam atraindo atencao; o site organiza a decisao em um lugar estavel."
  },
  conteudo: {
    title: "Conteudo e SEO",
    body: "Paginas e artigos nascem de duvidas reais e sempre apontam para um proximo passo."
  },
  automacao: {
    title: "Automacao responsavel",
    body: "Confirmacoes, notificacoes e tags reduzem tarefas repetitivas sem automatizar a confianca."
  }
};
