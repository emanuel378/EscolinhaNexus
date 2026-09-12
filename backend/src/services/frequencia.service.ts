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
    .select("id, usuarios ( nome )")
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
