import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useDashboard } from "../../hooks/useDashboard";
import { Icon } from "../../components/Icon";
import {
  AvatarAtleta,
  Barra,
  CabecalhoPagina,
  Esqueleto,
  EstadoVazio,
  MensagemErro,
} from "../../components/AdminUI";
import { rotuloDia } from "../../utils/data";

const MESES = [
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

function formatarMesReferencia(mesReferencia: string) {
  const [ano, mes] = mesReferencia.split("-");
  return `${MESES[Number(mes) - 1]} ${ano}`;
}

function percentual(parte: number, total: number) {
  return total > 0 ? Math.round((parte / total) * 1000) / 10 : 0;
}

function CardMetrica({
  rotulo,
  icone,
  valor,
  sufixo,
  rodape,
  corValor = "text-nexus-primary",
  corIcone = "text-nexus-primary",
}: {
  rotulo: string;
  icone: string;
  valor: number | string;
  sufixo?: string;
  rodape?: ReactNode;
  corValor?: string;
  corIcone?: string;
}) {
  return (
    <div className="card p-4 transition hover:border-nexus-primary/30 lg:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="label-up text-slate-300">{rotulo}</p>
        <Icon name={icone} className={`text-[22px] ${corIcone}`} />
      </div>
      <p className={`num mt-2 text-[28px] leading-8 lg:text-[40px] lg:leading-[44px] ${corValor}`}>
        {valor}
        {sufixo && <span className="ml-0.5 text-lg">{sufixo}</span>}
      </p>
      {rodape && <div className="mt-1.5 text-xs text-slate-400">{rodape}</div>}
    </div>
  );
}

export function AdminDashboardPage() {
  const { data, isLoading, isError } = useDashboard();

  if (isLoading) return <Esqueleto linhas={4} altura="h-32" />;
  if (isError || !data) return <MensagemErro>Não foi possível carregar o painel.</MensagemErro>;

  const proximo = data.proximosTreinos[0];
  const demaisTreinos = data.proximosTreinos.slice(1);
  const { pago, pendente, atrasado } = data.pagamentos;
  const totalPagamentos = pago + pendente + atrasado;
  const progressoRelatorios = percentual(data.relatoriosLancados, data.relatoriosTotal);
  const [lider, ...demaisRanking] = data.rankingTop;

  return (
    <div>
      <CabecalhoPagina
        rotulo="Centro de Treinamento Nexus"
        titulo="Painel geral do treinador"
        acao={
          <span className="chip-azul">
            <Icon name="calendar_month" className="text-[16px]" />
            {formatarMesReferencia(data.mesReferencia)}
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        <div className="space-y-4 lg:col-span-2 lg:space-y-6">
          {/* Próximo treino */}
          <section className="relative overflow-hidden rounded-xl border border-nexus-primary/30 bg-gradient-to-br from-[#0d2a40] via-nexus-surface to-nexus-surface p-5 lg:p-6">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-nexus-primary/20 blur-3xl" />
            {proximo ? (
              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="label-up flex items-center gap-2 text-nexus-highlight">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-nexus-primary" />
                    Próximo treino na quadra
                  </p>
                  <span className="rounded-lg border border-white/10 bg-nexus-bg/40 px-2.5 py-1 font-chivo text-sm font-bold text-nexus-highlight">
                    {rotuloDia(proximo.data)} • {proximo.horaInicio} - {proximo.horaFim}
                  </span>
                </div>
                <p className="mt-3 font-chivo text-xl font-extrabold text-white lg:text-2xl">
                  {proximo.turma ?? "Turma"}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-300">
                  <Icon name="sports_volleyball" className="text-[18px] text-nexus-primary" />
                  {proximo.local} • {proximo.tipo}
                </p>
                <Link
                  to={`/admin/treinos/${proximo.id}/chamada`}
                  className="btn-primario mt-4 w-full text-base shadow-nexus-glow sm:w-auto sm:px-8"
                >
                  <Icon name="fact_check" className="text-[22px]" />
                  Fazer chamada de quadra
                </Link>
              </div>
            ) : (
              <div className="relative flex items-center gap-3 text-sm text-slate-300">
                <Icon name="event_busy" className="text-[28px] text-nexus-primary" />
                <div>
                  <p className="font-semibold text-white">Nenhum treino agendado.</p>
                  <Link to="/admin/treinos/novo" className="text-nexus-highlight hover:underline">
                    Agendar um treino →
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* Métricas */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
            <CardMetrica
              rotulo="Alunos ativos"
              icone="group"
              valor={data.alunosAtivos}
              rodape={`${data.alunosInativos} inativos`}
            />
            <CardMetrica
              rotulo="Novos no mês"
              icone="person_add"
              valor={String(data.alunosNovos).padStart(2, "0")}
              corValor="text-white"
              corIcone="text-nexus-gold"
              rodape={<span className="text-nexus-highlight">matrículas no mês</span>}
            />
            <CardMetrica
              rotulo="Evasão / mês"
              icone="person_remove"
              valor={String(data.alunosSairamEsteMes).padStart(2, "0")}
              corValor="text-white"
              corIcone="text-red-400"
              rodape={
                <span className="flex items-center gap-1.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      data.alunosSairamEsteMes > 0 ? "bg-red-400" : "bg-status-verde"
                    }`}
                  />
                  {data.alunosSairamEsteMes > 0 ? "alunos saíram" : "nenhuma saída"}
                </span>
              }
            />
            <CardMetrica
              rotulo="Frequência média"
              icone="bolt"
              valor={data.frequenciaMediaMes}
              sufixo="%"
              corValor="text-nexus-gold"
              corIcone="text-nexus-gold"
              rodape={<Barra valor={data.frequenciaMediaMes} cor="dourado" className="mt-2" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-5 lg:gap-6">
            {/* Mensalidades */}
            <section className="card p-5 xl:col-span-3 lg:p-6">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <p className="label-up text-nexus-gold">Gestão financeira</p>
                  <h2 className="font-chivo text-lg font-bold text-white">Situação das mensalidades</h2>
                </div>
                <span className="text-sm text-slate-400">
                  Total: <span className="num text-white">{totalPagamentos}</span>
                </span>
              </div>
              <div className="mb-4 flex h-3 w-full overflow-hidden rounded-full bg-white/10">
                <div className="bg-status-verde" style={{ width: `${percentual(pago, totalPagamentos)}%` }} />
                <div className="bg-status-amarelo" style={{ width: `${percentual(pendente, totalPagamentos)}%` }} />
                <div className="bg-status-vermelho" style={{ width: `${percentual(atrasado, totalPagamentos)}%` }} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { rotulo: "Em dia", valor: pago, cor: "bg-status-verde", texto: "text-green-500" },
                  { rotulo: "Pendentes", valor: pendente, cor: "bg-status-amarelo", texto: "text-yellow-500" },
                  { rotulo: "Atrasados", valor: atrasado, cor: "bg-status-vermelho", texto: "text-red-500" },
                ].map((item) => (
                  <div key={item.rotulo} className="rounded-lg bg-nexus-bg/50 p-3 text-center">
                    <p className={`flex items-center justify-center gap-1.5 text-xs font-semibold ${item.texto}`}>
                      <span className={`h-2 w-2 rounded-full ${item.cor}`} />
                      {item.rotulo}
                    </p>
                    <p className="num mt-1 text-2xl text-white">{String(item.valor).padStart(2, "0")}</p>
                    <p className="text-xs text-slate-400">{percentual(item.valor, totalPagamentos)}%</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Relatórios */}
            <Link
              to="/admin/relatorios"
              className="card group flex flex-col p-5 transition hover:border-nexus-primary/40 xl:col-span-2 lg:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-nexus-primary/15 text-nexus-primary">
                  <Icon name="assignment_turned_in" className="text-[24px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="font-chivo text-lg font-bold leading-6 text-white">
                    Avaliações técnicas do mês
                  </h2>
                  <p className="text-xs text-slate-400">Relatórios mensais de desempenho</p>
                </div>
                <span className="num text-sm text-nexus-highlight">{Math.round(progressoRelatorios)}%</span>
              </div>
              <div className="mt-auto pt-5">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-300">Progresso mensal</span>
                  <span className="text-white">
                    {data.relatoriosLancados} de {data.relatoriosTotal} atletas
                  </span>
                </div>
                <Barra valor={progressoRelatorios} />
                <p className="mt-4 flex items-center justify-between text-sm font-semibold text-nexus-highlight">
                  Ver detalhes e pendências
                  <Icon name="arrow_forward" className="text-[20px] transition group-hover:translate-x-1" />
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="space-y-4 lg:space-y-6">
          {/* Ranking */}
          <section className="card p-5 lg:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <Icon name="emoji_events" className="text-[26px] text-nexus-gold" />
                <div>
                  <p className="label-up text-nexus-gold">Performance de pontos</p>
                  <h2 className="font-chivo text-lg font-bold text-white">Líderes do mês</h2>
                </div>
              </div>
              <Link to="/admin/ranking" className="text-sm font-semibold text-nexus-highlight hover:underline">
                Ver geral
              </Link>
            </div>

            {!lider && <EstadoVazio icone="emoji_events">Nenhuma pontuação lançada este mês.</EstadoVazio>}

            {lider && (
              <div className="space-y-2">
                <Link
                  to={`/admin/alunos/${lider.alunoId}`}
                  className="flex items-center gap-3 rounded-xl border border-nexus-gold/40 bg-nexus-gold/[0.07] p-3 shadow-nexus-gold"
                >
                  <span className="relative">
                    <AvatarAtleta nome={lider.nome} fotoUrl={lider.fotoUrl} destaque />
                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-nexus-gold font-chivo text-[11px] font-extrabold text-nexus-bg">
                      1
                    </span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{lider.nome}</p>
                    <p className="truncate text-xs text-slate-400">{lider.turma ?? "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="num text-2xl text-nexus-gold">{lider.pontos.toLocaleString("pt-BR")}</p>
                    <p className="label-up text-nexus-gold">pontos</p>
                  </div>
                </Link>
                {demaisRanking.map((item) => (
                  <Link
                    key={item.alunoId}
                    to={`/admin/alunos/${item.alunoId}`}
                    className="flex items-center gap-3 rounded-xl bg-nexus-bg/50 p-3 transition hover:bg-white/5"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 font-chivo text-sm font-bold text-slate-300">
                      {item.posicao}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">{item.nome}</p>
                      <p className="truncate text-xs text-slate-400">{item.turma ?? "—"}</p>
                    </div>
                    <div className="text-right">
                      <p className="num text-lg text-white">{item.pontos.toLocaleString("pt-BR")}</p>
                      <p className="label-up text-slate-500">pontos</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Próximos treinos */}
          <section className="card p-5 lg:p-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-chivo text-base font-bold uppercase tracking-wide text-white">
                Próximos treinos
              </h2>
              <Link to="/admin/treinos" className="text-sm font-semibold text-nexus-highlight hover:underline">
                Ver todos
              </Link>
            </div>
            {demaisTreinos.length === 0 && (
              <p className="text-sm text-slate-400">
                {proximo ? "Nenhum outro treino agendado." : "Nenhum treino agendado."}
              </p>
            )}
            <div className="space-y-2">
              {demaisTreinos.map((treino) => (
                <Link
                  key={treino.id}
                  to={`/admin/treinos/${treino.id}/chamada`}
                  className="flex items-center gap-3 rounded-lg bg-nexus-bg/50 p-3 transition hover:bg-white/5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-nexus-primary/10 text-nexus-primary">
                    <Icon name="sports_volleyball" className="text-[22px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">
                      {rotuloDia(treino.data)} • {treino.horaInicio}
                    </p>
                    <p className="truncate text-xs text-slate-400">
                      {treino.turma ?? "—"} • {treino.local}
                    </p>
                  </div>
                  <Icon name="chevron_right" className="text-[20px] text-slate-500" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
