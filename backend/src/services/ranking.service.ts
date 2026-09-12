import { supabaseAdmin } from "../lib/supabase";
import { AppError } from "../middlewares/errorHandler";

interface AlunoRankingRow {
  id: string;
  usuarios: { nome: string } | null;
  turmas: { nome: string } | null;
}

interface PontuacaoRow {
  aluno_id: string;
  pontos: number;
}

export function mesAtual() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
}

function intervaloDoMes(mesReferencia: string) {
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
    .select("id, usuarios ( nome ), turmas ( nome )")
    .eq("status", "ativo");

  if (params.turmaId) {
    alunosQuery = alunosQuery.eq("turma_id", params.turmaId);
  }

  const { data: alunos, error: alunosError } = await alunosQuery.returns<AlunoRankingRow[]>();
  if (alunosError) throw new AppError(`Erro ao listar alunos: ${alunosError.message}`, 500);

  const alunoIds = alunos.map((a) => a.id);
  let pontuacoes: PontuacaoRow[] = [];

  if (alunoIds.length > 0) {
    const { data, error } = await supabaseAdmin
      .from("pontuacoes")
      .select("aluno_id, pontos")
      .in("aluno_id", alunoIds)
      .gte("data", inicio)
      .lt("data", fim)
      .returns<PontuacaoRow[]>();

    if (error) throw new AppError(`Erro ao calcular ranking: ${error.message}`, 500);
    pontuacoes = data;
  }

  const totalPorAluno = new Map<string, number>();
  for (const p of pontuacoes) {
    totalPorAluno.set(p.aluno_id, (totalPorAluno.get(p.aluno_id) ?? 0) + p.pontos);
  }

  const ranking = alunos
    .map((a) => ({
      alunoId: a.id,
      nome: a.usuarios?.nome ?? "—",
      turma: a.turmas?.nome ?? null,
      pontos: totalPorAluno.get(a.id) ?? 0,
    }))
    .sort((a, b) => b.pontos - a.pontos || a.nome.localeCompare(b.nome, "pt-BR"))
    .map((item, index) => ({ ...item, posicao: index + 1 }));

  return { mesReferencia, ranking };
}
