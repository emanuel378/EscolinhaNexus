import { api } from "./api";
import { AtualizarMensalidadeInput, CriarMensalidadeInput, Mensalidade } from "../types";

export async function listarMensalidadesDoAluno(alunoId: string): Promise<Mensalidade[]> {
  const { data } = await api.get<Mensalidade[]>(`/alunos/${alunoId}/mensalidades`);
  return data;
}

export async function criarMensalidade(
  alunoId: string,
  input: CriarMensalidadeInput
): Promise<Mensalidade> {
  const { data } = await api.post<Mensalidade>(`/alunos/${alunoId}/mensalidades`, input);
  return data;
}

export async function atualizarMensalidade(
  id: string,
  input: AtualizarMensalidadeInput
): Promise<Mensalidade> {
  const { data } = await api.put<Mensalidade>(`/mensalidades/${id}`, input);
  return data;
}

export async function removerMensalidade(id: string): Promise<void> {
  await api.delete(`/mensalidades/${id}`);
}

export async function contarMensalidadesPendentes(): Promise<number> {
  const { data } = await api.get<{ total: number }>("/mensalidades/pendentes/contagem");
  return data.total;
}
