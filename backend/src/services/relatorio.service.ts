import { supabaseAdmin } from "../lib/supabase";
import { AppError } from "../middlewares/errorHandler";

interface RelatorioInput {
  mesReferencia: string;
  notaTecnico: number;
  notaFisico: number;
  notaTatico: number;
  notaMental: number;
  pontosFortes: string;
  pontosMelhorar: string;
  objetivoProximoMes: string;
}

interface RelatorioRow {
  id: string;
  aluno_id: string;
  mes_referencia: string;
  nota_tecnico: number;
  nota_fisico: number;
  nota_tatico: number;
  nota_mental: number;
  pontos_fortes: string;
  pontos_melhorar: string;
  objetivo_proximo_mes: string;
  criado_em: string;
}

function paraApi(row: RelatorioRow) {
  return {
    id: row.id,
    alunoId: row.aluno_id,
    mesReferencia: row.mes_referencia,
    notaTecnico: row.nota_tecnico,
    notaFisico: row.nota_fisico,
    notaTatico: row.nota_tatico,
    notaMental: row.nota_mental,
    pontosFortes: row.pontos_fortes,
    pontosMelhorar: row.pontos_melhorar,
    objetivoProximoMes: row.objetivo_proximo_mes,
    criadoEm: row.criado_em,
  };
}

export async function listarRelatoriosDoAluno(alunoId: string) {
  const { data, error } = await supabaseAdmin
    .from("relatorios")
    .select("*")
    .eq("aluno_id", alunoId)
    .order("mes_referencia", { ascending: false })
    .returns<RelatorioRow[]>();

  if (error) throw new AppError(`Erro ao listar relatórios: ${error.message}`, 500);
  return data.map(paraApi);
}

export async function criarRelatorio(alunoId: string, input: RelatorioInput) {
  const { data: existente } = await supabaseAdmin
    .from("relatorios")
    .select("id")
    .eq("aluno_id", alunoId)
    .eq("mes_referencia", input.mesReferencia)
    .maybeSingle();

  if (existente) {
    throw new AppError("Já existe um relatório lançado para este mês de referência.", 409);
  }

  const { data, error } = await supabaseAdmin
    .from("relatorios")
    .insert({
      aluno_id: alunoId,
      mes_referencia: input.mesReferencia,
      nota_tecnico: input.notaTecnico,
      nota_fisico: input.notaFisico,
      nota_tatico: input.notaTatico,
      nota_mental: input.notaMental,
      pontos_fortes: input.pontosFortes,
      pontos_melhorar: input.pontosMelhorar,
      objetivo_proximo_mes: input.objetivoProximoMes,
    })
    .select("*")
    .single<RelatorioRow>();

  if (error) throw new AppError(`Erro ao criar relatório: ${error.message}`, 500);
  return paraApi(data);
}

export async function atualizarRelatorio(id: string, input: Partial<RelatorioInput>) {
  const { data: atual, error: atualError } = await supabaseAdmin
    .from("relatorios")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (atualError) throw new AppError(`Erro ao buscar relatório: ${atualError.message}`, 500);
  if (!atual) throw new AppError("Relatório não encontrado.", 404);

  const { data, error } = await supabaseAdmin
    .from("relatorios")
    .update({
      ...(input.notaTecnico !== undefined ? { nota_tecnico: input.notaTecnico } : {}),
      ...(input.notaFisico !== undefined ? { nota_fisico: input.notaFisico } : {}),
      ...(input.notaTatico !== undefined ? { nota_tatico: input.notaTatico } : {}),
      ...(input.notaMental !== undefined ? { nota_mental: input.notaMental } : {}),
      ...(input.pontosFortes !== undefined ? { pontos_fortes: input.pontosFortes } : {}),
      ...(input.pontosMelhorar !== undefined ? { pontos_melhorar: input.pontosMelhorar } : {}),
      ...(input.objetivoProximoMes !== undefined
        ? { objetivo_proximo_mes: input.objetivoProximoMes }
        : {}),
    })
    .eq("id", id)
    .select("*")
    .single<RelatorioRow>();

  if (error) throw new AppError(`Erro ao atualizar relatório: ${error.message}`, 500);
  return paraApi(data);
}

export async function removerRelatorio(id: string) {
  const { error } = await supabaseAdmin.from("relatorios").delete().eq("id", id);
  if (error) throw new AppError(`Erro ao remover relatório: ${error.message}`, 500);
}
