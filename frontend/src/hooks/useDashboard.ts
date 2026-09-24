import { useQuery } from "@tanstack/react-query";
import * as dashboardService from "../services/dashboard.service";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard", "resumo"],
    queryFn: dashboardService.buscarResumoDashboard,
  });
}
