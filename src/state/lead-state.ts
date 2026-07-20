export type Lead = {
  nome: string;
  negocio: string;
  tipoNegocio: "" | "empresa" | "marca_pessoal" | "indefinido";
  nicho: string;
  nichoOutro: string;
  alcance: string;
  cidade: string;
  situacao: string;
  situacaoOutro: string;
  objetivo: string;
  objetivoOutro: string;
  canal: string;
  canalOutro: string;
  modeloVenda: string;
  nivel: string;
  investimento: string;
  prazo: string;
  whatsapp: string;
  email: string;
  consentimento: boolean;
};

export const initialLead: Lead = {
  nome: "",
  negocio: "",
  tipoNegocio: "",
  nicho: "",
  nichoOutro: "",
  alcance: "",
  cidade: "",
  situacao: "",
  situacaoOutro: "",
  objetivo: "",
  objetivoOutro: "",
  canal: "",
  canalOutro: "",
  modeloVenda: "",
  nivel: "",
  investimento: "",
  prazo: "",
  whatsapp: "",
  email: "",
  consentimento: false
};

export type LeadKey = keyof Lead;
