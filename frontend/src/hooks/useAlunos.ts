import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as alunoService from "../services/aluno.service";
import { AtualizarAlunoInput, CriarAlunoInput, StatusAluno } from "../types";

const ALUNOS_KEY = ["alunos"];

export function useAlunos(status?: StatusAluno) {
  return useQuery({
    queryKey: [...ALUNOS_KEY, status ?? "todos"],
    queryFn: () => alunoService.listarAlunos(status),
  });
}

export function useAluno(id: string) {
  return useQuery({
    queryKey: [...ALUNOS_KEY, id],
    queryFn: () => alunoService.buscarAluno(id),
    enabled: !!id,
  });
}

export function useCriarAluno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarAlunoInput) => alunoService.criarAluno(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ALUNOS_KEY }),
  });
}

export function useAtualizarAluno(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AtualizarAlunoInput) => alunoService.atualizarAluno(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ALUNOS_KEY }),
  });
}

export function useAlterarStatusAluno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: StatusAluno }) =>
      alunoService.alterarStatusAluno(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ALUNOS_KEY }),
  });
}

export function useRemoverAluno() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alunoService.removerAluno(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ALUNOS_KEY }),
  });
}
