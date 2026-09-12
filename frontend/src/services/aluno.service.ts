import { api } from "./api";
import { Aluno, AtualizarAlunoInput, CriarAlunoInput, StatusAluno } from "../types";

export async function listarAlunos(status?: StatusAluno): Promise<Aluno[]> {
  const { data } = await api.get<Aluno[]>("/alunos", { params: { status } });
  return data;
}

export async function buscarAluno(id: string): Promise<Aluno> {
  const { data } = await api.get<Aluno>(`/alunos/${id}`);
  return data;
}

export async function meuPerfil(): Promise<Aluno> {
  const { data } = await api.get<Aluno>("/alunos/me");
  return data;
}

export async function criarAluno(input: CriarAlunoInput): Promise<Aluno> {
  const { data } = await api.post<Aluno>("/alunos", input);
  return data;
}

export async function atualizarAluno(id: string, input: AtualizarAlunoInput): Promise<Aluno> {
  const { data } = await api.put<Aluno>(`/alunos/${id}`, input);
  return data;
}

export async function alterarStatusAluno(id: string, status: StatusAluno): Promise<Aluno> {
  const { data } = await api.patch<Aluno>(`/alunos/${id}/status`, { status });
  return data;
}

export async function removerAluno(id: string): Promise<void> {
  await api.delete(`/alunos/${id}`);
}
