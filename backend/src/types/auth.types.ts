export type Role = "admin" | "aluno";

export interface AuthContext {
  sub: string; // usuarioId (mesmo id do auth.users no Supabase)
  role: Role;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
    }
  }
}
