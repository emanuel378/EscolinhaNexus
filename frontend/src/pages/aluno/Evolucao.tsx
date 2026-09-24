import { useMinhasPontuacoes } from "../../hooks/usePontuacoes";
import { useMinhaFrequencia } from "../../hooks/useFrequencia";
import { useMeuHistoricoMensal } from "../../hooks/useAlunos";
import { Spinner } from "../../components/Spinner";

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

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Spinner /> Carregando...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-wide text-white">
        Minha evolução
      </h1>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-nexus-surface p-5">
          <p className="text-sm text-slate-400">Pontuação total</p>
          <p className="mt-1 font-display text-2xl font-bold text-nexus-gold">
            {pontuacao?.total ?? 0} pts
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-nexus-surface p-5">
          <p className="text-sm text-slate-400">Frequência geral</p>
          <p className="mt-1 font-display text-2xl font-bold text-nexus-primary">
            {frequencia?.percentual ?? 0}%
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-white/10 bg-nexus-surface p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
          Histórico mensal
        </h2>
        {historicoMensal && historicoMensal.every((m) => m.posicao === null && m.frequenciaPercentual === null) && (
          <p className="text-sm text-slate-400">Ainda sem dados nos últimos meses.</p>
        )}
        {historicoMensal && (
          <div className="space-y-3">
            {historicoMensal
              .filter((m) => m.posicao !== null || m.frequenciaPercentual !== null || m.relatorioDisponivel)
              .map((m) => (
                <div key={m.mesReferencia} className="rounded-lg border border-white/5 p-3 text-sm">
                  <p className="mb-2 font-medium text-white">
                    {formatarMesReferencia(m.mesReferencia)}
                  </p>
                  <div className="grid grid-cols-2 gap-y-1 text-xs text-slate-400 sm:grid-cols-4">
                    <span>
                      Ranking:{" "}
                      <span className="font-medium text-white">
                        {m.posicao ? `${m.posicao}º` : "—"}
                      </span>
                    </span>
                    <span>
                      Pontos: <span className="font-medium text-white">{m.pontos}</span>
                    </span>
                    <span>
                      Frequência:{" "}
                      <span className="font-medium text-white">
                        {m.frequenciaPercentual !== null ? `${m.frequenciaPercentual}%` : "—"}
                      </span>
                    </span>
                    <span>
                      Relatório:{" "}
                      <span
                        className={
                          m.relatorioDisponivel ? "font-medium text-status-verde" : "text-slate-500"
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

      <div className="rounded-xl border border-white/10 bg-nexus-surface p-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
          Histórico de pontuação
        </h2>
        {pontuacao && pontuacao.historico.length === 0 && (
          <p className="text-sm text-slate-400">Nenhuma pontuação lançada ainda.</p>
        )}
        {pontuacao && pontuacao.historico.length > 0 && (
          <div className="space-y-1 text-sm">
            {pontuacao.historico.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between border-t border-white/5 py-2"
              >
                <span className="text-slate-400">
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
