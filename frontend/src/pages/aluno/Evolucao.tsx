import { useMinhasPontuacoes } from "../../hooks/usePontuacoes";
import { useMinhaFrequencia } from "../../hooks/useFrequencia";
import { useMeuHistoricoMensal } from "../../hooks/useAlunos";

const NOMES_MES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

function formatarMesReferencia(mesReferencia: string) {
  const [ano, mes] = mesReferencia.split("-");
  return `${NOMES_MES[Number(mes) - 1]}/${ano}`;
}

export function AlunoEvolucaoPage() {
  const { data: pontuacao, isLoading } = useMinhasPontuacoes();
  const { data: frequencia } = useMinhaFrequencia();
  const { data: historicoMensal } = useMeuHistoricoMensal();

  if (isLoading) return <p className="text-sm text-slate-500">Carregando...</p>;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-lg font-semibold text-slate-900">📊 Minha evolução</h1>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Pontuação total</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{pontuacao?.total ?? 0} pts</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Frequência geral</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {frequencia?.percentual ?? 0}%
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Histórico mensal</h2>
        {historicoMensal && historicoMensal.every((m) => m.posicao === null && m.frequenciaPercentual === null) && (
          <p className="text-sm text-slate-500">Ainda sem dados nos últimos meses.</p>
        )}
        {historicoMensal && (
          <div className="space-y-3">
            {historicoMensal
              .filter((m) => m.posicao !== null || m.frequenciaPercentual !== null || m.relatorioDisponivel)
              .map((m) => (
                <div key={m.mesReferencia} className="rounded-lg border border-slate-100 p-3 text-sm">
                  <p className="mb-2 font-medium text-slate-900">
                    {formatarMesReferencia(m.mesReferencia)}
                  </p>
                  <div className="grid grid-cols-2 gap-y-1 text-xs text-slate-600 sm:grid-cols-4">
                    <span>
                      Ranking: <span className="font-medium text-slate-900">
                        {m.posicao ? `${m.posicao}º` : "—"}
                      </span>
                    </span>
                    <span>
                      Pontos: <span className="font-medium text-slate-900">{m.pontos}</span>
                    </span>
                    <span>
                      Frequência:{" "}
                      <span className="font-medium text-slate-900">
                        {m.frequenciaPercentual !== null ? `${m.frequenciaPercentual}%` : "—"}
                      </span>
                    </span>
                    <span>
                      Relatório:{" "}
                      <span
                        className={
                          m.relatorioDisponivel ? "font-medium text-status-verde" : "text-slate-400"
                        }
                      >
                        {m.relatorioDisponivel ? "disponível" : "—"}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Histórico de pontuação</h2>
        {pontuacao && pontuacao.historico.length === 0 && (
          <p className="text-sm text-slate-500">Nenhuma pontuação lançada ainda.</p>
        )}
        {pontuacao && pontuacao.historico.length > 0 && (
          <div className="space-y-1 text-sm">
            {pontuacao.historico.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between border-t border-slate-100 py-2"
              >
                <span className="text-slate-600">
                  {new Date(p.data).toLocaleDateString("pt-BR")} · {p.motivo}
                </span>
                <span className={p.pontos >= 0 ? "text-status-verde" : "text-status-vermelho"}>
                  {p.pontos >= 0 ? `+${p.pontos}` : p.pontos}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
