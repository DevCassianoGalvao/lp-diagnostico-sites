export type PortfolioProject = {
  id: string;
  name: string;
  category: string;
  url: string;
  image: string;
  niches: string[];
};

export const portfolioProjects: PortfolioProject[] = [
  {
    id: "congressis",
    name: "Congressis",
    category: "Evento e saúde",
    url: "https://congressis.com.br/",
    image: "/assets/portfolio/congressis.webp",
    niches: ["educacao", "saude", "outro"]
  },
  {
    id: "dr-andre",
    name: "Dr. André Luiz Nogueira",
    category: "Saúde",
    url: "https://drandreluiznogueira.com.br",
    image: "/assets/portfolio/dr-andre.webp",
    niches: ["saude", "estetica"]
  },
  {
    id: "arthur-borges",
    name: "Arthur Borges Advocacia",
    category: "Jurídico",
    url: "https://arthurborgesadvocacia.com.br",
    image: "/assets/portfolio/arthur-borges.webp",
    niches: ["juridico", "consultoria"]
  },
  {
    id: "difalux",
    name: "Difalux",
    category: "Empresas",
    url: "https://difalux.com.br",
    image: "/assets/portfolio/difalux.webp",
    niches: ["servico_local", "consultoria", "outro"]
  },
  {
    id: "ubra",
    name: "UBRA",
    category: "Tecnologia",
    url: "https://ubraapp.com",
    image: "/assets/portfolio/ubra.webp",
    niches: ["tecnologia", "comercio"]
  },
  {
    id: "studio-milimetrica",
    name: "Studio Milimétrica",
    category: "Arquitetura",
    url: "https://studiomilimetrica.com.br",
    image: "/assets/portfolio/studio-milimetrica.webp",
    niches: ["imobiliario", "servico_local"]
  },
  {
    id: "ppv-advocacia",
    name: "PPV Advocacia",
    category: "Jurídico",
    url: "https://ppvadvocacia.com.br",
    image: "/assets/portfolio/ppv-advocacia.webp",
    niches: ["juridico", "consultoria"]
  }
];

export function getPortfolioForNiche(niche: string, limit = portfolioProjects.length) {
  return [...portfolioProjects]
    .sort((a, b) => Number(b.niches.includes(niche)) - Number(a.niches.includes(niche)))
    .slice(0, limit);
}
