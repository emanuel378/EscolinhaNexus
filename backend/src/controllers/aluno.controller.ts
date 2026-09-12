import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as alunoService from "../services/aluno.service";
import * as treinoService from "../services/treino.service";
import * as frequenciaService from "../services/frequencia.service";
import * as historicoService from "../services/historico.service";

const criarAlunoSchema = z.object({
  nome: z.string().min(2, "Nome é obrigatório."),
  email: z.string().email("Email inválido."),
  senha: z.string().min(6, "Senha deve ter ao menos 6 caracteres."),
  dataNascimento: z.coerce.date(),
  telefone: z.string().optional(),
  dataEntrada: z.coerce.date().optional(),
  turmaId: z.string().uuid().optional(),
  fotoUrl: z.string().url().optional(),
});

const atualizarAlunoSchema = z.object({
  nome: z.string().min(2).optional(),
  email: z.string().email().optional(),
  dataNascimento: z.coerce.date().optional(),
  telefone: z.string().optional(),
  dataEntrada: z.coerce.date().optional(),
  turmaId: z.string().uuid().nullable().optional(),
  fotoUrl: z.string().url().optional(),
  status: z.enum(["ativo", "inativo"]).optional(),
});

const statusSchema = z.object({
  status: z.enum(["ativo", "inativo"]),
});

const listarQuerySchema = z.object({
  status: z.enum(["ativo", "inativo"]).optional(),
});

const calendarioQuerySchema = z.object({
  mes: z.string().regex(/^\d{4}-\d{2}$/, "Use o formato YYYY-MM."),
});

export async function listarAlunosController(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = listarQuerySchema.parse(req.query);
    const alunos = await alunoService.listarAlunos(status ? { status } : undefined);
    return res.status(200).json(alunos);
  } catch (err) {
    return next(err);
  }
}

export async function meuPerfilAlunoController(req: Request, res: Response, next: NextFunction) {
  try {
    const aluno = await alunoService.buscarAlunoPorUsuarioId(req.auth!.sub);
    return res.status(200).json(aluno);
  } catch (err) {
    return next(err);
  }
}

export async function meuProximoTreinoController(req: Request, res: Response, next: NextFunction) {
  try {
    const aluno = await alunoService.buscarAlunoPorUsuarioId(req.auth!.sub);
    if (!aluno.turmaId) return res.status(200).json(null);
    const treino = await treinoService.buscarProximoTreino(aluno.turmaId);
    return res.status(200).json(treino);
  } catch (err) {
    return next(err);
  }
}

export async function meuCalendarioController(req: Request, res: Response, next: NextFunction) {
  try {
    const { mes } = calendarioQuerySchema.parse(req.query);
    const aluno = await alunoService.buscarAlunoPorUsuarioId(req.auth!.sub);
    const calendario = await frequenciaService.listarCalendarioMensal(aluno.id, aluno.turmaId, mes);
    return res.status(200).json(calendario);
  } catch (err) {
    return next(err);
  }
}

export async function meuHistoricoMensalController(req: Request, res: Response, next: NextFunction) {
  try {
    const aluno = await alunoService.buscarAlunoPorUsuarioId(req.auth!.sub);
    const historico = await historicoService.buscarHistoricoMensal(aluno.id, aluno.turmaId);
    return res.status(200).json(historico);
  } catch (err) {
    return next(err);
  }
}

export async function buscarAlunoController(req: Request, res: Response, next: NextFunction) {
  try {
    const aluno = await alunoService.buscarAlunoPorId(req.params.id);
    return res.status(200).json(aluno);
  } catch (err) {
    return next(err);
  }
}

export async function criarAlunoController(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = criarAlunoSchema.parse(req.body);
    const aluno = await alunoService.criarAluno(dados);
    return res.status(201).json(aluno);
  } catch (err) {
    return next(err);
  }
}

export async function atualizarAlunoController(req: Request, res: Response, next: NextFunction) {
  try {
    const dados = atualizarAlunoSchema.parse(req.body);
    const aluno = await alunoService.atualizarAluno(req.params.id, dados);
    return res.status(200).json(aluno);
  } catch (err) {
    return next(err);
  }
}

export async function alterarStatusAlunoController(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = statusSchema.parse(req.body);
    const aluno = await alunoService.alterarStatusAluno(req.params.id, status);
    return res.status(200).json(aluno);
  } catch (err) {
    return next(err);
  }
}

export async function removerAlunoController(req: Request, res: Response, next: NextFunction) {
  try {
    await alunoService.removerAluno(req.params.id);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}
