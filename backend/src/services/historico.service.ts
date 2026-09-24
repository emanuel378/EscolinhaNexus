import { supabaseAdmin } from "../lib/supabase";
import { AppError } from "../middlewares/errorHandler";
import { calcularRanking, intervaloDoMes } from "./ranking.service";

type StatusFrequencia = "presente" | "falta" | "falta_justificada";

interface FrequenciaComTreinoRow {
  status: StatusFrequencia;
  treinos: { data: string } | null;
}

// Últimos N meses no formato YYYY-MM, do mais antigo para o mais recente
// (mês atual incluído).
function ultimosMeses(quantidade: number): string[] {
  const agora = new Date();
  const meses: string[] = [];
  for (let i = quantidade - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(agora.getUTCFullYear(), agora.getUTCMonth() - i, 1));
    meses.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return meses;
}

// Histórico mensal do aluno: para cada um dos últimos meses, sua posição e
// pontos no ranking da turma, percentual de frequência e se há relatório
// lançado — usado na área do aluno para ele comparar sua evolução mês a mês.
export async function buscarHistoricoMensal(
  alunoId: string,
  turmaId: string | null,
  quantidadeMeses = 6
) {
  const meses = ultimosMeses(quantidadeMeses);

  const { data: frequenciasRaw, error: frequenciasError } = await supabaseAdmin
    .from("frequencias")
    .select("status, treinos ( data )")
    .eq("aluno_id", alunoId)
    .returns<FrequenciaComTreinoRow[]>();

  if (frequenciasError) {
    throw new AppError(`Erro ao carregar histórico de frequência: ${frequenciasError.message}`, 500);
  }

  const { data: relatorios, error: relatoriosError } = await supabaseAdmin
    .from("relatorios")
    .select("mes_referencia")
    .eq("aluno_id", alunoId)
    .returns<{ mes_referencia: string }[]>();

  if (relatoriosError) {
    throw new AppError(`Erro ao carregar relatórios: ${relatoriosError.message}`, 500);
  }

  const mesesComRelatorio = new Set(relatorios.map((r) => r.mes_referencia));

  const historico = [];

  for (const mesReferencia of meses) {
    const { inicio, fim } = intervaloDoMes(mesReferencia);
    const inicioData = inicio.substring(0, 10);
    const fimData = fim.substring(0, 10);

    const frequenciasDoMes = frequenciasRaw.filter(
      (f) => f.treinos && f.treinos.data >= inicioData && f.treinos.data < fimData
    );
    const presencas = frequenciasDoMes.filter((f) => f.status === "presente").length;
    const frequenciaPercentual =
      frequenciasDoMes.length === 0
        ? null
        : Math.round((presencas / frequenciasDoMes.length) * 1000) / 10;

    let posicao: number | null = null;
    let pontos = 0;

    if (turmaId) {
      const { ranking } = await calcularRanking({ mesReferencia, turmaId });
      const item = ranking.find((r) => r.alunoId === alunoId);
      if (item) {
        posicao = item.posicao;
        pontos = item.pontos;
      }
    }

    historico.push({
      mesReferencia,
      posicao,
      pontos,
      frequenciaPercentual,
      relatorioDisponivel: mesesComRelatorio.has(mesReferencia),
    });
  }

  return historico;
}
