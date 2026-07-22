export type PortfolioProject = {
  id: string;
  name: string;
  category: string;
  url: string;
  image: string;
  niches: string[];
  summary?: string;
  solutionType?: string;
  featured?: boolean;
};

export const nicheLabels: Record<string, string> = {
  saude: "Saúde e bem-estar",
  estetica: "Estética e beleza",
  juridico: "Jurídico",
  consultoria: "Serviços profissionais e consultoria",
  servico_local: "Serviços locais e manutenção",
  educacao: "Educação, cursos e eventos",
  imobiliario: "Imobiliário, arquitetura e construção",
  comercio: "Comércio, lojas físicas e marcas",
  tecnologia: "Tecnologia e software",
  outro: "Outro"
};

const project = (
  id: string,
  name: string,
  category: string,
  url: string,
  niches: string[],
  summary: string,
  solutionType = "Site profissional",
  featured = false
): PortfolioProject => ({
  id, name, category, url, niches, summary, solutionType, featured,
  image: `${import.meta.env.BASE_URL}assets/portfolio/${id}.webp?v=7`
});

export const portfolioProjects: PortfolioProject[] = [
  project("congressis", "Congressis", "Eventos", "https://congressis.com.br", ["educacao"], "Estrutura criada para apresentar o evento, organizar informações e facilitar inscrições.", "Site para evento", true),
  project("medplan", "Medplan Corretora", "Empresas", "https://medplancorretora.com", ["consultoria"], "Presença digital criada para explicar soluções e conduzir novos contatos.", "Site profissional", true),
  project("wm-suplementos", "WM Suplementos", "Comércio", "https://wmsuplementos.com.br", ["comercio"], "Vitrine criada para organizar produtos, diferenciais e formas de contato.", "Site com catálogo", true),
  project("dr-andre", "Dr. André Luiz Nogueira", "Saúde", "https://drandreluiznogueira.com.br", ["saude"], "Estrutura criada para apresentar especialidades e facilitar o contato.", "Site de autoridade", true),
  project("fred-peixoto", "Dr. Fred Peixoto", "Saúde", "https://fredpeixoto.com.br", ["saude"], "Site desenvolvido para comunicar especialidades e fortalecer a confiança.", "Site profissional", true),
  project("difalux", "Difalux", "Empresas", "https://difalux.com.br", ["servico_local", "consultoria"], "Site desenvolvido para organizar serviços, cobertura e pedidos de orçamento.", "Site de serviços", true),
  project("arthur-borges", "Arthur Borges Advocacia", "Jurídico", "https://arthurborgesadvocacia.com.br", ["juridico", "consultoria"], "Presença digital criada para fortalecer autoridade e explicar áreas de atuação.", "Site de autoridade", true),
  project("emanuelle-lima", "Emanuelle de Lima", "Jurídico", "https://emanuelledelimaadv.com.br", ["juridico"], "Estrutura focada em informação clara e contato responsável.", "Site jurídico"),
  project("beltrao", "Beltrão Advogados", "Jurídico", "https://beltraoadvogados.com/direitos-trabalhistas", ["juridico"], "Página criada para explicar um serviço jurídico com clareza.", "Site focado em contatos"),
  project("arthur-aeroporto", "Dr. Arthur Borges", "Jurídico", "https://arthurborgesadvocacia.com.br/dr-arthur-borges-aeroporto", ["juridico"], "Página profissional para apresentar atuação e facilitar o primeiro contato.", "Site profissional"),
  project("ivine-soares", "Dra. Ivine Soares", "Jurídico", "https://ivineesoaresadv.com.br/bpc-o-guia-definitivo-para-garantir-a-renda-da-pessoa-com-deficiencia", ["juridico"], "Conteúdo organizado para responder dúvidas e gerar confiança.", "Site de conteúdo"),
  project("ppv-advocacia", "PPV Advocacia", "Jurídico", "https://ppvadvocacia.com.br", ["juridico", "consultoria"], "Site institucional para apresentar equipe, atuação e formas de contato.", "Site profissional"),
  project("studio-milimetrica", "Studio Milimétrica", "Arquitetura", "https://studiomilimetrica.com.br", ["imobiliario", "servico_local"], "Portfólio criado para valorizar projetos e explicar o processo de trabalho.", "Site com portfólio", true),
  project("cmf-arts", "CMF Arts", "Empresas", "https://cmfarts.com.br", ["comercio", "outro"], "Site criado para apresentar produtos e identidade da marca.", "Site profissional"),
  project("b2-branding", "B2 Branding", "Empresas", "https://b2branding.site", ["consultoria", "outro"], "Presença digital criada para tornar método e serviços mais compreensíveis.", "Site de autoridade"),
  project("thony", "Thony Desentupidora", "Serviços", "https://thonydesentupidoraltda.com.br", ["servico_local"], "Site de serviço local com cobertura e contato em destaque.", "Site de serviços", true),
  project("dluk", "D'Luk Barbearia", "Serviços", "http://dlukbarbearia.com", ["servico_local", "estetica"], "Site criado para apresentar serviços, ambiente e facilitar agendamentos.", "Site profissional", true),
  project("recicle", "Recicle, Reutilize, Plante", "Empresas", "https://reciclereutilizeplante.com.br", ["comercio", "outro"], "Estrutura criada para explicar a iniciativa e organizar seus produtos.", "Site profissional"),
  project("mj-gesso", "MJ Gesso", "Empresas", "http://mjgesso.com.br", ["imobiliario", "servico_local"], "Site desenvolvido para mostrar serviços, projetos e pedidos de orçamento.", "Site de serviços", true),
  project("injeta-rj", "Injeta RJ", "Empresas", "https://injetarj.com.br", ["imobiliario", "servico_local"], "Estrutura profissional para explicar soluções e facilitar solicitações.", "Site de serviços"),
  project("marina-borja", "Marina Borja", "Profissionais", "https://marinaborja.com.br/mentorialapidar", ["consultoria"], "Página criada para apresentar método, entrega e próximo passo.", "Site focado em contatos"),
  project("gestor-weslen", "Gestor Weslen", "Profissionais", "https://gestorweslen.com.br", ["consultoria"], "Site desenvolvido para fortalecer autoridade e explicar serviços.", "Site de autoridade"),
  project("amanda-zanetti", "Amanda Zanetti", "Educação", "https://amandazanetti.com.br", ["educacao"], "Presença digital para apresentar experiência, conteúdos e cursos.", "Site de autoridade", true),
  project("amanda-pos", "Pós-graduação Amanda Zanetti", "Educação", "https://amandazanetti.com.br/pos-graduacao", ["educacao"], "Página criada para explicar programa, público e condições de participação.", "Site para curso"),
  project("maicon", "Maicon Gonçalves", "Política", "https://maicongoncalves.com.br", ["outro"], "Presença digital criada para organizar trajetória, propostas e contato.", "Site profissional", true)
];

export const availableNiches = [
  ...Object.entries(nicheLabels)
    .filter(([id]) => id !== "outro" && portfolioProjects.some((project) => project.niches.includes(id)))
    .map(([id, label]) => ({ id, label })),
  { id: "outro", label: nicheLabels.outro }
];

export const portfolioCategories = ["Todos", ...Array.from(new Set(portfolioProjects.map((item) => item.category)))];

export function getPortfolioForNiche(niche: string, limit = 3) {
  return portfolioProjects
    .filter((project) => project.niches.includes(niche === "outro" ? "outro" : niche))
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    .slice(0, limit);
}

export function getFullPortfolio(category = "Todos") {
  return category === "Todos" ? portfolioProjects : portfolioProjects.filter((project) => project.category === category);
}
