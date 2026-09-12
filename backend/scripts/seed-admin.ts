import { supabaseAdmin } from "../src/lib/supabase";

const EMAIL_ADMIN = "admin@ctescolinha.com";
const SENHA_ADMIN = "admin123";

async function main() {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: EMAIL_ADMIN,
    password: SENHA_ADMIN,
    email_confirm: true,
    app_metadata: { role: "admin" },
    user_metadata: { nome: "Administrador" },
  });

  if (error) {
    if (error.status === 422 || error.message.includes("already been registered")) {
      console.log("Admin de exemplo já existe, seed ignorado.");
      return;
    }
    throw error;
  }

  const { error: usuarioError } = await supabaseAdmin.from("usuarios").insert({
    id: data.user.id,
    nome: "Administrador",
    email: EMAIL_ADMIN,
    role: "admin",
  });

  if (usuarioError) {
    throw usuarioError;
  }

  console.log("Usuário admin criado:");
  console.log(`  email: ${EMAIL_ADMIN}`);
  console.log(`  senha: ${SENHA_ADMIN}`);
  console.log("Troque essa senha em produção.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
