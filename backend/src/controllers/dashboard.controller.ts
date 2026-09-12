import { Request, Response, NextFunction } from "express";
import * as dashboardService from "../services/dashboard.service";

export async function resumoDashboardController(_req: Request, res: Response, next: NextFunction) {
  try {
    const resumo = await dashboardService.buscarResumoDashboard();
    return res.status(200).json(resumo);
  } catch (err) {
    return next(err);
  }
}
