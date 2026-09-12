import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as treinoService from "../services/treino.service";
import { AtualizarTreinoInput, CriarTreinoInput } from "../types";

const TREINOS_KEY = ["treinos"];

export function useTreinos(turmaId?: string) {
  return useQuery({
    queryKey: [...TREINOS_KEY, turmaId ?? "todos"],
    queryFn: () => treinoService.listarTreinos(turmaId),
  });
}

export function useTreino(id: string) {
  return useQuery({
    queryKey: [...TREINOS_KEY, id],
    queryFn: () => treinoService.buscarTreino(id),
    enabled: !!id,
  });
}

export function useCriarTreino() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CriarTreinoInput) => treinoService.criarTreino(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TREINOS_KEY }),
  });
}

export function useAtualizarTreino(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AtualizarTreinoInput) => treinoService.atualizarTreino(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TREINOS_KEY }),
  });
}

export function useRemoverTreino() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => treinoService.removerTreino(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TREINOS_KEY }),
  });
}
