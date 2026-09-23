import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as relatorioService from "../services/relatorio.service";
import { EnviarRelatorioInput } from "../types";

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

export function useMeusRelatorios() {
  return useQuery({
    queryKey: ["relatorios", "me"],
    queryFn: relatorioService.meusRelatorios,
  });
}

export function useEnviarRelatorio(alunoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EnviarRelatorioInput) => relatorioService.enviarRelatorio(alunoId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveAluno(alunoId) });
    },
  });
}

export function useRemoverRelatorio(alunoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => relatorioService.removerRelatorio(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveAluno(alunoId) });
    },
  });
}
