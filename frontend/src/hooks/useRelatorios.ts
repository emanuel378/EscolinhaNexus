import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as relatorioService from "../services/relatorio.service";
import { AtualizarRelatorioInput, CriarRelatorioInput } from "../types";

function chaveAluno(alunoId: string) {
  return ["relatorios", alunoId];
}

export function useRelatoriosDoAluno(alunoId: string) {
  return useQuery({
    queryKey: chaveAluno(alunoId),
    queryFn: () => relatorioService.listarRelatoriosDoAluno(alunoId),
    enabled: !!alunoId,
  });
}

export function useCriarRelatorio(alunoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarRelatorioInput) => relatorioService.criarRelatorio(alunoId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaveAluno(alunoId) }),
  });
}

export function useAtualizarRelatorio(alunoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AtualizarRelatorioInput }) =>
      relatorioService.atualizarRelatorio(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaveAluno(alunoId) }),
  });
}

export function useRemoverRelatorio(alunoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => relatorioService.removerRelatorio(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaveAluno(alunoId) }),
  });
}

export function useMeusRelatorios() {
  return useQuery({
    queryKey: ["relatorios", "meus"],
    queryFn: relatorioService.buscarMeusRelatorios,
  });
}

export function useStatusRelatoriosDoMes(mesReferencia?: string) {
  return useQuery({
    queryKey: ["relatorios", "status", mesReferencia ?? "atual"],
    queryFn: () => relatorioService.buscarStatusRelatoriosDoMes(mesReferencia),
  });
}
