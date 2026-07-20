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
    help: "Vou usar seu nome apenas em momentos importantes desta conversa.",
    type: "text",
    placeholder: "Digite seu primeiro nome"
  },
  {
    id: "business",
    field: "negocio",
    title: "Como você chama o seu negócio ou projeto?",
    help: "Pode ser o nome da empresa, da marca ou de uma ideia que ainda está sendo organizada.",
    type: "single",
    options: [
      {
        id: "empresa",
        label: "Vou informar o nome",
        ack: "Perfeito. A partir de agora, vamos pensar na presença digital de {negócio}.",
        blockTitle: "Uma nova experiência digital para {negócio}."
      },
      {
        id: "marca_pessoal",
        label: "Uso meu próprio nome",
        ack: "Entendi. Quando a marca e você, o site precisa transformar experiência e personalidade em confiança.",
        blockTitle: "Uma presença digital a altura do trabalho de {nome}."
      },
      {
        id: "indefinido",
        label: "Ainda não defini",
        ack: "Sem problema. Uma boa estrutura digital também pode ajudar a dar forma ao posicionamento do projeto.",
        blockTitle: "A estrutura digital do seu novo projeto."
      }
    ]
  },
  {
    id: "niche",
    field: "nicho",
    title: "Em qual área o seu negócio atua?",
    help: "Escolha a opção mais próxima. Ela não precisa descrever perfeitamente o seu trabalho.",
    type: "single",
    options: [
      { id: "saude", label: "Saúde e bem-estar", ack: "Entendi. Na saude, o site precisa transmitir segurança antes mesmo do primeiro contato.", blockTitle: "confiança e parte do atendimento.", blockBody: "A presença digital deve explicar especialidades com clareza, reduzir dúvidas, apresentar credenciais e facilitar um contato responsavel.", tags: ["nicho_saude", "autoridade"] },
      { id: "estetica", label: "Estética e beleza", ack: "Boa. Em estetica, o cliente primeiro precisa confiar no processo e se enxergar na transformação.", blockTitle: "Desejo chama atencao. confiança gera o contato.", blockBody: "O site deve unir apresentacao visual, explicacao segura dos serviços, provas reais e um caminho simples para avaliacao ou agendamento.", tags: ["nicho_estetica", "agendamento"] },
      { id: "juridico", label: "Jurídico", ack: "Certo. No juridico, clareza e credibilidade precisam vir antes de qualquer chamada comercial.", blockTitle: "Informacao clara para decisoes importantes.", blockBody: "A estrutura deve apresentar areas de atuacao, método de atendimento e conteúdo informativo com linguagem acessivel.", tags: ["nicho_juridico", "autoridade"] },
      { id: "consultoria", label: "Serviços profissionais e consultoria", ack: "Perfeito. Quando conhecimento é o produto, o site precisa tornar seu valor facil de entender.", blockTitle: "Sua experiência precisa parecer tao valiosa quanto ela e.", blockBody: "O site deve organizar problemas, método, entregaveis e provas para transformar conhecimento abstrato em uma proposta concreta.", tags: ["nicho_consultoria", "crm"] },
      { id: "servico_local", label: "Serviços locais e manutenção", ack: "Otimo. Em serviços locais, o cliente quer respostas rápidas: o que você faz, onde atende e por que confiar.", blockTitle: "Quem precisa do serviço precisa encontrar e confiar rápido.", blockBody: "A página deve mostrar serviços, areas atendidas, provas do trabalho e uma forma simples de pedir orçamento pelo celular.", tags: ["seo_local", "orcamento"] },
      { id: "educacao", label: "Educação, cursos e eventos", ack: "Entendi. Aqui, a página precisa transformar conteúdo em uma promessa de aprendizado clara e confiavel.", blockTitle: "O público precisa entender o valor antes de se inscrever.", blockBody: "A experiência deve apresentar programa, responsáveis, público indicado, condições de participação e inscrição sem checkout na primeira versão.", tags: ["inscricao"] },
      { id: "imobiliario", label: "Imobiliário, arquitetura e construção", ack: "Boa escolha. Nesse mercado, apresentacao e confiança influenciam decisoes de alto valor.", blockTitle: "Projetos importantes exigem uma presença a altura.", blockBody: "O site deve valorizar imagens reais, organizar portfolio ou ofertas, explicar o processo e conduzir o visitante a uma conversa qualificada.", tags: ["portfolio", "crm"] },
      { id: "comercio", label: "Comércio, lojas físicas e marcas", ack: "Entendi. Produtos precisam ficar faceis de conhecer, sem depender de uma loja virtual completa.", blockTitle: "Uma vitrine clara ajuda o cliente a escolher e entrar em contato.", blockBody: "A estrutura pode apresentar linhas, categorias, diferenciais, localização e formas de pedido por contato.", tags: ["catalogo"] },
      { id: "tecnologia", label: "Tecnologia e software", ack: "Perfeito. Produtos digitais precisam explicar algo complexo sem parecer complicados.", blockTitle: "Clareza reduz a distancia entre tecnologia e valor.", blockBody: "O site deve mostrar problema resolvido, funcionamento, casos de uso e proximo passo adequado ao estagio do cliente.", tags: ["b2b", "demo"] },
      { id: "outro", label: "Outro", ack: "Seu segmento não precisa caber em uma caixa. Vou considerar sua descricao ao montar a recomendação.", requiresText: "nichoOutro", tags: ["nicho_outro"] }
    ]
  },
  {
    id: "reach",
    field: "alcance",
    title: "Onde está a maior parte das pessoas que você atende?",
    help: "Isso ajuda a entender se localização, alcance ou atendimento on-line precisam influenciar a estrutura.",
    type: "single",
    visibleWhen: (lead) => ["saude", "juridico", "consultoria", "servico_local", "imobiliario", "educacao", "comercio"].includes(String(lead.nicho)),
    options: [
      { id: "local", label: "Em uma cidade ou região próxima", ack: "Otimo. Para negocios locais, aparecer no momento certo e transmitir confiança rapidamente faz diferenca.", blockTitle: "presença local que transforma pesquisa em contato.", tags: ["seo_local"] },
      { id: "regional", label: "Em varias cidades da regiao", ack: "Entendi. Sua estrutura precisa comunicar cobertura sem parecer genérica.", blockTitle: "Uma presença regional com contexto local.", tags: ["seo_local"] },
      { id: "nacional", label: "Em todo o Brasil", ack: "Certo. Em atuacao nacional, posicionamento e diferenciacao precisam compensar a distancia.", blockTitle: "Autoridade que não depende da localização.", tags: ["conteudo"] },
      { id: "online", label: "Atendimento 100% online", ack: "Perfeito. Nesse caso, o site é parte central da propria experiência de atendimento ou venda.", blockTitle: "Do primeiro acesso ao proximo passo, tudo precisa funcionar online.", tags: ["agendamento"] },
      { id: "hibrido", label: "Local e on-line", ack: "Boa. Vamos equilibrar a confiança da presença local com a escala do atendimento online.", blockTitle: "Proximo para quem está perto e acessivel para quem está longe.", tags: ["seo_local", "agendamento"] }
    ]
  },
  {
    id: "situation",
    field: "situacao",
    title: "Qual opção mais se aproxima do momento atual do seu negócio?",
    help: "Não existe resposta certa. Escolha a situação que melhor representa o principal desafio de hoje.",
    type: "single",
    options: [
      { id: "sem_site", label: "Ainda não tenho site", ack: "Tudo bem. Comecar do zero permite construir a base certa sem carregar decisoes antigas.", blockTitle: "Comecar certo custa menos do que corrigir depois.", tags: ["mvp"] },
      { id: "site_desatualizado", label: "Tenho um site, mas ele está desatualizado", ack: "Entendi. Um site antigo pode fazer um bom negócio parecer parado no tempo.", blockTitle: "Seu negócio evoluiu. A experiência digital também precisa evoluir.", tags: ["redesign"] },
      { id: "sem_contatos", label: "Tenho site, mas quase não recebo contatos", ack: "Esse é um sinal importante: presença sem caminho de conversão vira apenas vitrine.", blockTitle: "Visita não e resultado. O proximo passo precisa estar claro.", tags: ["conversao"] },
      { id: "instagram", label: "Dependo principalmente do Instagram", ack: "O Instagram ajuda a despertar interesse, mas não deveria carregar sozinho toda a credibilidade e conversão.", blockTitle: "Rede social chama atencao. Uma estrutura propria consolida a decisão.", tags: ["rede_propria"] },
      { id: "ads_nao_converte", label: "anúncio, mas a página não converte", ack: "Antes de aumentar investimento, vale corrigir o caminho entre anúncio e ação.", blockTitle: "tráfego não corrige uma página confusa.", tags: ["mensuracao"] },
      { id: "lancamento", label: "Quero lançar um novo serviço, produto ou evento", ack: "Otimo. Um lançamento pede foco: uma oferta, uma audiencia e um proximo passo principal.", blockTitle: "Uma nova oferta precisa nascer com mensagem clara.", tags: ["lancamento"] },
      { id: "produtos_catalogo", label: "Tenho produtos, mas dependo de catálogo, redes ou atendimento manual", ack: "Entendi. Quando as informações ficam espalhadas, o cliente precisa perguntar até o básico.", blockTitle: "Uma vitrine organizada reduz dúvidas e melhora o atendimento.", tags: ["catalogo"] },
      { id: "outro", label: "Outro momento", ack: "Obrigado. Vou usar esse contexto como prioridade na recomendação.", requiresText: "situacaoOutro" }
    ]
  },
  {
    id: "goal",
    field: "objetivo",
    title: "O que você mais gostaria de melhorar na sua presença digital?",
    help: "Escolha a prioridade principal. Outros objetivos podem entrar depois, sem tentar resolver tudo de uma vez.",
    type: "single",
    options: [
      { id: "whatsapp", label: "Gerar contatos no WhatsApp", ack: "Perfeito. O objetivo não sera apenas mostrar informações, mas preparar o visitante para iniciar uma conversa.", blockTitle: "Do interesse a conversa, sem desvio.", tags: ["whatsapp"] },
      { id: "orcamento", label: "Receber pedidos de orçamento", ack: "Entendi. Um bom orçamento comeca antes do contato, com informações que qualificam a solicitacao.", blockTitle: "Menos pedidos vagos. Mais oportunidades com contexto.", tags: ["orcamento", "crm"] },
      { id: "agendamento", label: "Agendar atendimentos ou reuniões", ack: "Otimo. A página precisa transformar confiança em uma agenda organizada, sem criar atrito.", blockTitle: "Clareza antes do agendamento. organização depois do clique.", tags: ["agendamento"] },
      { id: "autoridade", label: "Fortalecer autoridade e credibilidade", ack: "Certo. Percepcao de valor precisa ser construida antes da chamada para contato.", blockTitle: "Autoridade não e dizer que você e bom. E tornar competencia visivel.", tags: ["autoridade"] },
      { id: "servicos", label: "Apresentar melhor meus serviços", ack: "Boa. Quando o visitante não entende rapidamente o que você faz, até um bom serviço parece dificil de contratar.", blockTitle: "Clareza transforma serviço em oferta.", tags: ["institucional"] },
      { id: "catalogo", label: "Apresentar produtos e receber pedidos", ack: "Perfeito. A prioridade sera ajudar o visitante a encontrar o que procura e iniciar um pedido com clareza.", blockTitle: "Produtos organizados, informações claras e contato sem atrito.", tags: ["catalogo"] },
      { id: "inscricoes", label: "Captar inscrições para curso ou evento", ack: "Entendi. A página precisa transformar interesse em decisão dentro de uma data e condicao especificas.", blockTitle: "Programa claro, confiança e urgencia legitima.", tags: ["lancamento"] },
      { id: "organizar_comercial", label: "Organizar meu processo comercial", ack: "Otimo. O site pode ser a porta de entrada de um processo mais organizado.", blockTitle: "O lead chega com contexto e a conversa comeca melhor preparada.", tags: ["crm"] },
      { id: "outro", label: "Outro objetivo", ack: "Entendi. Essa sera a prioridade da recomendação, mesmo que a solução combine mais de uma estrutura.", requiresText: "objetivoOutro" }
    ]
  },
  {
    id: "channel",
    field: "canal",
    title: "Como as pessoas costumam conhecer o seu trabalho hoje?",
    help: "A ideia não é substituir o que já funciona, mas entender como uma nova estrutura poderia apoiar esse caminho.",
    type: "single",
    options: [
      { id: "indicacao", label: "Indicação", ack: "Indicação e um otimo sinal de confiança. O site pode ajudar essa confiança a continuar quando a pessoa pesquisa por você.", blockTitle: "A indicacao abre a porta. A presença digital confirma a escolha.", tags: ["autoridade"] },
      { id: "instagram", label: "Instagram ou redes sociais", ack: "Entendi. O site pode organizar e aprofundar o interesse que comeca nas redes.", blockTitle: "O feed desperta curiosidade. A página ajuda a decidir.", tags: ["rede_propria"] },
      { id: "google", label: "Google e pesquisas", ack: "Otimo. Quem chega pelo Google costuma trazer uma intencao mais clara.", blockTitle: "Ser encontrado e apenas o primeiro passo. A resposta precisa convencer.", tags: ["conteudo", "seo_local"] },
      { id: "trafego_pago", label: "Tráfego pago", ack: "Certo. Mensagem, velocidade, rastreamento e continuidade com o anúncio sao essenciais.", blockTitle: "Cada clique precisa encontrar a promessa que o trouxe até aqui.", tags: ["mensuracao"] },
      { id: "prospeccao", label: "Prospecção ativa", ack: "Entendi. O site pode funcionar como prova e aprofundamento depois do primeiro contato.", blockTitle: "A prospeccao inicia a conversa. O site reduz a desconfianca.", tags: ["autoridade"] },
      { id: "terceiros", label: "Marketplaces ou plataformas de terceiros", ack: "Esses canais podem trazer visibilidade, mas uma estrutura propria ajuda a manter relação direta.", blockTitle: "Use canais de terceiros sem deixar toda sua presença depender deles.", tags: ["catalogo"] },
      { id: "sem_canal", label: "Ainda não tenho canal consistente", ack: "Sem problema. O site não cria demanda sozinho, mas pode se tornar a base certa para comecar.", blockTitle: "Primeiro a base. Depois, os canais.", tags: ["mvp"] },
      { id: "outro", label: "Outro canal", ack: "Perfeito. Vou considerar esse canal no caminho de entrada e conversão.", requiresText: "canalOutro" }
    ]
  },
  {
    id: "sales-model",
    field: "modeloVenda",
    title: "O que costuma acontecer antes de alguém contratar ou fazer um pedido?",
    help: "Isso ajuda a entender quanto contexto a pessoa precisa antes de conversar com você.",
    type: "single",
    options: [
      { id: "decisao_rapida", label: "A pessoa decide rápido e chama", ack: "Otimo. A página precisa responder o essencial sem atrasar uma decisão simples.", tags: ["whatsapp"] },
      { id: "pesquisa", label: "A pessoa compara opções e pesquisa bastante", ack: "Entendi. Nesse caso, esconder detalhes pode custar a oportunidade.", tags: ["conteudo", "autoridade"] },
      { id: "reuniao", label: "Precisa falar comigo ou participar de reunião", ack: "Perfeito. O site deve preparar uma conversa melhor, não substituir uma venda consultiva.", tags: ["crm"] },
      { id: "orcamento", label: "Precisa pedir orçamento", ack: "Certo. Quanto melhor o contexto coletado, mais rápido e preciso pode ser o orçamento.", tags: ["orcamento"] },
      { id: "produto_contato", label: "Escolhe um produto e entra em contato", ack: "Entendi. O site precisa facilitar a escolha e enviar a pessoa para o atendimento com contexto.", tags: ["catalogo"] },
      { id: "indefinido", label: "Ainda não tenho processo definido", ack: "Tudo bem. A construcao do site pode ajudar a transformar venda improvisada em caminho claro.", tags: ["mvp"] }
    ]
  },
  {
    id: "level",
    field: "nivel",
    title: "O que você espera desta primeira etapa?",
    help: "A recomendação pode separar o que é essencial agora do que pode ser desenvolvido depois.",
    type: "single",
    options: [
      { id: "essencial", label: "Uma base essencial para começar", ack: "Boa. Vamos priorizar clareza, credibilidade e um proximo passo principal.", tags: ["mvp"] },
      { id: "personalizada", label: "Uma solução profissional e personalizada", ack: "Perfeito. Estrategia, copy, design e desenvolvimento precisam trabalhar como um sistema.", tags: ["premium"] },
      { id: "completa", label: "Estrutura de captação e organização", ack: "Entendi. além do site, vamos considerar rastreamento, qualificacao, integrações e continuidade comercial.", tags: ["crm", "automacao"] },
      { id: "orientacao", label: "Ainda não sei e quero orientação", ack: "Essa é justamente a funcao da análise: separar o necessário agora do que pode vir depois.", tags: ["orientacao"] }
    ]
  },
  {
    id: "budget",
    field: "investimento",
    title: "Opcional: você já definiu uma faixa para esta primeira etapa?",
    help: "Essa informação serve apenas para organizar prioridades. Você pode continuar sem responder.",
    type: "single",
    optional: true,
    options: [
      { id: "ate_1500", label: "Até R$ 1.500", ack: "Vou priorizar uma primeira etapa enxuta e mostrar o que pode evoluir depois." },
      { id: "1500_3000", label: "De R$ 1.500 a R$ 3.000", ack: "Essa faixa permite avaliar uma estrutura profissional com foco bem definido." },
      { id: "3000_6000", label: "De R$ 3.000 a R$ 6.000", ack: "já podemos considerar uma solução mais completa e personalizada." },
      { id: "6000_plus", label: "Acima de R$ 6.000", ack: "Vou considerar uma estrutura mais completa, com etapas e possibilidade de evolução." },
      { id: "indefinido", label: "Ainda não defini", ack: "Sem problema. A recomendação vai separar essencial, recomendado e segunda fase." }
    ]
  },
  {
    id: "deadline",
    field: "prazo",
    title: "Quando você gostaria de começar a organizar esse projeto?",
    help: "O prazo final ainda depende do escopo, dos materiais e das integrações necessárias.",
    type: "single",
    options: [
      { id: "urgente", label: "O quanto antes", ack: "Vou destacar a primeira versão essencial e o caminho mais rápido para comecar com qualidade." },
      { id: "30d", label: "Nas próximas 4 semanas", ack: "Esse prazo permite organizar conteúdo, design e desenvolvimento com cronograma claro." },
      { id: "90d", label: "Entre 1 e 3 meses", ack: "Podemos pensar no projeto com antecedencia e preparar materiais sem improviso." },
      { id: "pesquisa", label: "Ainda estou pesquisando", ack: "Sua recomendação vai servir como referencia para comparar o que realmente importa." }
    ]
  }
];
