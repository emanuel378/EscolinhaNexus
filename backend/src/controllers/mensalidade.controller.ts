import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as mensalidadeService from "../services/mensalidade.service";
import { buscarAlunoPorUsuarioId } from "../services/aluno.service";

const criarMensalidadeSchema = z.object({
  mesReferencia: z.string().regex(/^\d{4}-\d{2}$/, "Use o formato YYYY-MM."),
  valor: z.number().positive(),
  vencimento: z.coerce.date(),
  dataPagamento: z.coerce.date().optional(),
  status: z.enum(["pago", "pendente", "atrasado"]).optional(),
});

const atualizarMensalidadeSchema = z.object({
  valor: z.number().positive().optional(),
  vencimento: z.coerce.date().optional(),
  dataPagamento: z.coerce.date().nullable().optional(),
  status: z.enum(["pago", "pendente", "atrasado"]).optional(),
});

export async function listarMensalidadesController(req: Request, res: Response, next: NextFunction) {
  try {
    const mensalidades = await mensalidadeService.listarMensalidadesDoAluno(req.params.id);
    return res.status(200).json(mensalidades);
  } catch (err) {
    return next(err);
  }
}

export async function minhasMensalidadesController(req: Request, res: Response, next: NextFunction) {
  try {
    const aluno = await buscarAlunoPorUsuarioId(req.auth!.sub);
    const mensalidades = await mensalidadeService.listarMensalidadesDoAluno(aluno.id);
    return res.status(200).json(mensalidades);
  } catch (err) {
    return next(err);
  }
}

export async function criarMensalidadeController(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = criarMensalidadeSchema.parse(req.body);
    const mensalidade = await mensalidadeService.criarMensalidade(req.params.id, dados);
    return res.status(201).json(mensalidade);
  } catch (err) {
    return next(err);
  }
}

export async function atualizarMensalidadeController(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = atualizarMensalidadeSchema.parse(req.body);
    const mensalidade = await mensalidadeService.atualizarMensalidade(req.params.mensalidadeId, dados);
    return res.status(200).json(mensalidade);
  } catch (err) {
    return next(err);
  }
}

export async function removerMensalidadeController(req: Request, res: Response, next: NextFunction) {
  try {
    await mensalidadeService.removerMensalidade(req.params.mensalidadeId);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

export async function contarPendentesController(_req: Request, res: Response, next: NextFunction) {
  try {
    const total = await mensalidadeService.contarPendentes();
    return res.status(200).json({ total });
  } catch (err) {
    return next(err);
  }
}
