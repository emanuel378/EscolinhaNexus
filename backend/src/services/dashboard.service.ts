import { supabaseAdmin } from "../lib/supabase";
import { AppError } from "../middlewares/errorHandler";
import { calcularRanking, intervaloDoMes, mesAtual } from "./ranking.service";
import { marcarAtrasadas } from "./mensalidade.service";

type StatusMensalidade = "pago" | "pendente" | "atrasado";
type StatusFrequencia = "presente" | "falta" | "falta_justificada";

interface ProximoTreinoRow {
  id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  local: string;
  tipo: string;
  turmas: { nome: string } | null;
}

interface FrequenciaComTreinoRow {
  status: StatusFrequencia;
  treinos: { data: string } | null;
}

// Painel geral do admin: agrega dados de várias tabelas para a tela de
// Dashboard. Calculado sob demanda (sem cache) — o volume de dados de uma
// escolinha é pequeno o suficiente para isso não ser um problema.
export async function buscarResumoDashboard() {
  await marcarAtrasadas();

  const mesReferencia = mesAtual();
  const { inicio, fim } = intervaloDoMes(mesReferencia);
  const inicioData = inicio.substring(0, 10);
  const fimData = fim.substring(0, 10);
  const hoje = new Date().toISOString().substring(0, 10);

  const [
    alunosAtivosResult,
    alunosInativosResult,
    alunosNovosResult,
    alunosSairamResult,
    mensalidadesMesResult,
    frequenciasResult,
    proximosTreinosResult,
  ] = await Promise.all([
    supabaseAdmin.from("alunos").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    supabaseAdmin.from("alunos").select("id", { count: "exact", head: true }).eq("status", "inativo"),
    supabaseAdmin
      .from("alunos")
      .select("id", { count: "exact", head: true })
      .gte("data_entrada", inicio)
      .lt("data_entrada", fim),
    supabaseAdmin
      .from("alunos")
      .select("id", { count: "exact", head: true })
      .eq("status", "inativo")
      .gte("atualizado_em", inicio)
      .lt("atualizado_em", fim),
    supabaseAdmin.from("mensalidades").select("status").eq("mes_referencia", mesReferencia),
    supabaseAdmin
      .from("frequencias")
      .select("status, treinos ( data )")
      .returns<FrequenciaComTreinoRow[]>(),
    supabaseAdmin
      .from("treinos")
      .select("id, data, hora_inicio, hora_fim, local, tipo, turmas ( nome )")
      .gte("data", hoje)
      .order("data", { ascending: true })
      .order("hora_inicio", { ascending: true })
      .limit(5)
      .returns<ProximoTreinoRow[]>(),
  ]);

  for (const result of [
    alunosAtivosResult,
    alunosInativosResult,
    alunosNovosResult,
    alunosSairamResult,
    mensalidadesMesResult,
    frequenciasResult,
    proximosTreinosResult,
  ]) {
    if (result.error) {
      throw new AppError(`Erro ao carregar o dashboard: ${result.error.message}`, 500);
    }
  }

  const pagamentos: Record<StatusMensalidade, number> = { pago: 0, pendente: 0, atrasado: 0 };
  for (const m of (mensalidadesMesResult.data ?? []) as { status: StatusMensalidade }[]) {
    pagamentos[m.status]++;
  }

  const frequenciasDoMes = (frequenciasResult.data ?? []).filter(
    (f) => f.treinos && f.treinos.data >= inicioData && f.treinos.data < fimData
  );

  const totalFrequencias = frequenciasDoMes.length;
  const presencasDoMes = frequenciasDoMes.filter((f) => f.status === "presente").length;
  const frequenciaMediaMes =
    totalFrequencias === 0 ? 0 : Math.round((presencasDoMes / totalFrequencias) * 1000) / 10;

  const { ranking } = await calcularRanking({ mesReferencia });

  return {
    mesReferencia,
    alunosAtivos: alunosAtivosResult.count ?? 0,
    alunosInativos: alunosInativosResult.count ?? 0,
    alunosNovos: alunosNovosResult.count ?? 0,
    alunosSairamEsteMes: alunosSairamResult.count ?? 0,
    pagamentos,
    frequenciaMediaMes,
    rankingTop: ranking.slice(0, 5),
    proximosTreinos: (proximosTreinosResult.data ?? []).map((t) => ({
      id: t.id,
      data: t.data,
      horaInicio: t.hora_inicio,
      horaFim: t.hora_fim,
      local: t.local,
      tipo: t.tipo,
      turma: t.turmas?.nome ?? null,
    })),
  };
}
