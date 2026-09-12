import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as turmaService from "../services/turma.service";

const criarTurmaSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório."),
  horarios: z.string().min(2, "Horários são obrigatórios."),
});

const atualizarTurmaSchema = z.object({
  nome: z.string().min(2).optional(),
  horarios: z.string().min(2).optional(),
});

export async function listarTurmasController(_req: Request, res: Response, next: NextFunction) {
  try {
    const turmas = await turmaService.listarTurmas();
    return res.status(200).json(turmas);
  } catch (err) {
    return next(err);
  }
}

export async function buscarTurmaController(req: Request, res: Response, next: NextFunction) {
  try {
    const turma = await turmaService.buscarTurmaPorId(req.params.id);
    return res.status(200).json(turma);
  } catch (err) {
    return next(err);
  }
}

export async function criarTurmaController(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = criarTurmaSchema.parse(req.body);
    const turma = await turmaService.criarTurma(dados);
    return res.status(201).json(turma);
  } catch (err) {
    return next(err);
  }
}

export async function atualizarTurmaController(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = atualizarTurmaSchema.parse(req.body);
    const turma = await turmaService.atualizarTurma(req.params.id, dados);
    return res.status(200).json(turma);
  } catch (err) {
    return next(err);
  }
}

export async function removerTurmaController(req: Request, res: Response, next: NextFunction) {
  try {
    await turmaService.removerTurma(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
