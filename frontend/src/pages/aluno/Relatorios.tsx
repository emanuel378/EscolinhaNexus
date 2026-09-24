import { useMeusRelatorios } from "../../hooks/useRelatorios";
import { RelatorioNotasResumo } from "../../components/RelatorioNotas";
import { Spinner } from "../../components/Spinner";

export function AlunoRelatoriosPage() {
  const { data: relatorios, isLoading } = useMeusRelatorios();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 font-display text-2xl font-bold uppercase tracking-wide text-white">
        Relatórios mensais
      </h1>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Spinner /> Carregando...
        </div>
      )}
      {relatorios && relatorios.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 bg-nexus-surface/50 p-8 text-center text-sm text-slate-400">
          Nenhum relatório disponível ainda.
        </div>
      )}

      {relatorios && relatorios.length > 0 && (
        <div className="space-y-4">
          {relatorios.map((r) => (
            <div key={r.id} className="rounded-xl border border-white/10 bg-nexus-surface p-6 text-sm">
              <p className="mb-3 font-medium text-white">{r.mesReferencia}</p>
              <RelatorioNotasResumo notas={r} />
              <p className="mb-2 mt-2 text-slate-400">
                <span className="font-medium text-nexus-highlight">Pontos fortes:</span>{" "}
                {r.pontosFortes}
              </p>
              <p className="mb-2 text-slate-400">
                <span className="font-medium text-nexus-highlight">A melhorar:</span>{" "}
                {r.pontosMelhorar}
              </p>
              <p className="text-slate-400">
                <span className="font-medium text-nexus-highlight">Objetivo do próximo mês:</span>{" "}
                {r.objetivoProximoMes}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
