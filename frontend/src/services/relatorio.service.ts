import { api } from "./api";
import { AtualizarRelatorioInput, CriarRelatorioInput, Relatorio } from "../types";

export async function listarRelatoriosDoAluno(alunoId: string): Promise<Relatorio[]> {
  const { data } = await api.get<Relatorio[]>(`/alunos/${alunoId}/relatorios`);
  return data;
}

export async function criarRelatorio(
  alunoId: string,
  input: CriarRelatorioInput
): Promise<Relatorio> {
  const { data } = await api.post<Relatorio>(`/alunos/${alunoId}/relatorios`, input);
  return data;
}

export async function atualizarRelatorio(
  id: string,
  input: AtualizarRelatorioInput
): Promise<Relatorio> {
  const { data } = await api.put<Relatorio>(`/relatorios/${id}`, input);
  return data;
}

export async function removerRelatorio(id: string): Promise<void> {
  await api.delete(`/relatorios/${id}`);
}

export async function buscarMeusRelatorios(): Promise<Relatorio[]> {
  const { data } = await api.get<Relatorio[]>("/alunos/me/relatorios");
  return data;
}
