import { supabaseAdmin } from "../lib/supabase";
import { AppError } from "../middlewares/errorHandler";

interface TreinoInput {
  turmaId: string;
  data: Date;
  horaInicio: string;
  horaFim: string;
  local: string;
  tipo: string;
  observacao?: string;
}

interface TreinoRow {
  id: string;
  turma_id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  local: string;
  tipo: string;
  observacao: string | null;
  criado_em: string;
  turmas: { id: string; nome: string } | null;
}

const SELECT_TREINO = `
  id, turma_id, data, hora_inicio, hora_fim, local, tipo, observacao, criado_em,
  turmas ( id, nome )
`;

function paraApi(row: TreinoRow) {
  return {
    id: row.id,
    turmaId: row.turma_id,
    data: row.data,
    horaInicio: row.hora_inicio,
    horaFim: row.hora_fim,
    local: row.local,
    tipo: row.tipo,
    observacao: row.observacao,
    criadoEm: row.criado_em,
    turma: row.turmas ? { id: row.turmas.id, nome: row.turmas.nome } : null,
  };
}

export async function listarTreinos(filtro?: { turmaId?: string }) {
  let query = supabaseAdmin.from("treinos").select(SELECT_TREINO);

  if (filtro?.turmaId) {
    query = query.eq("turma_id", filtro.turmaId);
  }

  const { data, error } = await query.order("data", { ascending: false }).returns<TreinoRow[]>();

  if (error) throw new AppError(`Erro ao listar treinos: ${error.message}`, 500);
  return data.map(paraApi);
}

export async function buscarTreinoPorId(id: string) {
  const { data, error } = await supabaseAdmin
    .from("treinos")
    .select(SELECT_TREINO)
    .eq("id", id)
    .maybeSingle<TreinoRow>();

  if (error) throw new AppError(`Erro ao buscar treino: ${error.message}`, 500);
  if (!data) throw new AppError("Treino não encontrado.", 404);
  return paraApi(data);
}

export async function criarTreino(input: TreinoInput) {
  const { data, error } = await supabaseAdmin
    .from("treinos")
    .insert({
      turma_id: input.turmaId,
      data: input.data,
      hora_inicio: input.horaInicio,
      hora_fim: input.horaFim,
      local: input.local,
      tipo: input.tipo,
      observacao: input.observacao,
    })
    .select("id")
    .single<{ id: string }>();

  if (error) throw new AppError(`Erro ao criar treino: ${error.message}`, 500);
  return buscarTreinoPorId(data.id);
}

export async function atualizarTreino(id: string, input: Partial<TreinoInput>) {
  await buscarTreinoPorId(id);

  const { error } = await supabaseAdmin
    .from("treinos")
    .update({
      ...(input.turmaId ? { turma_id: input.turmaId } : {}),
      ...(input.data ? { data: input.data } : {}),
      ...(input.horaInicio ? { hora_inicio: input.horaInicio } : {}),
      ...(input.horaFim ? { hora_fim: input.horaFim } : {}),
      ...(input.local ? { local: input.local } : {}),
      ...(input.tipo ? { tipo: input.tipo } : {}),
      ...(input.observacao !== undefined ? { observacao: input.observacao } : {}),
    })
    .eq("id", id);

  if (error) throw new AppError(`Erro ao atualizar treino: ${error.message}`, 500);
  return buscarTreinoPorId(id);
}

export async function removerTreino(id: string) {
  await buscarTreinoPorId(id);

  const { error } = await supabaseAdmin.from("treinos").delete().eq("id", id);
  if (error) throw new AppError(`Erro ao remover treino: ${error.message}`, 500);
}
