import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as relatorioService from "../services/relatorio.service";
import { buscarAlunoPorUsuarioId } from "../services/aluno.service";

const notaSchema = z.number().int().min(0).max(10);

const criarRelatorioSchema = z.object({
  mesReferencia: z.string().regex(/^\d{4}-\d{2}$/, "Use o formato YYYY-MM."),
  // Técnico
  tecControleBola: notaSchema,
  tecLevantamento: notaSchema,
  tecAtaque: notaSchema,
  tecSaque: notaSchema,
  tecRecepcao: notaSchema,
  tecDefesa: notaSchema,
  tecViradaBola: notaSchema,
  // Físico
  fisResistencia: notaSchema,
  fisVelocidade: notaSchema,
  fisAgilidade: notaSchema,
  fisCondicionamento: notaSchema,
  fisIntensidade: notaSchema,
  // Tático
  tatPosicionamento: notaSchema,
  tatTomadaDecisao: notaSchema,
  tatLeituraJogo: notaSchema,
  tatEstrategia: notaSchema,
  // Mental / Comportamental
  menComprometimento: notaSchema,
  menConcentracao: notaSchema,
  menDisciplina: notaSchema,
  menConfianca: notaSchema,
  menTrabalhoEquipe: notaSchema,
  pontosFortes: z.string().min(3, "Descreva os pontos fortes."),
  pontosMelhorar: z.string().min(3, "Descreva os pontos a melhorar."),
  objetivoProximoMes: z.string().min(3, "Descreva o objetivo do próximo mês."),
});

const atualizarRelatorioSchema = criarRelatorioSchema.omit({ mesReferencia: true }).partial();

export async function listarRelatoriosController(req: Request, res: Response, next: NextFunction) {
  try {
    const relatorios = await relatorioService.listarRelatoriosDoAluno(req.params.id);
    return res.status(200).json(relatorios);
  } catch (err) {
    return next(err);
  }
}

export async function criarRelatorioController(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = criarRelatorioSchema.parse(req.body);
    const relatorio = await relatorioService.criarRelatorio(req.params.id, dados);
    return res.status(201).json(relatorio);
  } catch (err) {
    return next(err);
  }
}

export async function atualizarRelatorioController(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = atualizarRelatorioSchema.parse(req.body);
    const relatorio = await relatorioService.atualizarRelatorio(req.params.relatorioId, dados);
    return res.status(200).json(relatorio);
  } catch (err) {
    return next(err);
  }
}

export async function removerRelatorioController(req: Request, res: Response, next: NextFunction) {
  try {
    await relatorioService.removerRelatorio(req.params.relatorioId);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

export async function meusRelatoriosController(req: Request, res: Response, next: NextFunction) {
  try {
    const aluno = await buscarAlunoPorUsuarioId(req.auth!.sub);
    const relatorios = await relatorioService.listarRelatoriosDoAluno(aluno.id);
    return res.status(200).json(relatorios);
  } catch (err) {
    return next(err);
  }
}
