import { api } from "./api";
import { AtualizarTreinoInput, CriarTreinoInput, Treino } from "../types";

export async function listarTreinos(turmaId?: string): Promise<Treino[]> {
  const { data } = await api.get<Treino[]>("/treinos", { params: { turmaId } });
  return data;
}

export async function buscarTreino(id: string): Promise<Treino> {
  const { data } = await api.get<Treino>(`/treinos/${id}`);
  return data;
}

export async function criarTreino(input: CriarTreinoInput): Promise<Treino> {
  const { data } = await api.post<Treino>("/treinos", input);
  return data;
}

export async function atualizarTreino(id: string, input: AtualizarTreinoInput): Promise<Treino> {
  const { data } = await api.put<Treino>(`/treinos/${id}`, input);
  return data;
}

export async function removerTreino(id: string): Promise<void> {
  await api.delete(`/treinos/${id}`);
}
