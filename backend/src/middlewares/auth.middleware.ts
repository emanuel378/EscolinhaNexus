import { NextFunction, Request, Response } from "express";
import { supabaseAdmin } from "../lib/supabase";
import { Role } from "../types/auth.types";

function extrairRole(appMetadata: unknown): Role | null {
  const role = (appMetadata as { role?: string } | null)?.role;
  return role === "admin" || role === "aluno" ? role : null;
}

// Valida o access token emitido pelo Supabase Auth (o frontend fala com o
// Supabase diretamente para login; aqui só verificamos se o token é válido).
// O papel (admin | aluno) vem de `app_metadata`, que só pode ser alterado
// via service role — o próprio usuário não consegue editar isso pelo
// client-side SDK, ao contrário de `user_metadata`.
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Token de acesso não informado." });
  }

  const token = header.substring("Bearer ".length);

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ message: "Token de acesso inválido ou expirado." });
    }

    const role = extrairRole(data.user.app_metadata);
    if (!role) {
      return res.status(403).json({ message: "Usuário sem papel (role) definido." });
    }

    req.auth = { sub: data.user.id, role };
    return next();
  } catch {
    return res.status(401).json({ message: "Não foi possível validar o token de acesso." });
  }
}

// Middleware de autorização: garante que somente os papéis informados
// possam acessar a rota. Deve ser usado SEMPRE após `authenticate`.
// Esta é a barreira real de segurança — o frontend só esconde a UI,
// quem impede a ação é este middleware no backend.
export function authorize(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ message: "Não autenticado." });
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({ message: "Você não tem permissão para acessar este recurso." });
    }

    return next();
  };
}
