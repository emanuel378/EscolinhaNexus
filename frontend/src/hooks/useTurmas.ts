import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as turmaService from "../services/turma.service";
import { AtualizarTurmaInput, CriarTurmaInput } from "../types";

const TURMAS_KEY = ["turmas"];

export function useTurmas() {
  return useQuery({ queryKey: TURMAS_KEY, queryFn: turmaService.listarTurmas });
}

export function useTurma(id: string) {
  return useQuery({
    queryKey: [...TURMAS_KEY, id],
    queryFn: () => turmaService.buscarTurma(id),
    enabled: !!id,
  });
}

export function useCriarTurma() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarTurmaInput) => turmaService.criarTurma(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TURMAS_KEY }),
  });
}

export function useAtualizarTurma(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AtualizarTurmaInput) => turmaService.atualizarTurma(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TURMAS_KEY }),
  });
}

export function useRemoverTurma() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => turmaService.removerTurma(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TURMAS_KEY }),
  });
}
