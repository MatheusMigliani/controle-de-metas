import type { ApiTema, ApiSetor, ApiOverviewStats, ApiMarco, ApiResponse } from "./types";

const BASE = process.env.NEXT_PUBLIC_METAS_API;

export async function getTemas(): Promise<ApiTema[]> {
  const res = await fetch(`${BASE}/temas`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const json: ApiResponse<ApiTema[]> = await res.json();
  if (!json.success) throw new Error(json.error ?? "Erro ao buscar temas");
  return json.data;
}

export async function getOverviewStats(): Promise<ApiOverviewStats> {
  const res = await fetch(`${BASE}/stats/overview`, { next: { revalidate: 30 } });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const json: ApiResponse<ApiOverviewStats> = await res.json();
  if (!json.success) throw new Error(json.error ?? "Erro ao buscar estatísticas");
  return json.data;
}

export async function getMarcos(): Promise<ApiMarco[]> {
  const res = await fetch(`${BASE}/marcos`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const json: ApiResponse<ApiMarco[]> = await res.json();
  if (!json.success) throw new Error(json.error ?? "Erro ao buscar marcos");
  return json.data;
}

export async function getSetores(): Promise<ApiSetor[]> {
  const res = await fetch(`${BASE}/setores`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Erro ${res.status}`);
  const json: ApiResponse<ApiSetor[]> = await res.json();
  if (!json.success) throw new Error(json.error ?? "Erro ao buscar setores");
  return json.data;
}
