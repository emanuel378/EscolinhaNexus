import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as rankingService from "../services/ranking.service";
import { buscarAlunoPorUsuarioId } from "../services/aluno.service";

const rankingQuerySchema = z.object({
  mesReferencia: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Use o formato YYYY-MM.")
    .optional(),
  turmaId: z.string().uuid().optional(),
});

export async function rankingController(req: Request, res: Response, next: NextFunction) {
  try {
    const { mesReferencia, turmaId } = rankingQuerySchema.parse(req.query);
    const ranking = await rankingService.calcularRanking({ mesReferencia, turmaId });
    return res.status(200).json(ranking);
  } catch (err) {
    return next(err);
  }
}

export async function meuRankingController(req: Request, res: Response, next: NextFunction) {
  try {
    const { mesReferencia } = rankingQuerySchema.pick({ mesReferencia: true }).parse(req.query);
    const aluno = await buscarAlunoPorUsuarioId(req.auth!.sub);
    const ranking = await rankingService.calcularRanking({
      mesReferencia,
      turmaId: aluno.turmaId ?? undefined,
    });
    return res.status(200).json(ranking);
  } catch (err) {
    return next(err);
  }
}
