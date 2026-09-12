import { useQuery } from "@tanstack/react-query";
import * as alunoService from "../../services/aluno.service";
import { useMinhaFrequencia } from "../../hooks/useFrequencia";
import { useMinhasPontuacoes } from "../../hooks/usePontuacoes";
import { useMeuRanking } from "../../hooks/useRanking";
import { useMeuProximoTreino } from "../../hooks/useAlunos";

function formatarDiaHora(data: string, horaInicio: string) {
  const dataFormatada = new Date(data + "T00:00:00").toLocaleDateString("pt-BR", {
    weekday: "long",
  });
  const dia = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1);
  return `${dia} — ${horaInicio}`;
}

export function AlunoHomePage() {
  const { data: aluno, isLoading, isError } = useQuery({
    queryKey: ["alunos", "me"],
    queryFn: alunoService.meuPerfil,
  });
  const { data: frequencia } = useMinhaFrequencia();
  const { data: pontuacao } = useMinhasPontuacoes();
  const { data: ranking } = useMeuRanking({});
  const { data: proximoTreino } = useMeuProximoTreino();

  if (isLoading) return <p className="text-sm text-slate-500">Carregando...</p>;
  if (isError || !aluno) {
    return <p className="text-sm text-status-vermelho">Não foi possível carregar seu perfil.</p>;
  }

  const minhaPosicao = ranking?.ranking.find((r) => r.alunoId === aluno.id);

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-lg font-semibold text-slate-900">
        Olá, {aluno.usuario.nome.split(" ")[0]}! 👋
      </h1>
      <p className="mb-6 text-sm text-slate-500">
        Este é o seu espaço para acompanhar sua evolução no CT.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">🏆 Ranking</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {minhaPosicao ? `${minhaPosicao.posicao}º lugar` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">⭐ Pontuação</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {pontuacao ? `${pontuacao.total} pts` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">📅 Frequência</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {frequencia ? `${frequencia.percentual}%` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">🏐 Próximo treino</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {proximoTreino ? formatarDiaHora(proximoTreino.data, proximoTreino.horaInicio) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
