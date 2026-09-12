import { supabaseAdmin } from "../lib/supabase";
import { AppError } from "../middlewares/errorHandler";

type StatusAluno = "ativo" | "inativo";

interface CriarAlunoInput {
  nome: string;
  email: string;
  senha: string;
  dataNascimento: Date;
  telefone?: string;
  dataEntrada?: Date;
  turmaId?: string;
  fotoUrl?: string;
}

interface AtualizarAlunoInput {
  nome?: string;
  email?: string;
  dataNascimento?: Date;
  telefone?: string;
  turmaId?: string | null;
  fotoUrl?: string;
  status?: StatusAluno;
}

// Linha retornada pela query com os joins de usuarios/turmas embutidos.
interface AlunoRow {
  id: string;
  data_nascimento: string;
  telefone: string | null;
  data_entrada: string;
  turma_id: string | null;
  status: StatusAluno;
  foto_url: string | null;
  criado_em: string;
  atualizado_em: string;
  usuarios: { id: string; nome: string; email: string; criado_em: string } | null;
  turmas: { id: string; nome: string; horarios: string } | null;
}

const SELECT_ALUNO = `
  id, data_nascimento, telefone, data_entrada, turma_id, status, foto_url, criado_em, atualizado_em,
  usuarios ( id, nome, email, criado_em ),
  turmas ( id, nome, horarios )
`;

// Converte a linha (snake_case, vinda do Postgres) para o formato da API
// (camelCase), mantendo o mesmo contrato que o frontend já espera.
function paraApi(row: AlunoRow) {
  if (!row.usuarios) {
    throw new AppError("Aluno sem usuário vinculado.", 500);
  }

  return {
    id: row.id,
    dataNascimento: row.data_nascimento,
    telefone: row.telefone,
    dataEntrada: row.data_entrada,
    turmaId: row.turma_id,
    status: row.status,
    fotoUrl: row.foto_url,
    criadoEm: row.criado_em,
    atualizadoEm: row.atualizado_em,
    usuario: {
      id: row.usuarios.id,
      nome: row.usuarios.nome,
      email: row.usuarios.email,
      criadoEm: row.usuarios.criado_em,
    },
    turma: row.turmas
      ? { id: row.turmas.id, nome: row.turmas.nome, horarios: row.turmas.horarios }
      : null,
  };
}

export async function listarAlunos(filtro?: { status?: StatusAluno }) {
  let query = supabaseAdmin.from("alunos").select(SELECT_ALUNO);

  if (filtro?.status) {
    query = query.eq("status", filtro.status);
  }

  const { data, error } = await query.returns<AlunoRow[]>();

  if (error) {
    throw new AppError(`Erro ao listar alunos: ${error.message}`, 500);
  }

  return data
    .map(paraApi)
    .sort((a, b) => a.usuario.nome.localeCompare(b.usuario.nome, "pt-BR"));
}

export async function buscarAlunoPorId(id: string) {
  const { data, error } = await supabaseAdmin
    .from("alunos")
    .select(SELECT_ALUNO)
    .eq("id", id)
    .maybeSingle<AlunoRow>();

  if (error) {
    throw new AppError(`Erro ao buscar aluno: ${error.message}`, 500);
  }
  if (!data) {
    throw new AppError("Aluno não encontrado.", 404);
  }

  return paraApi(data);
}

export async function buscarAlunoPorUsuarioId(usuarioId: string) {
  const { data, error } = await supabaseAdmin
    .from("alunos")
    .select(SELECT_ALUNO)
    .eq("usuario_id", usuarioId)
    .maybeSingle<AlunoRow>();

  if (error) {
    throw new AppError(`Erro ao buscar aluno: ${error.message}`, 500);
  }
  if (!data) {
    throw new AppError("Aluno não encontrado.", 404);
  }

  return paraApi(data);
}

