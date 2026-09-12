import { useState } from "react";
import { useTurmas } from "../../hooks/useTurmas";
import { useRanking } from "../../hooks/useRanking";

function mesAtual() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
}

export function RankingPage() {
  const [mesReferencia, setMesReferencia] = useState(mesAtual());
  const [turmaId, setTurmaId] = useState("");
  const { data: turmas } = useTurmas();
  const { data, isLoading } = useRanking({ mesReferencia, turmaId: turmaId || undefined });

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-lg font-semibold text-slate-900">Ranking mensal</h1>

      <div className="mb-4 flex gap-2">
        <input
          type="month"
          value={mesReferencia}
          onChange={(e) => setMesReferencia(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        />
        <select
          value={turmaId}
          onChange={(e) => setTurmaId(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        >
          <option value="">Todas as turmas</option>
          {turmas?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Carregando...</p>}

      {data && data.ranking.length === 0 && (
        <p className="text-sm text-slate-500">Nenhum aluno ativo encontrado.</p>
      )}

      {data && data.ranking.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {data.ranking.map((item) => (
            <div
              key={item.alunoId}
              className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm last:border-0"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                  {item.posicao}
                </span>
                <div>
                  <p className="font-medium text-slate-900">{item.nome}</p>
                  <p className="text-xs text-slate-500">{item.turma ?? "—"}</p>
                </div>
              </div>
              <span className="font-semibold text-slate-900">{item.pontos} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
