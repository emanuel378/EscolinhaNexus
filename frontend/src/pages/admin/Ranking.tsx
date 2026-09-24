import { useState } from "react";
import { useTurmas } from "../../hooks/useTurmas";
import { useRanking } from "../../hooks/useRanking";
import { Avatar } from "../../components/Avatar";
import { Spinner } from "../../components/Spinner";

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
      <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-wide text-white">
        Ranking mensal
      </h1>

      <div className="mb-4 flex gap-2">
        <input
          type="month"
          value={mesReferencia}
          onChange={(e) => setMesReferencia(e.target.value)}
          className="rounded-lg border border-white/10 bg-nexus-surface px-3 py-1.5 text-sm text-white outline-none transition focus:border-nexus-primary focus:ring-2 focus:ring-nexus-primary/40"
        />
        <select
          value={turmaId}
          onChange={(e) => setTurmaId(e.target.value)}
          className="rounded-lg border border-white/10 bg-nexus-surface px-3 py-1.5 text-sm text-white outline-none transition focus:border-nexus-primary focus:ring-2 focus:ring-nexus-primary/40"
        >
          <option value="">Todas as turmas</option>
          {turmas?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Spinner /> Carregando...
        </div>
      )}

      {data && data.ranking.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 bg-nexus-surface/50 p-8 text-center text-sm text-slate-400">
          Nenhum aluno ativo encontrado.
        </div>
      )}

      {data && data.ranking.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-nexus-surface">
          {data.ranking.map((item) => (
            <div
              key={item.alunoId}
              className="flex items-center justify-between border-b border-white/5 px-4 py-3 text-sm last:border-0"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    item.posicao <= 3
                      ? "bg-nexus-gold text-nexus-bg"
                      : "bg-white/10 text-slate-300"
                  }`}
                >
                  {item.posicao}
                </span>
                <Avatar nome={item.nome} fotoUrl={item.fotoUrl} tamanho="sm" />
                <div>
                  <p className="font-medium text-white">{item.nome}</p>
                  <p className="text-xs text-slate-500">{item.turma ?? "—"}</p>
                </div>
              </div>
              <span className="font-semibold text-nexus-gold">{item.pontos} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