export async function criarAluno(input: CriarAlunoInput) {
  const { data: usuarioExistente } = await supabaseAdmin
    .from("usuarios")
    .select("id")
    .eq("email", input.email)
    .maybeSingle();

  if (usuarioExistente) {
    throw new AppError("Já existe um usuário com este email.", 409);
  }

  // 1) Cria o usuário no Supabase Auth. O role vai em app_metadata, que só o
  // service role consegue escrever — o aluno nunca consegue se autopromover.
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: input.email,
    password: input.senha,
    email_confirm: true,
    app_metadata: { role: "aluno" },
    user_metadata: { nome: input.nome },
  });

  if (authError || !authData.user) {
    if (authError?.status === 422 || authError?.message.includes("already been registered")) {
      throw new AppError("Já existe um usuário com este email.", 409);
    }
    throw new AppError(`Erro ao criar usuário: ${authError?.message}`, 500);
  }

  const usuarioId = authData.user.id;

  try {
    // 2) Espelha o perfil na tabela "usuarios" (facilita joins/listagens).
    const { error: usuarioError } = await supabaseAdmin.from("usuarios").insert({
      id: usuarioId,
      nome: input.nome,
      email: input.email,
      role: "aluno",
    });
    if (usuarioError) throw usuarioError;

    // 3) Cria o registro de Aluno vinculado.
    const { error: alunoError } = await supabaseAdmin.from("alunos").insert({
      usuario_id: usuarioId,
      data_nascimento: input.dataNascimento,
      telefone: input.telefone,
      data_entrada: input.dataEntrada ?? new Date(),
      turma_id: input.turmaId ?? null,
      foto_url: input.fotoUrl,
    });
    if (alunoError) throw alunoError;
  } catch (err) {
    // Desfaz a criação do usuário de Auth para não deixar registro órfão.
    await supabaseAdmin.auth.admin.deleteUser(usuarioId);
    const message = err instanceof Error ? err.message : "erro desconhecido";
    throw new AppError(`Erro ao criar aluno: ${message}`, 500);
  }

  return buscarAlunoPorUsuarioId(usuarioId);
}

export async function atualizarAluno(id: string, input: AtualizarAlunoInput) {
  const alunoAtual = await buscarAlunoPorId(id);

  if (input.email && input.email !== alunoAtual.usuario.email) {
    const { data: emailEmUso } = await supabaseAdmin
      .from("usuarios")
      .select("id")
      .eq("email", input.email)
      .neq("id", alunoAtual.usuario.id)
      .maybeSingle();

    if (emailEmUso) {
      throw new AppError("Já existe um usuário com este email.", 409);
    }
  }

  if (input.nome || input.email) {
    if (input.email && input.email !== alunoAtual.usuario.email) {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(alunoAtual.usuario.id, {
        email: input.email,
      });
      if (error) throw new AppError(`Erro ao atualizar email: ${error.message}`, 500);
    }

    const { error } = await supabaseAdmin
      .from("usuarios")
      .update({
        ...(input.nome ? { nome: input.nome } : {}),
        ...(input.email ? { email: input.email } : {}),
      })
      .eq("id", alunoAtual.usuario.id);
    if (error) throw new AppError(`Erro ao atualizar usuário: ${error.message}`, 500);
  }

  const { error } = await supabaseAdmin
    .from("alunos")
    .update({
      ...(input.dataNascimento ? { data_nascimento: input.dataNascimento } : {}),
      ...(input.telefone !== undefined ? { telefone: input.telefone } : {}),
      ...(input.turmaId !== undefined ? { turma_id: input.turmaId } : {}),
      ...(input.fotoUrl !== undefined ? { foto_url: input.fotoUrl } : {}),
      ...(input.status ? { status: input.status } : {}),
    })
    .eq("id", id);

  if (error) {
    throw new AppError(`Erro ao atualizar aluno: ${error.message}`, 500);
  }

  return buscarAlunoPorId(id);
}

export async function alterarStatusAluno(id: string, status: StatusAluno) {
  await buscarAlunoPorId(id);

  const { error } = await supabaseAdmin.from("alunos").update({ status }).eq("id", id);
  if (error) {
    throw new AppError(`Erro ao alterar status do aluno: ${error.message}`, 500);
  }

  return buscarAlunoPorId(id);
}

export async function removerAluno(id: string) {
  const aluno = await buscarAlunoPorId(id);

  // Remove o usuário no Supabase Auth; a linha em "usuarios" (e em cascata
  // "alunos") é removida automaticamente pelo ON DELETE CASCADE do schema.
  const { error } = await supabaseAdmin.auth.admin.deleteUser(aluno.usuario.id);
  if (error) {
    throw new AppError(`Erro ao remover aluno: ${error.message}`, 500);
  }
}
