import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as frequenciaService from "../services/frequencia.service";
import { buscarAlunoPorUsuarioId } from "../services/aluno.service";

const marcarFrequenciasSchema = z.object({
  registros: z
    .array(
      z.object({
        alunoId: z.string().uuid(),
        status: z.enum(["presente", "falta", "falta_justificada"]),
      })
    )
    .min(1, "Informe ao menos um registro."),
});

export async function fichaDeChamadaController(req: Request, res: Response, next: NextFunction) {
  try {
    const ficha = await frequenciaService.listarFichaDeChamada(req.params.treinoId);
    return res.status(200).json(ficha);
  } catch (err) {
    return next(err);
  }
}

export async function marcarFrequenciasController(req: Request, res: Response, next: NextFunction) {
  try {
    const { registros } = marcarFrequenciasSchema.parse(req.body);
    await frequenciaService.marcarFrequencias(req.params.treinoId, registros);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

export async function historicoFrequenciaAlunoController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const historico = await frequenciaService.listarHistoricoFrequencia(req.params.id);
    return res.status(200).json(historico);
  } catch (err) {
    return next(err);
  }
}

export async function minhaFrequenciaController(req: Request, res: Response, next: NextFunction) {
  try {
    const aluno = await buscarAlunoPorUsuarioId(req.auth!.sub);
    const historico = await frequenciaService.listarHistoricoFrequencia(aluno.id);
    return res.status(200).json(historico);
  } catch (err) {
    return next(err);
  }
}
