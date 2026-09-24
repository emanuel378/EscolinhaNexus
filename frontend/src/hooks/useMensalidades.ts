import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as mensalidadeService from "../services/mensalidade.service";
import { AtualizarMensalidadeInput, CriarMensalidadeInput } from "../types";

function chaveAluno(alunoId: string) {
  return ["mensalidades", alunoId];
}

export function useMensalidadesDoAluno(alunoId: string) {
  return useQuery({
    queryKey: chaveAluno(alunoId),
    queryFn: () => mensalidadeService.listarMensalidadesDoAluno(alunoId),
    enabled: !!alunoId,
  });
}

export function useCriarMensalidade(alunoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarMensalidadeInput) =>
      mensalidadeService.criarMensalidade(alunoId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveAluno(alunoId) });
      queryClient.invalidateQueries({ queryKey: ["mensalidades", "pendentes"] });
    },
  });
}

export function useAtualizarMensalidade(alunoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: AtualizarMensalidadeInput }) =>
      mensalidadeService.atualizarMensalidade(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveAluno(alunoId) });
      queryClient.invalidateQueries({ queryKey: ["mensalidades", "pendentes"] });
    },
  });
}

export function useRemoverMensalidade(alunoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => mensalidadeService.removerMensalidade(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chaveAluno(alunoId) });
      queryClient.invalidateQueries({ queryKey: ["mensalidades", "pendentes"] });
    },
  });
}

export function useMensalidadesPendentes() {
  return useQuery({
    queryKey: ["mensalidades", "pendentes"],
    queryFn: mensalidadeService.contarMensalidadesPendentes,
  });
}

export function useMinhasMensalidades() {
  return useQuery({
    queryKey: ["mensalidades", "minhas"],
    queryFn: mensalidadeService.minhasMensalidades,
  });
}
