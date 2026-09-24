import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as alunoService from "../../services/aluno.service";
import { useMinhaFrequencia } from "../../hooks/useFrequencia";
import { useMeuRanking } from "../../hooks/useRanking";
import { useMeuProximoTreino } from "../../hooks/useAlunos";
import { useMeusRelatorios } from "../../hooks/useRelatorios";
import { useMinhasMensalidades } from "../../hooks/useMensalidades";
import { ProgressRing } from "../../components/ProgressRing";
import { StatusBadge } from "../../components/StatusBadge";
import { Spinner } from "../../components/Spinner";
import {
  IconArrowRight,
  IconCalendar,
  IconClipboard,
  IconClock,
  IconFlame,
  IconPin,
  IconStar,
  IconTrophy,
  IconWallet,
} from "../../components/Icons";
import { HistoricoFrequencia, NotasRelatorio } from "../../types";
import { RELATORIO_CATEGORIAS } from "../../utils/relatorio";
import { formatarData, formatarMesCurto, mesAtual, rotuloDia } from "../../utils/data";

const card = "rounded-2xl border border-white/10 bg-nexus-surface";

function mediaGeral(notas: NotasRelatorio) {
  const campos = RELATORIO_CATEGORIAS.flatMap((c) => c.campos.map((x) => x.campo));
  const soma = campos.reduce((acc, campo) => acc + notas[campo], 0);
  return Math.round((soma / campos.length) * 10) / 10;
}

// Frequência só do mês corrente (o endpoint devolve o histórico completo) e a
// sequência atual de presenças, contada do treino mais recente para trás.
function resumoFrequencia(frequencia: HistoricoFrequencia | undefined) {
  const mes = mesAtual();
  const registros = (frequencia?.historico ?? [])
    .filter((h) => h.treino)
    .sort((a, b) => b.treino!.data.localeCompare(a.treino!.data));

  const doMes = registros.filter((h) => h.treino!.data.startsWith(mes));
  const presencasMes = doMes.filter((h) => h.status === "presente").length;

  let sequencia = 0;
  for (const h of registros) {
    if (h.status !== "presente") break;
    sequencia += 1;
  }

  return {
    presencasMes,
    totalMes: doMes.length,
    percentualMes: doMes.length ? Math.round((presencasMes / doMes.length) * 100) : null,
    sequencia,
  };
}

