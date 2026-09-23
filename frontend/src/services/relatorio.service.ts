import { api } from "./api";
import { EnviarRelatorioInput, Relatorio } from "../types";

export async function listarRelatoriosDoAluno(alunoId: string): Promise<Relatorio[]> {
  const { data } = await api.get<Relatorio[]>(`/alunos/${alunoId}/relatorios`);
  return data;
}

export async function meusRelatorios(): Promise<Relatorio[]> {
  const { data } = await api.get<Relatorio[]>("/alunos/me/relatorios");
  return data;
}

export async function enviarRelatorio(
  alunoId: string,
  input: EnviarRelatorioInput
): Promise<Relatorio> {
  const { data } = await api.post<Relatorio>(`/alunos/${alunoId}/relatorios`, input);
  return data;
}

export async function removerRelatorio(id: string): Promise<void> {
  await api.delete(`/relatorios/${id}`);
}
