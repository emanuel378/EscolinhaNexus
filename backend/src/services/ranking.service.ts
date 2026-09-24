import { supabaseAdmin } from "../lib/supabase";
import { AppError } from "../middlewares/errorHandler";

interface AlunoRankingRow {
  id: string;
  foto_url: string | null;
  usuarios: { nome: string } | null;
  turmas: { nome: string } | null;
}

interface PontuacaoRow {
  aluno_id: string;
  pontos: number;
  data: string;
}

interface FrequenciaMesRow {
  aluno_id: string;
  status: "presente" | "falta" | "falta_justificada";
}

const SETE_DIAS_MS = 7 * 24 * 60 * 60 * 1000;

export function mesAtual() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
}

export function intervaloDoMes(mesReferencia: string) {
  const [ano, mes] = mesReferencia.split("-").map(Number);
  if (!ano || !mes || mes < 1 || mes > 12) {
    throw new AppError("mesReferencia inválido. Use o formato YYYY-MM.", 400);
  }
  const inicio = new Date(Date.UTC(ano, mes - 1, 1)).toISOString();
  const fim = new Date(Date.UTC(ano, mes, 1)).toISOString();
  return { inicio, fim };
}

// Ranking calculado sob demanda (não persistido): soma dos pontos de cada
// aluno ativo dentro do mês de referência, opcionalmente restrito a uma
// turma. Evita dados redundantes/inconsistentes entre pontuação e ranking.
export async function calcularRanking(params: { mesReferencia?: string; turmaId?: string }) {
  const mesReferencia = params.mesReferencia ?? mesAtual();
  const { inicio, fim } = intervaloDoMes(mesReferencia);

  let alunosQuery = supabaseAdmin
    .from("alunos")
    .select("id, foto_url, usuarios ( nome ), turmas ( nome )")
    .eq("status", "ativo");

  if (params.turmaId) {
    alunosQuery = alunosQuery.eq("turma_id", params.turmaId);
  }

  const { data: alunos, error: alunosError } = await alunosQuery.returns<AlunoRankingRow[]>();
  if (alunosError) throw new AppError(`Erro ao listar alunos: ${alunosError.message}`, 500);

  const alunoIds = alunos.map((a) => a.id);
  let pontuacoes: PontuacaoRow[] = [];
  let frequencias: FrequenciaMesRow[] = [];

  // "Pontos da semana" = últimos 7 dias. A busca de pontuações começa no que
  // vier primeiro (início do mês ou 7 dias atrás) para servir as duas somas.
  const inicioSemana = new Date(Date.now() - SETE_DIAS_MS).toISOString();
  const inicioBusca = inicioSemana < inicio ? inicioSemana : inicio;

  if (alunoIds.length > 0) {
    const [pontuacoesRes, frequenciasRes] = await Promise.all([
      supabaseAdmin
        .from("pontuacoes")
        .select("aluno_id, pontos, data")
        .in("aluno_id", alunoIds)
        .gte("data", inicioBusca)
        .lt("data", fim)
        .returns<PontuacaoRow[]>(),
      supabaseAdmin
        .from("frequencias")
        .select("aluno_id, status, treinos!inner ( data )")
        .in("aluno_id", alunoIds)
        .gte("treinos.data", inicio.substring(0, 10))
        .lt("treinos.data", fim.substring(0, 10))
        .returns<FrequenciaMesRow[]>(),
    ]);

    if (pontuacoesRes.error) {
      throw new AppError(`Erro ao calcular ranking: ${pontuacoesRes.error.message}`, 500);
    }
    if (frequenciasRes.error) {
      throw new AppError(
        `Erro ao calcular frequência do ranking: ${frequenciasRes.error.message}`,
        500
      );
    }
    pontuacoes = pontuacoesRes.data;
    frequencias = frequenciasRes.data;
  }

  const totalPorAluno = new Map<string, number>();
  const semanaPorAluno = new Map<string, number>();
  for (const p of pontuacoes) {
    const dataMs = new Date(p.data).getTime();
    if (dataMs >= new Date(inicio).getTime()) {
      totalPorAluno.set(p.aluno_id, (totalPorAluno.get(p.aluno_id) ?? 0) + p.pontos);
    }
    if (dataMs >= new Date(inicioSemana).getTime()) {
      semanaPorAluno.set(p.aluno_id, (semanaPorAluno.get(p.aluno_id) ?? 0) + p.pontos);
    }
  }

  const presencaPorAluno = new Map<string, { presencas: number; registros: number }>();
  for (const f of frequencias) {
    const atual = presencaPorAluno.get(f.aluno_id) ?? { presencas: 0, registros: 0 };
    atual.registros += 1;
    if (f.status === "presente") atual.presencas += 1;
    presencaPorAluno.set(f.aluno_id, atual);
  }

  const ranking = alunos
    .map((a) => {
      const presenca = presencaPorAluno.get(a.id);
      return {
        alunoId: a.id,
        nome: a.usuarios?.nome ?? "—",
        fotoUrl: a.foto_url,
        turma: a.turmas?.nome ?? null,
        pontos: totalPorAluno.get(a.id) ?? 0,
        pontosSemana: semanaPorAluno.get(a.id) ?? 0,
        presencas: presenca?.presencas ?? 0,
        frequenciaPercentual: presenca
          ? Math.round((presenca.presencas / presenca.registros) * 100)
          : null,
      };
    })
    .sort((a, b) => b.pontos - a.pontos || a.nome.localeCompare(b.nome, "pt-BR"))
    .map((item, index) => ({ ...item, posicao: index + 1 }));

  return { mesReferencia, ranking };
}
