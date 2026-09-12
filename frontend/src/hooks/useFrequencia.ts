import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as frequenciaService from "../services/frequencia.service";
import { StatusFrequencia } from "../types";

export function useFichaDeChamada(treinoId: string) {
  return useQuery({
    queryKey: ["frequencias", "ficha", treinoId],
    queryFn: () => frequenciaService.buscarFichaDeChamada(treinoId),
    enabled: !!treinoId,
  });
}

export function useMarcarFrequencias(treinoId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (registros: { alunoId: string; status: StatusFrequencia }[]) =>
      frequenciaService.marcarFrequencias(treinoId, registros),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["frequencias", "ficha", treinoId] }),
  });
}

export function useHistoricoFrequenciaAluno(alunoId: string) {
  return useQuery({
    queryKey: ["frequencias", "historico", alunoId],
    queryFn: () => frequenciaService.buscarHistoricoFrequenciaAluno(alunoId),
    enabled: !!alunoId,
  });
}

export function useMinhaFrequencia() {
  return useQuery({
    queryKey: ["frequencias", "minha"],
    queryFn: frequenciaService.buscarMinhaFrequencia,
  });
}
