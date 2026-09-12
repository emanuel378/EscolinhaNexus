import { useMeusRelatorios } from "../../hooks/useRelatorios";
import { RelatorioNotasResumo } from "../../components/RelatorioNotas";

export function AlunoRelatoriosPage() {
  const { data: relatorios, isLoading } = useMeusRelatorios();

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-lg font-semibold text-slate-900">📋 Relatórios mensais</h1>

      {isLoading && <p className="text-sm text-slate-500">Carregando...</p>}
      {relatorios && relatorios.length === 0 && (
        <p className="text-sm text-slate-500">Nenhum relatório disponível ainda.</p>
      )}

      {relatorios && relatorios.length > 0 && (
        <div className="space-y-4">
          {relatorios.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-200 bg-white p-6 text-sm">
              <p className="mb-3 font-medium text-slate-900">{r.mesReferencia}</p>
              <RelatorioNotasResumo notas={r} />
              <p className="mb-2 mt-2 text-slate-600">
                <span className="font-medium text-slate-900">Pontos fortes:</span>{" "}
                {r.pontosFortes}
              </p>
              <p className="mb-2 text-slate-600">
                <span className="font-medium text-slate-900">A melhorar:</span>{" "}
                {r.pontosMelhorar}
              </p>
              <p className="text-slate-600">
                <span className="font-medium text-slate-900">Objetivo do próximo mês:</span>{" "}
                {r.objetivoProximoMes}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
