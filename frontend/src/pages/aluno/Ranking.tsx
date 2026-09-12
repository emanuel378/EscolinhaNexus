import { useQuery } from "@tanstack/react-query";
import * as alunoService from "../../services/aluno.service";
import { useMeuRanking } from "../../hooks/useRanking";

export function AlunoRankingPage() {
  const { data: aluno } = useQuery({ queryKey: ["alunos", "me"], queryFn: alunoService.meuPerfil });
  const { data, isLoading } = useMeuRanking({});

  if (isLoading) return <p className="text-sm text-slate-500">Carregando...</p>;
  if (!data || !aluno) return null;

  const indice = data.ranking.findIndex((r) => r.alunoId === aluno.id);
  const eu = indice >= 0 ? data.ranking[indice] : null;
  const daFrente = indice > 0 ? data.ranking[indice - 1] : null;
  const deTras = indice >= 0 && indice < data.ranking.length - 1 ? data.ranking[indice + 1] : null;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-lg font-semibold text-slate-900">
        🏆 Ranking — {data.mesReferencia}
      </h1>

      {eu && (
        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-6 text-sm">
          <p className="mb-2 text-slate-900">
            Você está em <span className="font-semibold">{eu.posicao}º lugar</span>, com{" "}
            <span className="font-semibold">{eu.pontos} pontos</span>.
          </p>
          {daFrente && (
            <p className="text-slate-600">
              {daFrente.posicao}º lugar ({daFrente.nome}): {daFrente.pontos} pontos → faltam{" "}
              <span className="font-semibold text-status-amarelo">
                {daFrente.pontos - eu.pontos}
              </span>{" "}
              pontos.
            </p>
          )}
          {deTras && (
            <p className="text-slate-600">
              {deTras.posicao}º lugar ({deTras.nome}): {deTras.pontos} pontos → você está{" "}
              <span className="font-semibold text-status-verde">{eu.pontos - deTras.pontos}</span>{" "}
              pontos à frente.
            </p>
          )}
          {!daFrente && <p className="text-status-verde">Você está em 1º lugar! 🎉</p>}
        </div>
      )}

      {data.ranking.length === 0 && (
        <p className="text-sm text-slate-500">Sem pontuações neste mês.</p>
      )}

      {data.ranking.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {data.ranking.map((item) => (
            <div
              key={item.alunoId}
              className={`flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm last:border-0 ${
                item.alunoId === aluno.id ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-600"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
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
