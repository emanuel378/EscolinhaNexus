import { api } from "./api";
import { DashboardResumo } from "../types";

export async function buscarResumoDashboard(): Promise<DashboardResumo> {
  const { data } = await api.get<DashboardResumo>("/dashboard/resumo");
  return data;
}
