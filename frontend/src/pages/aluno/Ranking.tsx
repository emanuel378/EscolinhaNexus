import { useQuery } from "@tanstack/react-query";
import * as alunoService from "../../services/aluno.service";
import { useMeuRanking } from "../../hooks/useRanking";
import { Spinner } from "../../components/Spinner";

export function AlunoRankingPage() {
  const { data: aluno } = useQuery({ queryKey: ["alunos", "me"], queryFn: alunoService.meuPerfil });
  const { data, isLoading } = useMeuRanking({});

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Spinner /> Carregando...
      </div>
    );
  }
  if (!data || !aluno) return null;

  const indice = data.ranking.findIndex((r) => r.alunoId === aluno.id);
  const eu = indice >= 0 ? data.ranking[indice] : null;
  const daFrente = indice > 0 ? data.ranking[indice - 1] : null;
  const deTras = indice >= 0 && indice < data.ranking.length - 1 ? data.ranking[indice + 1] : null;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 font-display text-2xl font-bold uppercase tracking-wide text-white">
        Ranking — {data.mesReferencia}
      </h1>

      {eu && (
        <div className="mb-4 mt-4 rounded-xl border border-white/10 bg-nexus-surface p-6 text-sm">
          <p className="mb-2 text-white">
            Você está em <span className="font-semibold text-nexus-primary">{eu.posicao}º lugar</span>, com{" "}
            <span className="font-semibold text-nexus-gold">{eu.pontos} pontos</span>.
          </p>
          {daFrente && (
            <p className="text-slate-400">
              {daFrente.posicao}º lugar ({daFrente.nome}): {daFrente.pontos} pontos → faltam{" "}
              <span className="font-semibold text-status-amarelo">
                {daFrente.pontos - eu.pontos}
              </span>{" "}
              pontos.
            </p>
          )}
          {deTras && (
            <p className="text-slate-400">
              {deTras.posicao}º lugar ({deTras.nome}): {deTras.pontos} pontos → você está{" "}
              <span className="font-semibold text-status-verde">{eu.pontos - deTras.pontos}</span>{" "}
              pontos à frente.
            </p>
          )}
          {!daFrente && <p className="font-semibold text-status-verde">Você está em 1º lugar! 🎉</p>}
        </div>
      )}

      {data.ranking.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 bg-nexus-surface/50 p-8 text-center text-sm text-slate-400">
          Sem pontuações neste mês.
        </div>
      )}

      {data.ranking.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-nexus-surface">
          {data.ranking.map((item) => (
            <div
              key={item.alunoId}
              className={`flex items-center justify-between border-b border-white/5 px-4 py-3 text-sm last:border-0 ${
                item.alunoId === aluno.id
                  ? "border-l-2 border-l-nexus-primary bg-nexus-primary/10 font-semibold text-white"
                  : "text-slate-400"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    item.posicao <= 3 ? "bg-nexus-gold text-nexus-bg" : "bg-white/10 text-slate-300"
                  }`}
                >
                  {item.posicao}
                </span>
                <span>{item.nome}</span>
              </div>
              <span>{item.pontos} pts</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
