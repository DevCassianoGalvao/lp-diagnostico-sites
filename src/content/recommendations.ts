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
    title: "Landing Page de Conversão",
    headline: "Uma página dedicada a uma oferta e a um próximo passo.",
    body: "Pode fazer sentido quando a pessoa chega com um interesse específico. A mensagem precisa continuar o que trouxe o visitante, esclarecer a oferta e facilitar a ação esperada.",
    structure: ["Contexto da oferta", "Problema", "Proposta", "Benefícios", "Provas reais", "Dúvidas", "Responsividade", "Formulário ou WhatsApp"],
    cta: "Quero conversar sobre esta página"
  },
  institucional: {
    id: "institucional",
    title: "Site Institucional Estratégico",
    headline: "Uma presença completa para organizar o negócio e facilitar o contato.",
    body: "Pode reunir posicionamento, serviços, provas e informações de contato sem transformar tudo em uma página genérica. O tamanho final depende do que o público precisa compreender.",
    structure: ["Página inicial", "Sobre", "Serviços", "Detalhes dos serviços", "Projetos reais", "Conteúdo", "Responsividade", "Contato", "Políticas"],
    cta: "Quero revisar esta estrutura profissional"
  },
  autoridade: {
    id: "autoridade",
    title: "Site de Autoridade e Conteúdo",
    headline: "Uma estrutura para tornar experiência, método e especialidade mais compreensíveis.",
    body: "A confiança pode ser construída com apresentação clara, histórico verificável, conteúdo útil e provas reais, sem depender de afirmações grandiosas.",
    structure: ["Posicionamento", "Perfil", "Método", "Especialidades", "Projetos reais", "Artigos", "Responsividade", "Dúvidas", "Contato"],
    cta: "Quero entender como organizar minha apresentação"
  },
  orcamento: {
    id: "orcamento",
    title: "Site de Serviços com Orçamento Orientado",
    headline: "Mais contexto antes da solicitação de orçamento.",
    body: "A estrutura pode apresentar os serviços e coletar informações que ajudam a preparar o atendimento. Os campos e a integração precisam acompanhar o processo comercial real.",
    structure: ["Serviços", "Áreas atendidas", "Provas reais", "Perguntas de contexto", "Responsividade", "Confirmação", "Organização dos contatos"],
    cta: "Quero revisar meu processo de orçamento"
  },
  agendamento: {
    id: "agendamento",
    title: "Site com Agendamento ou Pré-atendimento",
    headline: "Informação antes da agenda e organização depois do contato.",
    body: "Pode responder dúvidas, apresentar modalidades e preparar o agendamento. Regras, disponibilidade e eventuais integrações precisam ser confirmadas antes de definir a solução.",
    structure: ["Serviços", "Profissional ou equipe", "Dúvidas", "Pré-atendimento", "Responsividade", "Agenda", "Confirmação", "Contato"],
    cta: "Quero conversar sobre meu atendimento"
  },
  catalogo: {
    id: "catalogo",
    title: "Site-vitrine e Catálogo de Produtos",
    headline: "Uma vitrine organizada para facilitar a descoberta e preparar o pedido.",
    body: "Produtos, categorias e informações importantes podem ficar acessíveis antes do atendimento. A proposta não inclui loja virtual, checkout ou pagamento on-line nesta etapa.",
    structure: ["Página inicial", "Categorias", "Detalhes dos produtos", "Busca ou filtros", "Diferenciais", "Responsividade", "Formulário", "WhatsApp com contexto"],
    cta: "Quero organizar minha vitrine digital"
  },
  lancamento: {
    id: "lancamento",
    title: "Página de Lançamento, Evento ou Inscrição",
    headline: "Uma oferta organizada para uma decisão com contexto e prazo real.",
    body: "A página pode apresentar proposta, público, programa, responsáveis, provas e condições. Urgência só deve aparecer quando houver uma data ou limite verdadeiro.",
    structure: ["Apresentação", "Para quem é", "Benefícios", "Programa", "Responsáveis", "Provas reais", "Responsividade", "Dúvidas", "Formulário de inscrição"],
    cta: "Quero revisar esta nova oferta"
  },
  redesign: {
    id: "redesign",
    title: "Redesign e Otimização",
    headline: "Revisar o que existe antes de decidir o que deve mudar.",
    body: "O trabalho pode começar com uma auditoria de mensagem, navegação, celular, velocidade, provas, chamadas para ação e mensuração. Nem tudo precisa necessariamente ser refeito.",
    structure: ["Auditoria", "Arquitetura", "Texto", "Redesign", "Desenvolvimento", "Responsividade", "Migração", "Testes", "Mensuração"],
    cta: "Quero analisar o que deve ser atualizado"
  },
  funil: {
    id: "funil",
    title: "Site com Fluxo de Captação",
    headline: "Uma estrutura para receber contatos com contexto e organizar a continuidade.",
    body: "Além das páginas, o fluxo pode registrar respostas e preparar o atendimento. Classificação, avisos e integrações só devem entrar quando ajudarem o processo real.",
    structure: ["Site ou landing page", "Formulários", "Responsividade", "Organização dos contatos", "Marcadores", "Notificações", "Integrações", "Mensuração", "Exportação"],
    cta: "Quero organizar a chegada dos contatos"
  },
  mvp: {
    id: "mvp",
    title: "Primeira Estrutura Essencial",
    headline: "Uma base profissional limitada ao que precisa funcionar agora.",
    body: "A primeira versão pode apresentar a oferta principal, explicar por que confiar e facilitar o contato. O escopo deve permitir evolução sem fingir que todas as necessidades já foram resolvidas.",
    structure: ["Apresentação", "Oferta", "Benefícios", "Prova real", "Processo", "Responsividade", "Dúvidas", "Contato", "Mensuração básica"],
    cta: "Quero definir uma primeira etapa"
  }
};

export const modules = {
  seo_local: { title: "Ser encontrado na região", body: "Organizar serviços, localização e contato pode fortalecer a presença do negócio nas pesquisas locais." },
  mensuracao: { title: "Entender o caminho dos contatos", body: "Registrar as etapas principais ajuda a identificar onde as pessoas avançam ou encontram dificuldade." },
  crm: { title: "Receber solicitações com mais contexto", body: "Os contatos podem chegar com informações que ajudam a preparar o atendimento e reduzem perguntas repetidas." },
  autoridade: { title: "Construir confiança antes do contato", body: "Experiência, método e provas reais podem ajudar o visitante a compreender o trabalho." },
  rede_propria: { title: "Apoiar os canais que já funcionam", body: "A nova estrutura pode aprofundar o interesse gerado pelas redes sem tentar substituí-las." },
  conteudo: { title: "Responder dúvidas importantes", body: "Páginas e conteúdos podem apoiar quem pesquisa e compara antes de decidir." },
  automacao: { title: "Organizar tarefas repetitivas", body: "Confirmações e avisos podem apoiar o processo depois que o atendimento principal estiver definido." }
};
