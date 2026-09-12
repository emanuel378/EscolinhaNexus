import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as pontuacaoService from "../services/pontuacao.service";
import { LancarPontuacaoInput } from "../types";

function chaveAluno(alunoId: string) {
  return ["pontuacoes", alunoId];
}

export function usePontuacoesDoAluno(alunoId: string) {
  return useQuery({
    queryKey: chaveAluno(alunoId),
    queryFn: () => pontuacaoService.listarPontuacoesDoAluno(alunoId),
    enabled: !!alunoId,
  });
}

export function useLancarPontuacao(alunoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LancarPontuacaoInput) => pontuacaoService.lancarPontuacao(alunoId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaveAluno(alunoId) }),
  });
}

export function useRemoverPontuacao(alunoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => pontuacaoService.removerPontuacao(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chaveAluno(alunoId) }),
  });
}

export function useMinhasPontuacoes() {
  return useQuery({
    queryKey: ["pontuacoes", "minhas"],
    queryFn: pontuacaoService.buscarMinhasPontuacoes,
  });
}
