import { createClient } from "@supabase/supabase-js";

// Cliente com a chave anônima — só é usado para Auth (login, logout, sessão).
// Todo o acesso a dados (alunos, turmas, etc.) passa pelo backend Express,
// que usa a service role key e aplica as regras de autorização por role.
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);
