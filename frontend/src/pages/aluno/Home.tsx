import { useQuery } from "@tanstack/react-query";
import * as alunoService from "../../services/aluno.service";
import { StatusBadge } from "../../components/StatusBadge";
import { useMinhaFrequencia } from "../../hooks/useFrequencia";

export function AlunoHomePage() {
  const { data: aluno, isLoading, isError } = useQuery({
    queryKey: ["alunos", "me"],
    queryFn: alunoService.meuPerfil,
  });
  const { data: frequencia } = useMinhaFrequencia();

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

      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-400">
        Ranking, pontuação e relatórios mensais chegam nas próximas fases.
      </div>
    </div>
  );
}
