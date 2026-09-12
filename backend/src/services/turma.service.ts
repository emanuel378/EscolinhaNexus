import { supabaseAdmin } from "../lib/supabase";
import { AppError } from "../middlewares/errorHandler";

interface TurmaInput {
  nome: string;
  horarios: string;
}

interface TurmaRow {
  id: string;
  nome: string;
  horarios: string;
  criado_em: string;
}

function paraApi(row: TurmaRow) {
  return { id: row.id, nome: row.nome, horarios: row.horarios, criadoEm: row.criado_em };
}

export async function listarTurmas() {
  const { data, error } = await supabaseAdmin
    .from("turmas")
    .select("id, nome, horarios, criado_em")
    .order("nome", { ascending: true })
    .returns<TurmaRow[]>();

  if (error) throw new AppError(`Erro ao listar turmas: ${error.message}`, 500);
  return data.map(paraApi);
}

export async function buscarTurmaPorId(id: string) {
  const { data, error } = await supabaseAdmin
    .from("turmas")
    .select("id, nome, horarios, criado_em")
    .eq("id", id)
    .maybeSingle<TurmaRow>();

  if (error) throw new AppError(`Erro ao buscar turma: ${error.message}`, 500);
  if (!data) throw new AppError("Turma não encontrada.", 404);
  return paraApi(data);
}

export async function criarTurma(input: TurmaInput) {
  const { data, error } = await supabaseAdmin
    .from("turmas")
    .insert({ nome: input.nome, horarios: input.horarios })
    .select("id, nome, horarios, criado_em")
    .single<TurmaRow>();

  if (error) throw new AppError(`Erro ao criar turma: ${error.message}`, 500);
  return paraApi(data);
}

export async function atualizarTurma(id: string, input: Partial<TurmaInput>) {
  await buscarTurmaPorId(id);

  const { data, error } = await supabaseAdmin
    .from("turmas")
    .update(input)
    .eq("id", id)
    .select("id, nome, horarios, criado_em")
    .single<TurmaRow>();

  if (error) throw new AppError(`Erro ao atualizar turma: ${error.message}`, 500);
  return paraApi(data);
}

export async function removerTurma(id: string) {
  await buscarTurmaPorId(id);

  const { error } = await supabaseAdmin.from("turmas").delete().eq("id", id);
  if (error) throw new AppError(`Erro ao remover turma: ${error.message}`, 500);
}
