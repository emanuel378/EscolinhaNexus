import { api } from "./api";
import { AtualizarTurmaInput, CriarTurmaInput, Turma } from "../types";

export async function listarTurmas(): Promise<Turma[]> {
  const { data } = await api.get<Turma[]>("/turmas");
  return data;
}

export async function buscarTurma(id: string): Promise<Turma> {
  const { data } = await api.get<Turma>(`/turmas/${id}`);
  return data;
}

export async function criarTurma(input: CriarTurmaInput): Promise<Turma> {
  const { data } = await api.post<Turma>("/turmas", input);
  return data;
}

export async function atualizarTurma(id: string, input: AtualizarTurmaInput): Promise<Turma> {
  const { data } = await api.put<Turma>(`/turmas/${id}`, input);
  return data;
}

export async function removerTurma(id: string): Promise<void> {
  await api.delete(`/turmas/${id}`);
}
