import { Link } from "react-router-dom";
import { useDashboard } from "../../hooks/useDashboard";
import { Avatar } from "../../components/Avatar";
import { Spinner } from "../../components/Spinner";

function formatarMesReferencia(mesReferencia: string) {
  const [ano, mes] = mesReferencia.split("-");
  const nomes = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return `${nomes[Number(mes) - 1]}/${ano}`;
}

export function AdminDashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Spinner /> Carregando...
      </div>
    );
  }
  if (isError || !data) {
    return <p className="text-sm text-red-400">Não foi possível carregar o painel.</p>;
  }

  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-bold uppercase tracking-wide text-white">
        Painel do administrador
      </h1>
      <p className="mb-6 text-sm text-slate-400">
        Resumo de {formatarMesReferencia(data.mesReferencia)}.
      </p>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-nexus-surface p-5 transition hover:border-nexus-primary/30">
          <p className="text-sm text-slate-400">Alunos ativos</p>
          <p className="mt-1 font-display text-3xl font-bold text-nexus-primary">
            {data.alunosAtivos}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-nexus-surface p-5 transition hover:border-nexus-primary/30">
          <p className="text-sm text-slate-400">Alunos novos no mês</p>
          <p className="mt-1 font-display text-3xl font-bold text-status-verde">
            +{data.alunosNovos}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-nexus-surface p-5 transition hover:border-nexus-primary/30">
          <p className="text-sm text-slate-400">Saíram no mês</p>
          <p className="mt-1 font-display text-3xl font-bold text-status-vermelho">
            {data.alunosSairamEsteMes}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-nexus-surface p-5 transition hover:border-nexus-primary/30">
          <p className="text-sm text-slate-400">Frequência média do mês</p>
          <p className="mt-1 font-display text-3xl font-bold text-white">
            {data.frequenciaMediaMes}%
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-nexus-surface p-5">
          <p className="text-sm text-slate-400">Pagamentos em dia</p>
          <p className="mt-1 font-display text-3xl font-bold text-status-verde">
            {data.pagamentos.pago}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-nexus-surface p-5">
          <p className="text-sm text-slate-400">Pendentes</p>
          <p className="mt-1 font-display text-3xl font-bold text-status-amarelo">
            {data.pagamentos.pendente}
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-nexus-surface p-5">
          <p className="text-sm text-slate-400">Atrasados</p>
          <p className="mt-1 font-display text-3xl font-bold text-status-vermelho">
            {data.pagamentos.atrasado}
          </p>
        </div>
      </div>

      <Link
        to="/admin/relatorios"
        className="mt-4 flex items-center justify-between rounded-xl border border-nexus-primary/30 bg-nexus-surface p-5 transition hover:bg-white/5"
      >
        <div>
          <p className="text-sm text-slate-400">Relatórios do mês</p>
          <p className="mt-1 font-display text-3xl font-bold text-white">
            {data.relatoriosLancados} <span className="text-slate-500">de</span>{" "}
            {data.relatoriosTotal}
          </p>
        </div>
        <span className="text-xs font-medium text-nexus-highlight">Ver detalhes →</span>
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-nexus-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Ranking atual
            </h2>
            <Link to="/admin/ranking" className="text-xs text-nexus-highlight hover:underline">
              Ver completo →
            </Link>
          </div>
          {data.rankingTop.length === 0 && (
            <p className="text-sm text-slate-400">Nenhuma pontuação lançada este mês.</p>
          )}
          <div className="space-y-1">
            {data.rankingTop.map((item) => (
              <div
                key={item.alunoId}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-slate-300"
              >
                <div className="flex items-center gap-2">
                  <Avatar nome={item.nome} fotoUrl={item.fotoUrl} tamanho="sm" />
                  <span>
                    {item.posicao}º {item.nome}
                  </span>
                </div>
                <span className="font-semibold text-nexus-gold">{item.pontos} pts</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-nexus-surface p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
              Próximos treinos
            </h2>
            <Link to="/admin/treinos" className="text-xs text-nexus-highlight hover:underline">
              Ver todos →
            </Link>
          </div>
          {data.proximosTreinos.length === 0 && (
            <p className="text-sm text-slate-400">Nenhum treino agendado.</p>
          )}
          <div className="space-y-2">
            {data.proximosTreinos.map((treino) => (
              <div key={treino.id} className="border-t border-white/5 pt-2 text-sm first:border-0 first:pt-0">
                <p className="font-medium text-white">
                  {new Date(treino.data + "T00:00:00").toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                  })}{" "}
                  · {treino.horaInicio}
                </p>
                <p className="text-xs text-slate-400">
                  {treino.turma ?? "—"} · {treino.tipo} · {treino.local}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
        <Link
          to="/admin/alunos"
          className="text-sm font-medium text-nexus-highlight hover:text-nexus-primary hover:underline"
        >
          Ver todos os alunos →
        </Link>
        <Link
          to="/admin/turmas"
          className="text-sm font-medium text-nexus-highlight hover:text-nexus-primary hover:underline"
        >
          Gerenciar turmas →
        </Link>
        <Link
          to="/admin/treinos"
          className="text-sm font-medium text-nexus-highlight hover:text-nexus-primary hover:underline"
        >
          Gerenciar treinos →
        </Link>
      </div>
    </div>
  );
}
