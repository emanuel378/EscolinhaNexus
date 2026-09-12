import { Link } from "react-router-dom";
import { useDashboard } from "../../hooks/useDashboard";

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

  if (isLoading) return <p className="text-sm text-slate-500">Carregando...</p>;
  if (isError || !data) {
    return <p className="text-sm text-status-vermelho">Não foi possível carregar o painel.</p>;
  }

  return (
    <div>
      <h1 className="mb-1 text-lg font-semibold text-slate-900">Painel do administrador</h1>
      <p className="mb-6 text-sm text-slate-500">
        Resumo de {formatarMesReferencia(data.mesReferencia)}.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Alunos ativos</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{data.alunosAtivos}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Alunos novos no mês</p>
          <p className="mt-1 text-2xl font-semibold text-status-verde">+{data.alunosNovos}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Saíram no mês</p>
          <p className="mt-1 text-2xl font-semibold text-status-vermelho">
            {data.alunosSairamEsteMes}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Frequência média do mês</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{data.frequenciaMediaMes}%</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">🟢 Pagamentos em dia</p>
          <p className="mt-1 text-2xl font-semibold text-status-verde">{data.pagamentos.pago}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">🟡 Pendentes</p>
          <p className="mt-1 text-2xl font-semibold text-status-amarelo">
            {data.pagamentos.pendente}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">🔴 Atrasados</p>
          <p className="mt-1 text-2xl font-semibold text-status-vermelho">
            {data.pagamentos.atrasado}
          </p>
        </div>
      </div>

      <Link
        to="/admin/relatorios"
        className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 hover:bg-slate-50"
      >
        <div>
          <p className="text-sm text-slate-500">📋 Relatórios do mês</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {data.relatoriosLancados} de {data.relatoriosTotal}
          </p>
        </div>
        <span className="text-xs text-slate-500">Ver detalhes →</span>
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">🏆 Ranking atual</h2>
            <Link to="/admin/ranking" className="text-xs text-slate-500 hover:underline">
              Ver completo →
            </Link>
          </div>
          {data.rankingTop.length === 0 && (
            <p className="text-sm text-slate-500">Nenhuma pontuação lançada este mês.</p>
          )}
          <div className="space-y-1">
            {data.rankingTop.map((item) => (
              <div
                key={item.alunoId}
                className="flex items-center justify-between rounded-lg px-2 py-1.5 text-sm text-slate-700"
              >
                <span>
                  {item.posicao}º {item.nome}
                </span>
                <span className="font-medium text-slate-900">{item.pontos} pts</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">🏐 Próximos treinos</h2>
            <Link to="/admin/treinos" className="text-xs text-slate-500 hover:underline">
              Ver todos →
            </Link>
          </div>
          {data.proximosTreinos.length === 0 && (
            <p className="text-sm text-slate-500">Nenhum treino agendado.</p>
          )}
          <div className="space-y-2">
            {data.proximosTreinos.map((treino) => (
              <div key={treino.id} className="border-t border-slate-100 pt-2 text-sm first:border-0 first:pt-0">
                <p className="font-medium text-slate-900">
                  {new Date(treino.data + "T00:00:00").toLocaleDateString("pt-BR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "2-digit",
                  })}{" "}
                  · {treino.horaInicio}
                </p>
                <p className="text-xs text-slate-500">
                  {treino.turma ?? "—"} · {treino.tipo} · {treino.local}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <Link to="/admin/alunos" className="text-sm font-medium text-slate-900 hover:underline">
          Ver todos os alunos →
        </Link>
        <Link to="/admin/turmas" className="text-sm font-medium text-slate-900 hover:underline">
          Gerenciar turmas →
        </Link>
        <Link to="/admin/treinos" className="text-sm font-medium text-slate-900 hover:underline">
          Gerenciar treinos →
        </Link>
      </div>
    </div>
  );
}
