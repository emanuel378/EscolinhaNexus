import "dotenv/config";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3333),
  supabaseUrl: required("SUPABASE_URL"),
  // Chave secreta — nunca deve ser exposta ao frontend. Usada pelo backend
  // para ler/escrever no banco ignorando RLS e para operações de admin no
  // Supabase Auth (criar/remover usuário, definir role em app_metadata).
  supabaseServiceRoleKey: required("SUPABASE_SERVICE_ROLE_KEY"),
  // Uma ou mais origens liberadas no CORS, separadas por vírgula
  // (ex: "https://meu-front.vercel.app,http://localhost:5173").
  frontendUrls: (process.env.FRONTEND_URL ?? "http://localhost:5173")
    .split(",")
    .map((url) => url.trim().replace(/\/$/, ""))
    .filter(Boolean),
};
