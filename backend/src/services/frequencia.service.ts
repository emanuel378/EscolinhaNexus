import { supabaseAdmin } from "../lib/supabase";
import { AppError } from "../middlewares/errorHandler";
import { buscarTreinoPorId } from "./treino.service";

type StatusFrequencia = "presente" | "falta" | "falta_justificada";

interface RegistroInput {
  alunoId: string;
  status: StatusFrequencia;
}

interface AlunoDaTurmaRow {
  id: string;
  foto_url: string | null;
  usuarios: { nome: string } | null;
}

interface FrequenciaRow {
  aluno_id: string;
  status: StatusFrequencia;
}

// Ficha de chamada de um treino: todo aluno ativo da turma do treino,
// com o status já marcado (se houver) ou null (ainda não marcado).
export async function listarFichaDeChamada(treinoId: string) {
  const treino = await buscarTreinoPorId(treinoId);

  const { data: alunos, error: alunosError } = await supabaseAdmin
    .from("alunos")
    .select("id, foto_url, usuarios ( nome )")
    .eq("turma_id", treino.turmaId)
    .eq("status", "ativo")
    .returns<AlunoDaTurmaRow[]>();

  if (alunosError) {
    throw new AppError(`Erro ao listar alunos da turma: ${alunosError.message}`, 500);
  }

  const { data: frequencias, error: frequenciasError } = await supabaseAdmin
    .from("frequencias")
    .select("aluno_id, status")
    .eq("treino_id", treinoId)
    .returns<FrequenciaRow[]>();

  if (frequenciasError) {
    throw new AppError(`Erro ao listar frequências: ${frequenciasError.message}`, 500);
  }

  const statusPorAluno = new Map(frequencias.map((f) => [f.aluno_id, f.status]));

  return alunos
    .map((aluno) => ({
      alunoId: aluno.id,
      nome: aluno.usuarios?.nome ?? "—",
      fotoUrl: aluno.foto_url,
      status: statusPorAluno.get(aluno.id) ?? null,
    }))
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}

export async function marcarFrequencias(treinoId: string, registros: RegistroInput[]) {
  await buscarTreinoPorId(treinoId);

  if (registros.length === 0) return;

  const { error } = await supabaseAdmin.from("frequencias").upsert(
    registros.map((r) => ({
      treino_id: treinoId,
      aluno_id: r.alunoId,
      status: r.status,
    })),
    { onConflict: "aluno_id,treino_id" }
  );

  if (error) {
    throw new AppError(`Erro ao marcar frequências: ${error.message}`, 500);
  }
}

interface HistoricoRow {
  id: string;
  status: StatusFrequencia;
  criado_em: string;
  treinos: {
    id: string;
    data: string;
    tipo: string;
    hora_inicio: string;
    turmas: { nome: string } | null;
  } | null;
}

// Histórico de presença do aluno + percentual de frequência. A falta
// justificada entra na contagem total mas não pesa como "falta" — o
// percentual considera apenas presença sobre o total de treinos registrados.
export async function listarHistoricoFrequencia(alunoId: string) {
  const { data, error } = await supabaseAdmin
    .from("frequencias")
    .select(
      "id, status, criado_em, treinos ( id, data, tipo, hora_inicio, turmas ( nome ) )"
    )
    .eq("aluno_id", alunoId)
    .order("criado_em", { ascending: false })
    .returns<HistoricoRow[]>();

  if (error) {
    throw new AppError(`Erro ao listar histórico de frequência: ${error.message}`, 500);
  }

  const historico = data.map((row) => ({
    id: row.id,
    status: row.status,
    treino: row.treinos
      ? {
          id: row.treinos.id,
          data: row.treinos.data,
          tipo: row.treinos.tipo,
          horaInicio: row.treinos.hora_inicio,
          turma: row.treinos.turmas?.nome ?? null,
        }
      : null,
  }));

  const total = historico.length;
  const presencas = historico.filter((h) => h.status === "presente").length;
  const percentual = total === 0 ? 0 : Math.round((presencas / total) * 1000) / 10;

  return {
    percentual,
    totalRegistros: total,
    presencas,
    faltas: historico.filter((h) => h.status === "falta").length,
    faltasJustificadas: historico.filter((h) => h.status === "falta_justificada").length,
    historico,
  };
}

interface TreinoDoMesRow {
  id: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  tipo: string;
  local: string;
}

interface FrequenciaPorTreinoRow {
  treino_id: string;
  status: StatusFrequencia;
}

// Calendário mensal do aluno: todo treino da turma dele no mês, com o
// status de presença já marcado (ou null, se o treino ainda não teve
// chamada feita ou é futuro).
export async function listarCalendarioMensal(
  alunoId: string,
  turmaId: string | null,
  mesReferencia: string
) {
  if (!turmaId) return { mesReferencia, dias: [] };

  const [ano, mes] = mesReferencia.split("-").map(Number);
  if (!ano || !mes || mes < 1 || mes > 12) {
    throw new AppError("mesReferencia inválido. Use o formato YYYY-MM.", 400);
  }
  const inicio = new Date(Date.UTC(ano, mes - 1, 1)).toISOString().substring(0, 10);
  const fim = new Date(Date.UTC(ano, mes, 1)).toISOString().substring(0, 10);

  const { data: treinos, error: treinosError } = await supabaseAdmin
    .from("treinos")
    .select("id, data, hora_inicio, hora_fim, tipo, local")
    .eq("turma_id", turmaId)
    .gte("data", inicio)
    .lt("data", fim)
    .order("data", { ascending: true })
    .returns<TreinoDoMesRow[]>();

  if (treinosError) {
    throw new AppError(`Erro ao listar treinos do mês: ${treinosError.message}`, 500);
  }

  const treinoIds = treinos.map((t) => t.id);
  let frequencias: FrequenciaPorTreinoRow[] = [];

  if (treinoIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("frequencias")
      .select("treino_id, status")
      .eq("aluno_id", alunoId)
      .in("treino_id", treinoIds)
      .returns<FrequenciaPorTreinoRow[]>();

    if (error) throw new AppError(`Erro ao listar frequências do mês: ${error.message}`, 500);
    frequencias = data;
  }

  const statusPorTreino = new Map(frequencias.map((f) => [f.treino_id, f.status]));

  const dias = treinos.map((t) => ({
    treinoId: t.id,
    data: t.data,
    horaInicio: t.hora_inicio,
    horaFim: t.hora_fim,
    tipo: t.tipo,
    local: t.local,
    status: statusPorTreino.get(t.id) ?? null,
  }));

  return { mesReferencia, dias };
}
