export type PortfolioProject = {
  id: string;
  name: string;
  category: string;
  url: string;
  image: string;
  niches: string[];
};

const project = (
  id: string,
  name: string,
  category: string,
  url: string,
  niches: string[]
): PortfolioProject => ({ id, name, category, url, image: `/assets/portfolio/${id}.webp?v=2`, niches });

export const portfolioProjects: PortfolioProject[] = [
  project("congressis", "Congressis", "Eventos", "https://congressis.com.br", ["educacao"]),
  project("medplan", "Medplan Corretora", "Empresas", "https://medplancorretora.com", ["consultoria"]),
  project("wm-suplementos", "WM Suplementos", "Empresas", "https://wmsuplementos.com.br", ["comercio"]),
  project("dr-andre", "Dr. André Luiz Nogueira", "Saúde", "https://drandreluiznogueira.com.br", ["saude"]),
  project("fred-peixoto", "Dr. Fred Peixoto", "Saúde", "https://fredpeixoto.com.br", ["saude"]),
  project("difalux", "Difalux", "Empresas", "https://difalux.com.br", ["servico_local", "consultoria"]),
  project("arthur-borges", "Arthur Borges Advocacia", "Jurídico", "https://arthurborgesadvocacia.com.br", ["juridico", "consultoria"]),
  project("emanuelle-lima", "Emanuelle de Lima", "Jurídico", "https://emanuelledelimaadv.com.br", ["juridico"]),
  project("beltrao", "Beltrão Advogados", "Jurídico", "https://beltraoadvogados.com/direitos-trabalhistas", ["juridico"]),
  project("arthur-aeroporto", "Dr. Arthur Borges", "Jurídico", "https://arthurborgesadvocacia.com.br/dr-arthur-borges-aeroporto", ["juridico"]),
  project("ivine-soares", "Dra. Ivine Soares", "Jurídico", "https://ivineesoaresadv.com.br/bpc-o-guia-definitivo-para-garantir-a-renda-da-pessoa-com-deficiencia", ["juridico"]),
  project("ppv-advocacia", "PPV Advocacia", "Jurídico", "https://ppvadvocacia.com.br", ["juridico", "consultoria"]),
  project("studio-milimetrica", "Studio Milimétrica", "Arquitetura", "https://studiomilimetrica.com.br", ["imobiliario", "servico_local"]),
  project("cmf-arts", "CMF Arts", "Empresas", "https://cmfarts.com.br", ["comercio", "outro"]),
  project("b2-branding", "B2 Branding", "Empresas", "https://b2branding.site", ["consultoria", "outro"]),
  project("clube-fruta", "Clube da Fruta", "Empresas", "https://clubedafruta.com", ["comercio"]),
  project("thony", "Thony Desentupidora", "Serviços", "https://thonydesentupidoraltda.com.br", ["servico_local"]),
  project("lord-balkon", "Lord Balkon", "Empresas", "https://lp.lordbalkon.com.br", ["servico_local", "imobiliario"]),
  project("dluk", "D'Luk Barbearia", "Serviços", "http://dlukbarbearia.com", ["servico_local", "estetica"]),
  project("recicle", "Recicle, Reutilize, Plante", "Empresas", "https://reciclereutilizeplante.com.br", ["comercio", "outro"]),
  project("mj-gesso", "MJ Gesso", "Empresas", "http://mjgesso.com.br", ["imobiliario", "servico_local"]),
  project("injeta-rj", "Injeta RJ", "Empresas", "https://injetarj.com.br", ["imobiliario", "servico_local"]),
  project("beemote", "Beemote Motores", "Empresas", "https://beemotemotores.com.br", ["comercio", "outro"]),
  project("automatique", "Automatique Chat", "Tecnologia", "https://automatiquechat.com.br", ["tecnologia"]),
  project("marina-borja", "Marina Borja", "Profissionais", "https://marinaborja.com.br/mentorialapidar", ["consultoria"]),
  project("gestor-weslen", "Gestor Weslen", "Profissionais", "https://gestorweslen.com.br", ["consultoria"]),
  project("dutra-investir", "Dutra Investir", "Finanças", "https://dutrainvestireparatodos.com.br", ["consultoria"]),
  project("amanda-zanetti", "Amanda Zanetti", "Educação", "https://amandazanetti.com.br", ["educacao"]),
  project("educacao-positiva", "Instituto Educação Positiva", "Educação", "https://educacaopositiva.net", ["educacao"]),
  project("amanda-pos", "Pós-graduação Amanda Zanetti", "Educação", "https://amandazanetti.com.br/pos-graduacao", ["educacao"]),
  project("maicon", "Maicon Gonçalves", "Educação", "https://maicongoncalves.com.br", ["educacao"])
];

export const portfolioCategories = [
  "Todos",
  ...Array.from(new Set(portfolioProjects.map((item) => item.category)))
];

export function getPortfolioForNiche(niche: string) {
  return [...portfolioProjects].sort((a, b) => (
    Number(b.niches.includes(niche)) - Number(a.niches.includes(niche))
  ));
}
