export type EtapaStatus =
  | "Não Iniciada"
  | "Em Andamento"
  | "Concluída"
  | "Documento Gerado"
  | "Aguardando retorno da área";

export interface PlanoDeAcao {
  id: string;
  code: string;
  title: string;
  description: string;
  area: string;
  created_at: string;
}

export interface Etapa {
  id: string;
  plan_id: string;
  step_number: number;
  description: string;
  tema: string;
  relacao_direta: string;
  area: string;
  prazo: string;
  status: EtapaStatus;
  documento_comprobatorio: string;
  drive_link: string;
  created_at: string;
}

export const STATUS_COLORS: Record<EtapaStatus, string> = {
  Concluída: "status-concluida",
  "Em Andamento": "status-em-andamento",
  "Não Iniciada": "status-nao-iniciada",
  "Documento Gerado": "status-documento",
  "Aguardando retorno da área": "status-aguardando",
};

export const STATUS_LIST: EtapaStatus[] = [
  "Não Iniciada",
  "Em Andamento",
  "Concluída",
  "Documento Gerado",
  "Aguardando retorno da área",
];
