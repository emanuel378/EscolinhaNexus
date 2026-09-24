import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { MulterError } from "multer";

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: "Dados inválidos.",
      erros: err.issues.map((issue) => ({
        campo: issue.path.join("."),
        mensagem: issue.message,
      })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof MulterError) {
    const mensagem =
      err.code === "LIMIT_FILE_SIZE" ? "A imagem deve ter no máximo 5MB." : err.message;
    return res.status(400).json({ message: mensagem });
  }

  console.error(err);
  return res.status(500).json({ message: "Erro interno do servidor." });
}
