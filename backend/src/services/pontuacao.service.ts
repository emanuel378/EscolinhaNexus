import { supabaseAdmin } from "../lib/supabase";
import { AppError } from "../middlewares/errorHandler";

interface PontuacaoInput {
  pontos: number;
  motivo: string;
  data?: Date;
}

interface PontuacaoRow {
  id: string;
  aluno_id: string;
  pontos: number;
  motivo: string;
  data: string;
}

function paraApi(row: PontuacaoRow) {
  return {
    id: row.id,
    alunoId: row.aluno_id,
    pontos: row.pontos,
    motivo: row.motivo,
    data: row.data,
  };
}

// Histórico de pontuação do aluno + total acumulado (soma de todos os
// lançamentos, sem recorte de período — o recorte mensal é feito no ranking).
export async function listarPontuacoesDoAluno(alunoId: string) {
  const { data, error } = await supabaseAdmin
    .from("pontuacoes")
    .select("*")
    .eq("aluno_id", alunoId)
    .order("data", { ascending: false })
    .returns<PontuacaoRow[]>();

  if (error) throw new AppError(`Erro ao listar pontuações: ${error.message}`, 500);

  const historico = data.map(paraApi);
  const total = historico.reduce((soma, p) => soma + p.pontos, 0);

  return { total, historico };
}

export async function lancarPontuacao(alunoId: string, input: PontuacaoInput) {
  const { data, error } = await supabaseAdmin
    .from("pontuacoes")
    .insert({
      aluno_id: alunoId,
      pontos: input.pontos,
      motivo: input.motivo,
      ...(input.data ? { data: input.data } : {}),
    })
    .select("*")
    .single<PontuacaoRow>();

  if (error) throw new AppError(`Erro ao lançar pontuação: ${error.message}`, 500);
  return paraApi(data);
}

export async function removerPontuacao(id: string) {
  const { error } = await supabaseAdmin.from("pontuacoes").delete().eq("id", id);
  if (error) throw new AppError(`Erro ao remover pontuação: ${error.message}`, 500);
}
