import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as treinoService from "../services/treino.service";

const criarTreinoSchema = z.object({
  turmaId: z.string().uuid(),
  data: z.coerce.date(),
  horaInicio: z.string().min(1),
  horaFim: z.string().min(1),
  local: z.string().min(1),
  tipo: z.string().min(1),
  observacao: z.string().optional(),
});

const atualizarTreinoSchema = z.object({
  turmaId: z.string().uuid().optional(),
  data: z.coerce.date().optional(),
  horaInicio: z.string().min(1).optional(),
  horaFim: z.string().min(1).optional(),
  local: z.string().min(1).optional(),
  tipo: z.string().min(1).optional(),
  observacao: z.string().optional(),
});

const listarQuerySchema = z.object({
  turmaId: z.string().uuid().optional(),
});

export async function listarTreinosController(req: Request, res: Response, next: NextFunction) {
  try {
    const { turmaId } = listarQuerySchema.parse(req.query);
    const treinos = await treinoService.listarTreinos(turmaId ? { turmaId } : undefined);
    return res.status(200).json(treinos);
  } catch (err) {
    return next(err);
  }
}

export async function buscarTreinoController(req: Request, res: Response, next: NextFunction) {
  try {
    const treino = await treinoService.buscarTreinoPorId(req.params.id);
    return res.status(200).json(treino);
  } catch (err) {
    return next(err);
  }
}

export async function criarTreinoController(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = criarTreinoSchema.parse(req.body);
    const treino = await treinoService.criarTreino(dados);
    return res.status(201).json(treino);
  } catch (err) {
    return next(err);
  }
}

export async function atualizarTreinoController(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = atualizarTreinoSchema.parse(req.body);
    const treino = await treinoService.atualizarTreino(req.params.id, dados);
    return res.status(200).json(treino);
  } catch (err) {
    return next(err);
  }
}

export async function removerTreinoController(req: Request, res: Response, next: NextFunction) {
  try {
    await treinoService.removerTreino(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
