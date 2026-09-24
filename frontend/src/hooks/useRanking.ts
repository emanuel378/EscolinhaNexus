import { useQuery } from "@tanstack/react-query";
import * as rankingService from "../services/ranking.service";

export function useRanking(params: { mesReferencia?: string; turmaId?: string }) {
  return useQuery({
    queryKey: ["ranking", params],
    queryFn: () => rankingService.buscarRanking(params),
  });
}

export function useMeuRanking(params: { mesReferencia?: string }) {
  return useQuery({
    queryKey: ["ranking", "meu", params],
    queryFn: () => rankingService.buscarMeuRanking(params),
  });
}
