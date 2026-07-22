export type Lead = {
  leadId: string;
  nome: string;
  negocio: string;
  tipoNegocio: "" | "empresa" | "marca_pessoal" | "indefinido";
  nicho: string;
  nichoOutro: string;
  alcance: string;
  cidade: string;
  situacao: string;
  situacaoOutro: string;
  visibilidadeGoogle: string;
  objetivo: string;
  objetivoOutro: string;
  canal: string;
  canalOutro: string;
  modeloVenda: string;
  nivel: string;
  investimento: string;
  caminhoProjeto: string;
  prazo: string;
  whatsapp: string;
  email: string;
  instagram: string;
  consentimento: boolean;
};

export const initialLead: Lead = {
  leadId: "",
  nome: "",
  negocio: "",
  tipoNegocio: "",
  nicho: "",
  nichoOutro: "",
  alcance: "",
  cidade: "",
  situacao: "",
  situacaoOutro: "",
  visibilidadeGoogle: "",
  objetivo: "",
  objetivoOutro: "",
  canal: "",
  canalOutro: "",
  modeloVenda: "",
  nivel: "",
  investimento: "",
  caminhoProjeto: "",
  prazo: "",
  whatsapp: "",
  email: "",
  instagram: "",
  consentimento: false
};

export function createInitialLead(): Lead {
  const randomId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return { ...initialLead, leadId: randomId };
}

export type LeadKey = keyof Lead;
