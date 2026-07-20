import { LeadKey } from "../state/lead-state";

export type QuestionOption = {
  id: string;
  label: string;
  ack: string;
  blockTitle?: string;
  blockBody?: string;
  tags?: string[];
  requiresText?: LeadKey;
};

export type Question = {
  id: string;
  field: LeadKey;
  title: string;
  help?: string;
  type: "text" | "email" | "tel" | "single" | "consent";
  placeholder?: string;
  options?: QuestionOption[];
  optional?: boolean;
  visibleWhen?: (lead: Record<string, unknown>) => boolean;
};

export const questions: Question[] = [
  {
    id: "name",
    field: "nome",
    title: "Como posso te chamar?",
    help: "Vou usar seu nome apenas nos momentos importantes desta conversa.",
    type: "text",
    placeholder: "Digite seu primeiro nome"
  },
  {
    id: "business",
    field: "negocio",
    title: "Qual e o nome do seu negocio ou projeto?",
    help: "Pode ser o nome da empresa, da marca ou do projeto que voce esta planejando.",
    type: "single",
    options: [
      {
        id: "empresa",
        label: "Vou informar o nome",
        ack: "Perfeito. A partir de agora, vamos pensar na presenca digital de {negocio}.",
        blockTitle: "Uma nova experiencia digital para {negocio}."
      },
      {
        id: "marca_pessoal",
        label: "Uso meu proprio nome",
        ack: "Entendi. Quando a marca e voce, o site precisa transformar experiencia e personalidade em confianca.",
        blockTitle: "Uma presenca digital a altura do trabalho de {nome}."
      },
      {
        id: "indefinido",
        label: "Ainda nao defini",
        ack: "Sem problema. Uma boa estrutura digital tambem pode ajudar a dar forma ao posicionamento do projeto.",
        blockTitle: "A estrutura digital do seu novo projeto."
      }
    ]
  },
  {
    id: "niche",
    field: "nicho",
    title: "Em qual area {negocio} atua?",
    help: "Escolha a opcao mais proxima. Se nao encaixar, use Outro.",
    type: "single",
    options: [
      { id: "saude", label: "Saude e bem-estar", ack: "Entendi. Na saude, o site precisa transmitir seguranca antes mesmo do primeiro contato.", blockTitle: "Confianca e parte do atendimento.", blockBody: "A presenca digital deve explicar especialidades com clareza, reduzir duvidas, apresentar credenciais e facilitar um contato responsavel.", tags: ["nicho_saude", "autoridade"] },
      { id: "estetica", label: "Estetica e beleza", ack: "Boa. Em estetica, o cliente primeiro precisa confiar no processo e se enxergar na transformacao.", blockTitle: "Desejo chama atencao. Confianca gera o contato.", blockBody: "O site deve unir apresentacao visual, explicacao segura dos servicos, provas reais e um caminho simples para avaliacao ou agendamento.", tags: ["nicho_estetica", "agendamento"] },
      { id: "juridico", label: "Juridico", ack: "Certo. No juridico, clareza e credibilidade precisam vir antes de qualquer chamada comercial.", blockTitle: "Informacao clara para decisoes importantes.", blockBody: "A estrutura deve apresentar areas de atuacao, metodo de atendimento e conteudo informativo com linguagem acessivel.", tags: ["nicho_juridico", "autoridade"] },
      { id: "consultoria", label: "Servicos profissionais e consultoria", ack: "Perfeito. Quando conhecimento e o produto, o site precisa tornar seu valor facil de entender.", blockTitle: "Sua experiencia precisa parecer tao valiosa quanto ela e.", blockBody: "O site deve organizar problemas, metodo, entregaveis e provas para transformar conhecimento abstrato em uma proposta concreta.", tags: ["nicho_consultoria", "crm"] },
      { id: "servico_local", label: "Servicos locais e manutencao", ack: "Otimo. Em servicos locais, o cliente quer respostas rapidas: o que voce faz, onde atende e por que confiar.", blockTitle: "Quem precisa do servico precisa encontrar e confiar rapido.", blockBody: "A pagina deve mostrar servicos, areas atendidas, provas do trabalho e uma forma simples de pedir orcamento pelo celular.", tags: ["seo_local", "orcamento"] },
      { id: "educacao", label: "Educacao, cursos e eventos", ack: "Entendi. Aqui, a pagina precisa transformar conteudo em uma promessa de aprendizado clara e confiavel.", blockTitle: "O publico precisa entender o valor antes de se inscrever.", blockBody: "A experiencia deve apresentar programa, responsaveis, publico indicado, condicoes de participacao e inscricao sem checkout na primeira versao.", tags: ["inscricao"] },
      { id: "imobiliario", label: "Imobiliario, arquitetura e construcao", ack: "Boa escolha. Nesse mercado, apresentacao e confianca influenciam decisoes de alto valor.", blockTitle: "Projetos importantes exigem uma presenca a altura.", blockBody: "O site deve valorizar imagens reais, organizar portfolio ou ofertas, explicar o processo e conduzir o visitante a uma conversa qualificada.", tags: ["portfolio", "crm"] },
      { id: "comercio", label: "Comercio, lojas fisicas e marcas", ack: "Entendi. Produtos precisam ficar faceis de conhecer, sem depender de uma loja virtual completa.", blockTitle: "Uma vitrine clara ajuda o cliente a escolher e entrar em contato.", blockBody: "A estrutura pode apresentar linhas, categorias, diferenciais, localizacao e formas de pedido por contato.", tags: ["catalogo"] },
      { id: "tecnologia", label: "Tecnologia e software", ack: "Perfeito. Produtos digitais precisam explicar algo complexo sem parecer complicados.", blockTitle: "Clareza reduz a distancia entre tecnologia e valor.", blockBody: "O site deve mostrar problema resolvido, funcionamento, casos de uso e proximo passo adequado ao estagio do cliente.", tags: ["b2b", "demo"] },
      { id: "outro", label: "Outro", ack: "Seu segmento nao precisa caber em uma caixa. Vou considerar sua descricao ao montar a recomendacao.", requiresText: "nichoOutro", tags: ["nicho_outro"] }
    ]
  },
  {
    id: "reach",
    field: "alcance",
    title: "Onde seus clientes ou pacientes estao?",
    type: "single",
    visibleWhen: (lead) => ["saude", "juridico", "consultoria", "servico_local", "imobiliario", "educacao", "comercio"].includes(String(lead.nicho)),
    options: [
      { id: "local", label: "Em uma cidade ou regiao proxima", ack: "Otimo. Para negocios locais, aparecer no momento certo e transmitir confianca rapidamente faz diferenca.", blockTitle: "Presenca local que transforma pesquisa em contato.", tags: ["seo_local"] },
      { id: "regional", label: "Em varias cidades da regiao", ack: "Entendi. Sua estrutura precisa comunicar cobertura sem parecer generica.", blockTitle: "Uma presenca regional com contexto local.", tags: ["seo_local"] },
      { id: "nacional", label: "Em todo o Brasil", ack: "Certo. Em atuacao nacional, posicionamento e diferenciacao precisam compensar a distancia.", blockTitle: "Autoridade que nao depende da localizacao.", tags: ["conteudo"] },
      { id: "online", label: "Atendimento 100% online", ack: "Perfeito. Nesse caso, o site e parte central da propria experiencia de atendimento ou venda.", blockTitle: "Do primeiro acesso ao proximo passo, tudo precisa funcionar online.", tags: ["agendamento"] },
      { id: "hibrido", label: "Local e online", ack: "Boa. Vamos equilibrar a confianca da presenca local com a escala do atendimento online.", blockTitle: "Proximo para quem esta perto e acessivel para quem esta longe.", tags: ["seo_local", "agendamento"] }
    ]
  },
  {
    id: "situation",
    field: "situacao",
    title: "Em qual momento o seu negocio esta hoje?",
    type: "single",
    options: [
      { id: "sem_site", label: "Ainda nao tenho site", ack: "Tudo bem. Comecar do zero permite construir a base certa sem carregar decisoes antigas.", blockTitle: "Comecar certo custa menos do que corrigir depois.", tags: ["mvp"] },
      { id: "site_desatualizado", label: "Tenho um site, mas ele esta desatualizado", ack: "Entendi. Um site antigo pode fazer um bom negocio parecer parado no tempo.", blockTitle: "Seu negocio evoluiu. A experiencia digital tambem precisa evoluir.", tags: ["redesign"] },
      { id: "sem_contatos", label: "Tenho site, mas quase nao recebo contatos", ack: "Esse e um sinal importante: presenca sem caminho de conversao vira apenas vitrine.", blockTitle: "Visita nao e resultado. O proximo passo precisa estar claro.", tags: ["conversao"] },
      { id: "instagram", label: "Dependo principalmente do Instagram", ack: "O Instagram ajuda a despertar interesse, mas nao deveria carregar sozinho toda a credibilidade e conversao.", blockTitle: "Rede social chama atencao. Uma estrutura propria consolida a decisao.", tags: ["rede_propria"] },
      { id: "ads_nao_converte", label: "Anuncio, mas a pagina nao converte", ack: "Antes de aumentar investimento, vale corrigir o caminho entre anuncio e acao.", blockTitle: "Trafego nao corrige uma pagina confusa.", tags: ["mensuracao"] },
      { id: "lancamento", label: "Quero lancar um novo servico, produto ou evento", ack: "Otimo. Um lancamento pede foco: uma oferta, uma audiencia e um proximo passo principal.", blockTitle: "Uma nova oferta precisa nascer com mensagem clara.", tags: ["lancamento"] },
      { id: "produtos_catalogo", label: "Tenho produtos, mas dependo de catalogo, redes ou atendimento manual", ack: "Entendi. Quando as informacoes ficam espalhadas, o cliente precisa perguntar ate o basico.", blockTitle: "Uma vitrine organizada reduz duvidas e melhora o atendimento.", tags: ["catalogo"] },
      { id: "outro", label: "Outro momento", ack: "Obrigado. Vou usar esse contexto como prioridade na recomendacao.", requiresText: "situacaoOutro" }
    ]
  },
  {
    id: "goal",
    field: "objetivo",
    title: "Se o novo site pudesse melhorar uma coisa primeiro, qual seria?",
    type: "single",
    options: [
      { id: "whatsapp", label: "Gerar contatos no WhatsApp", ack: "Perfeito. O objetivo nao sera apenas mostrar informacoes, mas preparar o visitante para iniciar uma conversa.", blockTitle: "Do interesse a conversa, sem desvio.", tags: ["whatsapp"] },
      { id: "orcamento", label: "Receber pedidos de orcamento", ack: "Entendi. Um bom orcamento comeca antes do contato, com informacoes que qualificam a solicitacao.", blockTitle: "Menos pedidos vagos. Mais oportunidades com contexto.", tags: ["orcamento", "crm"] },
      { id: "agendamento", label: "Agendar atendimentos ou reunioes", ack: "Otimo. A pagina precisa transformar confianca em uma agenda organizada, sem criar atrito.", blockTitle: "Clareza antes do agendamento. Organizacao depois do clique.", tags: ["agendamento"] },
      { id: "autoridade", label: "Fortalecer autoridade e credibilidade", ack: "Certo. Percepcao de valor precisa ser construida antes da chamada para contato.", blockTitle: "Autoridade nao e dizer que voce e bom. E tornar competencia visivel.", tags: ["autoridade"] },
      { id: "servicos", label: "Apresentar melhor meus servicos", ack: "Boa. Quando o visitante nao entende rapidamente o que voce faz, ate um bom servico parece dificil de contratar.", blockTitle: "Clareza transforma servico em oferta.", tags: ["institucional"] },
      { id: "catalogo", label: "Apresentar produtos e receber pedidos", ack: "Perfeito. A prioridade sera ajudar o visitante a encontrar o que procura e iniciar um pedido com clareza.", blockTitle: "Produtos organizados, informacoes claras e contato sem atrito.", tags: ["catalogo"] },
      { id: "inscricoes", label: "Captar inscricoes para curso ou evento", ack: "Entendi. A pagina precisa transformar interesse em decisao dentro de uma data e condicao especificas.", blockTitle: "Programa claro, confianca e urgencia legitima.", tags: ["lancamento"] },
      { id: "organizar_comercial", label: "Organizar meu processo comercial", ack: "Otimo. O site pode ser a porta de entrada de um processo mais organizado.", blockTitle: "O lead chega com contexto e a conversa comeca melhor preparada.", tags: ["crm"] },
      { id: "outro", label: "Outro objetivo", ack: "Entendi. Essa sera a prioridade da recomendacao, mesmo que a solucao combine mais de uma estrutura.", requiresText: "objetivoOutro" }
    ]
  },
  {
    id: "channel",
    field: "canal",
    title: "Como a maioria dos clientes encontra seu negocio hoje?",
    type: "single",
    options: [
      { id: "indicacao", label: "Indicacao", ack: "Indicacao e um otimo sinal de confianca. O site pode ajudar essa confianca a continuar quando a pessoa pesquisa por voce.", blockTitle: "A indicacao abre a porta. A presenca digital confirma a escolha.", tags: ["autoridade"] },
      { id: "instagram", label: "Instagram ou redes sociais", ack: "Entendi. O site pode organizar e aprofundar o interesse que comeca nas redes.", blockTitle: "O feed desperta curiosidade. A pagina ajuda a decidir.", tags: ["rede_propria"] },
      { id: "google", label: "Google e pesquisas", ack: "Otimo. Quem chega pelo Google costuma trazer uma intencao mais clara.", blockTitle: "Ser encontrado e apenas o primeiro passo. A resposta precisa convencer.", tags: ["conteudo", "seo_local"] },
      { id: "trafego_pago", label: "Trafego pago", ack: "Certo. Mensagem, velocidade, rastreamento e continuidade com o anuncio sao essenciais.", blockTitle: "Cada clique precisa encontrar a promessa que o trouxe ate aqui.", tags: ["mensuracao"] },
      { id: "prospeccao", label: "Prospeccao ativa", ack: "Entendi. O site pode funcionar como prova e aprofundamento depois do primeiro contato.", blockTitle: "A prospeccao inicia a conversa. O site reduz a desconfianca.", tags: ["autoridade"] },
      { id: "terceiros", label: "Marketplaces ou plataformas de terceiros", ack: "Esses canais podem trazer visibilidade, mas uma estrutura propria ajuda a manter relacao direta.", blockTitle: "Use canais de terceiros sem deixar toda sua presenca depender deles.", tags: ["catalogo"] },
      { id: "sem_canal", label: "Ainda nao tenho canal consistente", ack: "Sem problema. O site nao cria demanda sozinho, mas pode se tornar a base certa para comecar.", blockTitle: "Primeiro a base. Depois, os canais.", tags: ["mvp"] },
      { id: "outro", label: "Outro canal", ack: "Perfeito. Vou considerar esse canal no caminho de entrada e conversao.", requiresText: "canalOutro" }
    ]
  },
  {
    id: "sales-model",
    field: "modeloVenda",
    title: "O que normalmente acontece antes de alguem comprar ou contratar?",
    type: "single",
    options: [
      { id: "decisao_rapida", label: "A pessoa decide rapido e chama", ack: "Otimo. A pagina precisa responder o essencial sem atrasar uma decisao simples.", tags: ["whatsapp"] },
      { id: "pesquisa", label: "A pessoa compara opcoes e pesquisa bastante", ack: "Entendi. Nesse caso, esconder detalhes pode custar a oportunidade.", tags: ["conteudo", "autoridade"] },
      { id: "reuniao", label: "Precisa falar comigo ou participar de reuniao", ack: "Perfeito. O site deve preparar uma conversa melhor, nao substituir uma venda consultiva.", tags: ["crm"] },
      { id: "orcamento", label: "Precisa pedir orcamento", ack: "Certo. Quanto melhor o contexto coletado, mais rapido e preciso pode ser o orcamento.", tags: ["orcamento"] },
      { id: "produto_contato", label: "Escolhe um produto e entra em contato", ack: "Entendi. O site precisa facilitar a escolha e enviar a pessoa para o atendimento com contexto.", tags: ["catalogo"] },
      { id: "indefinido", label: "Ainda nao tenho processo definido", ack: "Tudo bem. A construcao do site pode ajudar a transformar venda improvisada em caminho claro.", tags: ["mvp"] }
    ]
  },
  {
    id: "level",
    field: "nivel",
    title: "Que nivel de estrutura faz sentido para este momento?",
    type: "single",
    options: [
      { id: "essencial", label: "Algo essencial para comecar certo", ack: "Boa. Vamos priorizar clareza, credibilidade e um proximo passo principal.", tags: ["mvp"] },
      { id: "personalizada", label: "Uma solucao profissional e personalizada", ack: "Perfeito. Estrategia, copy, design e desenvolvimento precisam trabalhar como um sistema.", tags: ["premium"] },
      { id: "completa", label: "Estrutura completa de captacao e organizacao", ack: "Entendi. Alem do site, vamos considerar rastreamento, qualificacao, integracoes e continuidade comercial.", tags: ["crm", "automacao"] },
      { id: "orientacao", label: "Ainda nao sei e quero orientacao", ack: "Essa e justamente a funcao da analise: separar o necessario agora do que pode vir depois.", tags: ["orientacao"] }
    ]
  },
  {
    id: "budget",
    field: "investimento",
    title: "Opcional: qual faixa voce imagina investir nesta primeira etapa?",
    help: "A faixa ajusta escopo, nao bloqueia sua recomendacao.",
    type: "single",
    optional: true,
    options: [
      { id: "ate_1500", label: "Ate R$ 1.500", ack: "Vou priorizar uma primeira etapa enxuta e mostrar o que pode evoluir depois." },
      { id: "1500_3000", label: "De R$ 1.500 a R$ 3.000", ack: "Essa faixa permite avaliar uma estrutura profissional com foco bem definido." },
      { id: "3000_6000", label: "De R$ 3.000 a R$ 6.000", ack: "Ja podemos considerar uma solucao mais completa e personalizada." },
      { id: "6000_plus", label: "Acima de R$ 6.000", ack: "Vou considerar uma estrutura mais completa, com etapas e possibilidade de evolucao." },
      { id: "indefinido", label: "Ainda nao defini", ack: "Sem problema. A recomendacao vai separar essencial, recomendado e segunda fase." }
    ]
  },
  {
    id: "deadline",
    field: "prazo",
    title: "Quando voce gostaria de colocar essa nova estrutura em andamento?",
    type: "single",
    options: [
      { id: "urgente", label: "O quanto antes", ack: "Vou destacar a primeira versao essencial e o caminho mais rapido para comecar com qualidade." },
      { id: "30d", label: "Nas proximas 4 semanas", ack: "Esse prazo permite organizar conteudo, design e desenvolvimento com cronograma claro." },
      { id: "90d", label: "Entre 1 e 3 meses", ack: "Podemos pensar no projeto com antecedencia e preparar materiais sem improviso." },
      { id: "pesquisa", label: "Ainda estou pesquisando", ack: "Sua recomendacao vai servir como referencia para comparar o que realmente importa." }
    ]
  }
];
