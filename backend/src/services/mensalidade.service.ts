import { supabaseAdmin } from "../lib/supabase";
import { AppError } from "../middlewares/errorHandler";

type StatusMensalidade = "pago" | "pendente" | "atrasado";

interface MensalidadeInput {
  mesReferencia: string;
  valor: number;
  vencimento: Date;
  dataPagamento?: Date | null;
  status?: StatusMensalidade;
}

interface MensalidadeRow {
  id: string;
  aluno_id: string;
  mes_referencia: string;
  valor: string;
  vencimento: string;
  data_pagamento: string | null;
  status: StatusMensalidade;
  criado_em: string;
}

function paraApi(row: MensalidadeRow) {
  return {
    id: row.id,
    alunoId: row.aluno_id,
    mesReferencia: row.mes_referencia,
    valor: Number(row.valor),
    vencimento: row.vencimento,
    dataPagamento: row.data_pagamento,
    status: row.status,
    criadoEm: row.criado_em,
  };
}

export async function listarMensalidadesDoAluno(alunoId: string) {
  const { data, error } = await supabaseAdmin
    .from("mensalidades")
    .select("*")
    .eq("aluno_id", alunoId)
    .order("mes_referencia", { ascending: false })
    .returns<MensalidadeRow[]>();

  if (error) throw new AppError(`Erro ao listar mensalidades: ${error.message}`, 500);
  return data.map(paraApi);
}

export async function criarMensalidade(alunoId: string, input: MensalidadeInput) {
  const { data: existente } = await supabaseAdmin
    .from("mensalidades")
    .select("id")
    .eq("aluno_id", alunoId)
    .eq("mes_referencia", input.mesReferencia)
    .maybeSingle();

  if (existente) {
    throw new AppError("Já existe uma mensalidade lançada para este mês de referência.", 409);
  }

  const { data, error } = await supabaseAdmin
    .from("mensalidades")
    .insert({
      aluno_id: alunoId,
      mes_referencia: input.mesReferencia,
      valor: input.valor,
      vencimento: input.vencimento,
      data_pagamento: input.dataPagamento ?? null,
      status: input.status ?? "pendente",
    })
    .select("*")
    .single<MensalidadeRow>();

  if (error) throw new AppError(`Erro ao criar mensalidade: ${error.message}`, 500);
  return paraApi(data);
}

export async function atualizarMensalidade(id: string, input: Partial<MensalidadeInput>) {
  const { data: atual, error: atualError } = await supabaseAdmin
    .from("mensalidades")
    .select("id")
    .eq("id", id)
    .maybeSingle();

  if (atualError) throw new AppError(`Erro ao buscar mensalidade: ${atualError.message}`, 500);
  if (!atual) throw new AppError("Mensalidade não encontrada.", 404);

  const { data, error } = await supabaseAdmin
    .from("mensalidades")
    .update({
      ...(input.valor !== undefined ? { valor: input.valor } : {}),
      ...(input.vencimento ? { vencimento: input.vencimento } : {}),
      ...(input.dataPagamento !== undefined ? { data_pagamento: input.dataPagamento } : {}),
      ...(input.status ? { status: input.status } : {}),
    })
    .eq("id", id)
    .select("*")
    .single<MensalidadeRow>();

  if (error) throw new AppError(`Erro ao atualizar mensalidade: ${error.message}`, 500);
  return paraApi(data);
}

export async function removerMensalidade(id: string) {
  const { error } = await supabaseAdmin.from("mensalidades").delete().eq("id", id);
  if (error) throw new AppError(`Erro ao remover mensalidade: ${error.message}`, 500);
}

export async function contarPendentes() {
  const { count, error } = await supabaseAdmin
    .from("mensalidades")
    .select("id", { count: "exact", head: true })
    .in("status", ["pendente", "atrasado"]);

  if (error) throw new AppError(`Erro ao contar mensalidades pendentes: ${error.message}`, 500);
  return count ?? 0;
}
