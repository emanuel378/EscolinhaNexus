import { useMinhasPontuacoes } from "../../hooks/usePontuacoes";
import { useMinhaFrequencia } from "../../hooks/useFrequencia";

export function AlunoEvolucaoPage() {
  const { data: pontuacao, isLoading } = useMinhasPontuacoes();
  const { data: frequencia } = useMinhaFrequencia();

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
