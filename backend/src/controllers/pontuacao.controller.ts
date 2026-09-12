import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as pontuacaoService from "../services/pontuacao.service";
import { buscarAlunoPorUsuarioId } from "../services/aluno.service";

const lancarPontuacaoSchema = z.object({
  pontos: z.number().int(),
  motivo: z.string().min(3, "Informe o motivo da pontuação."),
  data: z.coerce.date().optional(),
});

export async function listarPontuacoesController(req: Request, res: Response, next: NextFunction) {
  try {
    const pontuacoes = await pontuacaoService.listarPontuacoesDoAluno(req.params.id);
    return res.status(200).json(pontuacoes);
  } catch (err) {
    return next(err);
  }
}

export async function lancarPontuacaoController(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = lancarPontuacaoSchema.parse(req.body);
    const pontuacao = await pontuacaoService.lancarPontuacao(req.params.id, dados);
    return res.status(201).json(pontuacao);
  } catch (err) {
    return next(err);
  }
}

export async function removerPontuacaoController(req: Request, res: Response, next: NextFunction) {
  try {
    await pontuacaoService.removerPontuacao(req.params.pontuacaoId);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

export async function minhasPontuacoesController(req: Request, res: Response, next: NextFunction) {
  try {
    const aluno = await buscarAlunoPorUsuarioId(req.auth!.sub);
    const pontuacoes = await pontuacaoService.listarPontuacoesDoAluno(aluno.id);
    return res.status(200).json(pontuacoes);
  } catch (err) {
    return next(err);
  }
}
