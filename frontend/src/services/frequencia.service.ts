import { api } from "./api";
import { FichaChamadaItem, HistoricoFrequencia, StatusFrequencia } from "../types";

export async function buscarFichaDeChamada(treinoId: string): Promise<FichaChamadaItem[]> {
  const { data } = await api.get<FichaChamadaItem[]>(`/treinos/${treinoId}/frequencias`);
  return data;
}

export async function marcarFrequencias(
  treinoId: string,
  registros: { alunoId: string; status: StatusFrequencia }[]
): Promise<void> {
  await api.put(`/treinos/${treinoId}/frequencias`, { registros });
}

export async function buscarHistoricoFrequenciaAluno(alunoId: string): Promise<HistoricoFrequencia> {
  const { data } = await api.get<HistoricoFrequencia>(`/alunos/${alunoId}/frequencias`);
  return data;
}

export async function buscarMinhaFrequencia(): Promise<HistoricoFrequencia> {
  const { data } = await api.get<HistoricoFrequencia>("/alunos/me/frequencias");
  return data;
}
