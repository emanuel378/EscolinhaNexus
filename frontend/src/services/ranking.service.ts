import { api } from "./api";
import { Ranking } from "../types";

export async function buscarRanking(params: {
  mesReferencia?: string;
  turmaId?: string;
}): Promise<Ranking> {
  const { data } = await api.get<Ranking>("/ranking", { params });
  return data;
}

export async function buscarMeuRanking(params: { mesReferencia?: string }): Promise<Ranking> {
  const { data } = await api.get<Ranking>("/alunos/me/ranking", { params });
  return data;
}
