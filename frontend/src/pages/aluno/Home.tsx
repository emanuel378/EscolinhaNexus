import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as alunoService from "../../services/aluno.service";
import { useMinhaFrequencia } from "../../hooks/useFrequencia";
import { useMinhasPontuacoes } from "../../hooks/usePontuacoes";
import { useMeuRanking } from "../../hooks/useRanking";
import { useMeuProximoTreino, useMeuHistoricoMensal } from "../../hooks/useAlunos";
import { useMeusRelatorios } from "../../hooks/useRelatorios";
import { RelatorioNotasResumo } from "../../components/RelatorioNotas";
import { iniciais } from "../../utils/nome";

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
  const { data: relatorios } = useMeusRelatorios();
  const { data: historicoMensal } = useMeuHistoricoMensal();

  if (isLoading) return <p className="text-sm text-slate-500">Carregando...</p>;
  if (isError || !aluno) {
    return <p className="text-sm text-status-vermelho">Não foi possível carregar seu perfil.</p>;
  }

  const minhaPosicao = ranking?.ranking.find((r) => r.alunoId === aluno.id);
  const ultimoRelatorio = relatorios?.[0];

  const mesesComDados = historicoMensal?.filter((m) => m.posicao !== null) ?? [];
  const atual = mesesComDados[mesesComDados.length - 1];
  const anterior = mesesComDados[mesesComDados.length - 2];

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-1 flex items-center gap-3">
        {aluno.fotoUrl ? (
          <img
            src={aluno.fotoUrl}
            alt={aluno.usuario.nome}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
            {iniciais(aluno.usuario.nome)}
          </div>
        )}
        <h1 className="text-lg font-semibold text-slate-900">
          Olá, {aluno.usuario.nome.split(" ")[0]}! 👋
        </h1>
      </div>
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

      {atual && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
          <p className="mb-2 text-sm font-semibold text-slate-900">📊 Resumo da evolução</p>
          {anterior ? (
            <div className="space-y-1 text-sm text-slate-600">
              <p>
                Ranking: {anterior.posicao}º → <span className="font-medium text-slate-900">{atual.posicao}º</span>
              </p>
              <p>
                Pontos: {anterior.pontos} → <span className="font-medium text-slate-900">{atual.pontos}</span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              Ainda não há dados de meses anteriores para comparar.
            </p>
          )}
          <Link to="/aluno/evolucao" className="mt-2 inline-block text-xs text-slate-500 hover:underline">
            Ver evolução completa →
          </Link>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">📋 Último relatório</p>
          <Link to="/aluno/relatorios" className="text-xs text-slate-500 hover:underline">
            Ver todos →
          </Link>
        </div>
        {ultimoRelatorio ? (
          <>
            <p className="mb-2 text-xs text-slate-500">{ultimoRelatorio.mesReferencia}</p>
            <RelatorioNotasResumo notas={ultimoRelatorio} />
          </>
        ) : (
          <p className="text-sm text-slate-500">Nenhum relatório disponível ainda.</p>
        )}
      </div>
    </div>
  );
}