export function AlunoHomePage() {
  const { data: aluno, isLoading, isError } = useQuery({
    queryKey: ["alunos", "me"],
    queryFn: alunoService.meuPerfil,
  });
  const { data: frequencia } = useMinhaFrequencia();
  const { data: ranking } = useMeuRanking({});
  const { data: proximoTreino } = useMeuProximoTreino();
  const { data: relatorios } = useMeusRelatorios();
  const { data: mensalidades } = useMinhasMensalidades();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Spinner /> Carregando...
      </div>
    );
  }
  if (isError || !aluno) {
    return <p className="text-sm text-red-400">Não foi possível carregar seu perfil.</p>;
  }

  const primeiroNome = aluno.usuario.nome.split(" ")[0];
  const lista = ranking?.ranking ?? [];
  const indice = lista.findIndex((r) => r.alunoId === aluno.id);
  const eu = indice >= 0 ? lista[indice] : null;
  const daFrente = indice > 0 ? lista[indice - 1] : null;
  const lider = lista[0];
  const progressoLider = eu && lider?.pontos ? Math.round((eu.pontos / lider.pontos) * 100) : 0;

  const freq = resumoFrequencia(frequencia);
  const ultimoRelatorio = relatorios?.[0];

  const mensalidadeDoMes = mensalidades?.find((m) => m.mesReferencia === mesAtual());
  const proximaFatura = mensalidades
    ?.filter((m) => m.status !== "pago")
    .sort((a, b) => a.vencimento.localeCompare(b.vencimento))[0];
  const emDia = !mensalidades?.some((m) => m.status === "atrasado");

  return (
    <div className="space-y-5">
      {/* Saudação */}
      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-nexus-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-nexus-primary">
            <IconFlame className="h-3.5 w-3.5" /> Temporada {new Date().getFullYear()}
          </span>
          {aluno.turma && (
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
              {aluno.turma.nome}
            </span>
          )}
        </div>
        <h1 className="font-display text-3xl font-bold text-white">Olá, {primeiroNome}! 🏐</h1>
        <p className="mt-1 text-sm text-slate-400">
          Pronto pro próximo treino?
          {aluno.turma && (
            <>
              {" "}
              • <span className="text-slate-300">{aluno.turma.horarios}</span>
            </>
          )}
        </p>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Coluna esquerda */}
        <div className="space-y-5">
          {/* Ranking mensal */}
          <section
            className={`${card} relative overflow-hidden bg-gradient-to-br from-nexus-surface via-nexus-surface to-nexus-primary/15 p-5`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Ranking mensal • {ranking ? formatarMesCurto(ranking.mesReferencia) : "—"}
                </p>
                <p className="mt-1 font-display text-5xl font-bold leading-none text-white">
                  {eu?.pontos ?? 0}
                  <span className="ml-2 font-sans text-sm font-medium text-slate-400">
                    pts acumulados
                  </span>
                </p>
              </div>
              {eu && (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-nexus-gold px-3 py-1.5 text-xs font-bold text-nexus-bg shadow-[0_0_20px_rgba(255,210,0,0.35)]">
                  <IconTrophy className="h-4 w-4" />
                  {eu.posicao}º na turma
                </span>
              )}
            </div>

            {eu && lider && (
              <div className="mt-5">
                <div className="mb-1.5 flex justify-between text-xs text-slate-400">
                  <span>Seu ritmo: {eu.pontos} pts</span>
                  <span>
                    1º lugar: <span className="text-nexus-gold">{lider.pontos} pts</span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-nexus-primary to-nexus-highlight transition-[width] duration-700"
                    style={{ width: `${progressoLider}%` }}
                  />
                </div>
              </div>
            )}

            <Link
              to="/aluno/ranking"
              className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 bg-nexus-bg/60 p-3 transition hover:border-nexus-primary/40"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-nexus-primary/15 text-nexus-primary">
                <IconFlame className="h-5 w-5" />
              </span>
              <p className="flex-1 text-sm text-slate-300">
                {!eu ? (
                  "Você ainda não aparece no ranking deste mês."
                ) : daFrente ? (
                  <>
                    Faltam{" "}
                    <span className="font-semibold text-nexus-highlight">
                      {daFrente.pontos - eu.pontos} pontos
                    </span>{" "}
                    para o {daFrente.posicao}º lugar ({daFrente.nome.split(" ")[0]}: {daFrente.pontos}{" "}
                    pts)
                  </>
                ) : (
                  <span className="font-semibold text-nexus-gold">
                    Você lidera a turma! Continue assim. 👑
                  </span>
                )}
              </p>
              <IconArrowRight className="h-4 w-4 text-slate-500" />
            </Link>
          </section>

          {/* Próximo treino */}
          <section className={`${card} overflow-hidden`}>
            <div className="relative h-28 bg-[url('/images/login-bg.png')] bg-cover bg-center">
              <div className="absolute inset-0 bg-gradient-to-t from-nexus-bg via-nexus-bg/50 to-transparent" />
              <div className="absolute inset-x-4 bottom-3 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  <IconCalendar className="h-4 w-4 text-nexus-primary" /> Próximo treino
                </span>
                {proximoTreino && (
                  <span className="rounded-full bg-nexus-primary px-2.5 py-0.5 text-xs font-bold text-nexus-bg">
                    {rotuloDia(proximoTreino.data)}
                  </span>
                )}
              </div>
            </div>
            <div className="p-5">
              {proximoTreino ? (
                <>
                  <h2 className="font-display text-xl font-bold text-white">🏐 {proximoTreino.tipo}</h2>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2">
                      <IconClock className="h-4 w-4 text-nexus-primary" />
                      {formatarData(proximoTreino.data)} • {proximoTreino.horaInicio} às{" "}
                      {proximoTreino.horaFim}
                    </li>
                    <li className="flex items-center gap-2">
                      <IconPin className="h-4 w-4 text-nexus-primary" />
                      {proximoTreino.local}
                    </li>
                  </ul>
                  {proximoTreino.observacao && (
                    <p className="mt-3 rounded-lg bg-white/5 p-3 text-xs text-slate-400">
                      {proximoTreino.observacao}
                    </p>
                  )}
                  <Link
                    to="/aluno/calendario"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-nexus-primary to-sky-600 py-3 text-sm font-bold text-nexus-bg shadow-nexus-glow transition hover:brightness-110"
                  >
                    Ver no calendário <IconArrowRight className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <p className="text-sm text-slate-400">Nenhum treino agendado por enquanto.</p>
              )}
            </div>
          </section>
        </div>

        {/* Coluna direita */}
        <div className="space-y-5">
          {/* Desempenho no mês */}
          <section className={`${card} p-5`}>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2 className="font-display text-lg font-bold text-white">Desempenho no mês</h2>
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-[11px] text-slate-400">
                {freq.presencasMes} de {freq.totalMes} treinos
              </span>
            </div>
            <div className="flex items-center gap-5">
              <ProgressRing
                label="Presença"
                value={freq.percentualMes ?? 0}
                size={104}
                sublabel={freq.percentualMes !== null ? `${freq.percentualMes}%` : "—"}
              />
              <div className="text-sm">
                <p className="font-semibold text-white">
                  {freq.percentualMes === null
                    ? "Sem chamadas neste mês ainda"
                    : freq.percentualMes >= 85
                      ? "Frequência excelente!"
                      : freq.percentualMes >= 60
                        ? "Boa frequência!"
                        : "Bora aumentar a presença!"}
                </p>
                <p className="mt-1 text-slate-400">
                  Cada presença confirmada vale{" "}
                  <span className="font-semibold text-nexus-highlight">+5 pts</span> no ranking.
                </p>
              </div>
            </div>
            {freq.sequencia >= 2 && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-orange-500/20 bg-orange-500/10 p-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {freq.sequencia} treinos seguidos sem faltar!
                  </p>
                  <p className="text-xs text-orange-300">
                    {freq.sequencia >= 5 ? "Badge Atleta Consistente desbloqueado" : "Continue a sequência"}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Financeiro */}
          <section className={`${card} p-5`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold text-white">
                <IconWallet className="h-5 w-5 text-nexus-primary" /> Financeiro
              </h2>
              {mensalidades && mensalidades.length > 0 && (
                <span
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    emDia ? "bg-status-verde/10 text-status-verde" : "bg-status-vermelho/10 text-status-vermelho"
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {emDia ? "Regular" : "Em atraso"}
                </span>
              )}
            </div>
            {mensalidades && mensalidades.length > 0 ? (
              <div className="space-y-3">
                {mensalidadeDoMes && (
                  <div className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                    <div>
                      <p className="text-xs text-slate-400">
                        Mensalidade {formatarMesCurto(mensalidadeDoMes.mesReferencia)}
                      </p>
                      <div className="mt-1">
                        <StatusBadge status={mensalidadeDoMes.status} />
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      Vencimento
                      <p className="text-sm font-semibold text-white">
                        {formatarData(mensalidadeDoMes.vencimento)}
                      </p>
                    </div>
                  </div>
                )}
                {proximaFatura && proximaFatura.id !== mensalidadeDoMes?.id && (
                  <div className="flex items-center justify-between px-1">
                    <div>
                      <p className="text-xs text-slate-400">
                        Próxima fatura: {formatarMesCurto(proximaFatura.mesReferencia)}
                      </p>
                      <p className="font-display text-xl font-bold text-white">
                        {proximaFatura.valor.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                    <StatusBadge status={proximaFatura.status} />
                  </div>
                )}
                {!mensalidadeDoMes && !proximaFatura && (
                  <p className="text-sm text-slate-400">Tudo pago. Nenhuma fatura em aberto. ✅</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Nenhuma mensalidade registrada.</p>
            )}
          </section>

          {/* Atalhos */}
          <section>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Atalhos e informações
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/aluno/relatorios"
                className={`${card} p-4 transition hover:border-nexus-primary/40`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-nexus-primary/15 text-nexus-primary">
                    <IconClipboard className="h-5 w-5" />
                  </span>
                  {ultimoRelatorio && (
                    <span className="rounded-full bg-nexus-primary/10 px-2 py-0.5 text-[11px] font-semibold text-nexus-highlight">
                      Nota {mediaGeral(ultimoRelatorio).toFixed(1)}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-white">Relatório técnico</p>
                <p className="text-xs text-slate-400">
                  {ultimoRelatorio
                    ? `Avaliação de ${formatarMesCurto(ultimoRelatorio.mesReferencia)}`
                    : "Avaliação mensal do treinador"}
                </p>
              </Link>
              <Link
                to="/aluno/ranking"
                className={`${card} p-4 transition hover:border-nexus-gold/40`}
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-nexus-gold/15 text-nexus-gold">
                    <IconStar className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                    +5 pts
                  </span>
                </div>
                <p className="text-sm font-semibold text-white">Regras do ranking</p>
                <p className="text-xs text-slate-400">+5 pts por treino com presença</p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
