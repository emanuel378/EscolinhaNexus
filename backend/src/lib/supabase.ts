import { createClient } from "@supabase/supabase-js";
import { env } from "./env";

// Cliente com service role: usado por TODO o backend para acessar o banco
// (ignora RLS) e para operações administrativas do Supabase Auth
// (criar/remover usuário, setar app_metadata.role). Nunca importe este
// cliente no frontend.
export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
