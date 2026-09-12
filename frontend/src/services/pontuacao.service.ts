import { api } from "./api";
import { HistoricoPontuacao, LancarPontuacaoInput, Pontuacao } from "../types";

export async function listarPontuacoesDoAluno(alunoId: string): Promise<HistoricoPontuacao> {
  const { data } = await api.get<HistoricoPontuacao>(`/alunos/${alunoId}/pontuacoes`);
  return data;
}

export async function lancarPontuacao(
  alunoId: string,
  input: LancarPontuacaoInput
): Promise<Pontuacao> {
  const { data } = await api.post<Pontuacao>(`/alunos/${alunoId}/pontuacoes`, input);
  return data;
}

export async function removerPontuacao(id: string): Promise<void> {
  await api.delete(`/pontuacoes/${id}`);
}

export async function buscarMinhasPontuacoes(): Promise<HistoricoPontuacao> {
  const { data } = await api.get<HistoricoPontuacao>("/alunos/me/pontuacoes");
  return data;
}
