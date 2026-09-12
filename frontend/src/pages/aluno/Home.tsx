import { useQuery } from "@tanstack/react-query";
import * as alunoService from "../../services/aluno.service";
import { StatusBadge } from "../../components/StatusBadge";
import { useMinhaFrequencia } from "../../hooks/useFrequencia";
import { useMinhasPontuacoes } from "../../hooks/usePontuacoes";
import { useMeuRanking } from "../../hooks/useRanking";
import { useMeusRelatorios } from "../../hooks/useRelatorios";

export function AlunoHomePage() {
  const { data: aluno, isLoading, isError } = useQuery({
    queryKey: ["alunos", "me"],
    queryFn: alunoService.meuPerfil,
  });
  const { data: frequencia } = useMinhaFrequencia();
  const { data: pontuacao } = useMinhasPontuacoes();
  const { data: ranking } = useMeuRanking({});
  const { data: relatorios } = useMeusRelatorios();

  if (isLoading) return <p className="text-sm text-slate-500">Carregando...</p>;
  if (isError || !aluno) {
    return <p className="text-sm text-status-vermelho">Não foi possível carregar seu perfil.</p>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-lg font-semibold text-slate-900">
        Olá, {aluno.usuario.nome.split(" ")[0]}!
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Este é o seu espaço para acompanhar sua evolução no CT.
      </p>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Status</span>
          <StatusBadge status={aluno.status} />
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Turma</span>
          <span className="text-slate-900">{aluno.turma?.nome ?? "—"}</span>
        </div>
      </div>

      {frequencia && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Sua frequência</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">
            {frequencia.percentual}%
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {frequencia.presencas} presenças de {frequencia.totalRegistros} treinos registrados
          </p>
        </div>
      )}

      {pontuacao && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Sua pontuação</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{pontuacao.total} pts</p>
        </div>
      )}

      {ranking && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
          <p className="mb-3 text-sm text-slate-500">Ranking da turma ({ranking.mesReferencia})</p>
          {ranking.ranking.length === 0 && (
            <p className="text-sm text-slate-500">Sem pontuações neste mês.</p>
          )}
          <div className="space-y-1">
            {ranking.ranking.map((item) => (
              <div
                key={item.alunoId}
                className={`flex items-center justify-between rounded-lg px-2 py-1.5 text-sm ${
                  item.alunoId === aluno.id ? "bg-slate-100 font-semibold text-slate-900" : "text-slate-600"
                }`}
              >
                <span>
                  {item.posicao}º {item.nome}
                </span>
                <span>{item.pontos} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {relatorios && relatorios.length > 0 && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6">
          <p className="mb-3 text-sm text-slate-500">Relatórios mensais</p>
          <div className="space-y-3 text-xs">
            {relatorios.map((r) => (
              <div key={r.id} className="rounded-lg border border-slate-100 p-3">
                <p className="mb-2 font-medium text-slate-900">{r.mesReferencia}</p>
                <div className="mb-2 grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-slate-500">Técnico</p>
                    <p className="font-semibold text-slate-900">{r.notaTecnico}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Físico</p>
                    <p className="font-semibold text-slate-900">{r.notaFisico}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Tático</p>
                    <p className="font-semibold text-slate-900">{r.notaTatico}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Mental</p>
                    <p className="font-semibold text-slate-900">{r.notaMental}</p>
                  </div>
                </div>
                <p className="text-slate-600">
                  <span className="font-medium">Pontos fortes:</span> {r.pontosFortes}
                </p>
                <p className="text-slate-600">
                  <span className="font-medium">A melhorar:</span> {r.pontosMelhorar}
                </p>
                <p className="text-slate-600">
                  <span className="font-medium">Objetivo:</span> {r.objetivoProximoMes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
