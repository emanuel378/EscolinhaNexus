import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as alunoService from "../../services/aluno.service";
import { useMeuRanking } from "../../hooks/useRanking";
import { Avatar } from "../../components/Avatar";
import { Spinner } from "../../components/Spinner";
import {
  IconArrowRight,
  IconBolt,
  IconCalendar,
  IconClock,
  IconCrown,
  IconFlame,
  IconMedal,
  IconStar,
  IconTrophy,
  IconUsers,
} from "../../components/Icons";
import { RankingItem } from "../../types";
import { formatarMesCurto, mesAtual, ultimosMeses } from "../../utils/data";

const MESES = ultimosMeses(6);

const PODIO = {
  1: {
    anel: "ring-nexus-gold",
    selo: "bg-nexus-gold text-nexus-bg",
    pedestal: "h-28 bg-gradient-to-b from-nexus-gold/25 to-nexus-gold/5 text-nexus-gold",
    rotulo: "Campeão",
    Icone: IconTrophy,
  },
  2: {
    anel: "ring-slate-300",
    selo: "bg-slate-300 text-nexus-bg",
    pedestal: "h-20 bg-gradient-to-b from-slate-300/20 to-slate-300/5 text-slate-300",
    rotulo: "Prata",
    Icone: IconMedal,
  },
  3: {
    anel: "ring-amber-700",
    selo: "bg-amber-700 text-white",
    pedestal: "h-14 bg-gradient-to-b from-amber-700/25 to-amber-700/5 text-amber-600",
    rotulo: "Bronze",
    Icone: IconMedal,
  },
} as const;

function DegrauPodio({ item, souEu }: { item: RankingItem; souEu: boolean }) {
  const estilo = PODIO[item.posicao as 1 | 2 | 3];
  const primeiro = item.posicao === 1;

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center">
      <div className="mb-1 h-6">
        {primeiro ? (
          <IconCrown className="h-6 w-6 text-nexus-gold drop-shadow-[0_0_8px_rgba(255,210,0,0.6)]" />
        ) : souEu ? (
          <span className="rounded-full bg-nexus-primary px-2 py-0.5 text-[10px] font-bold uppercase text-nexus-bg">
            Você
          </span>
        ) : null}
      </div>
      <div className={`relative rounded-full ring-4 ${estilo.anel} ring-offset-2 ring-offset-nexus-surface`}>
        <Avatar nome={item.nome} fotoUrl={item.fotoUrl} tamanho={primeiro ? "xl" : "lg"} />
        <span
          className={`absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${estilo.selo}`}
        >
          {item.posicao}º
        </span>
      </div>
      <p className="mt-3 w-full truncate text-center text-sm font-semibold text-white">
        {item.nome.split(" ").slice(0, 2).join(" ")}
      </p>
      <p className="flex items-center gap-1 font-display text-2xl font-bold text-white">
        <IconStar className="h-4 w-4 text-nexus-gold" />
        {item.pontos}
      </p>
      <p className="text-[11px] uppercase tracking-wider text-slate-500">pontos</p>
      <div
        className={`mt-3 flex w-full flex-col items-center justify-center gap-1 rounded-t-xl ${estilo.pedestal}`}
      >
        <estilo.Icone className="h-5 w-5" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{estilo.rotulo}</span>
      </div>
    </div>
  );
}

export function AlunoRankingPage() {
  const [mes, setMes] = useState(mesAtual());
  const { data: aluno } = useQuery({ queryKey: ["alunos", "me"], queryFn: alunoService.meuPerfil });
  const { data, isLoading, isFetching } = useMeuRanking({ mesReferencia: mes });

  const lista = data?.ranking ?? [];
  const indice = aluno ? lista.findIndex((r) => r.alunoId === aluno.id) : -1;
  const eu = indice >= 0 ? lista[indice] : null;
  const daFrente = indice > 0 ? lista[indice - 1] : null;
  const top3 = lista.slice(0, 3).filter((r) => r.pontos > 0);
  // Ordem visual do pódio: 2º, 1º, 3º.
  const podio = [top3[1], top3[0], top3[2]].filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Filtros */}
      <section className="grid grid-cols-2 gap-3">
        <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-nexus-surface px-4 py-3">
          <IconCalendar className="h-5 w-5 shrink-0 text-nexus-primary" />
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Período
            </span>
            <select
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="w-full cursor-pointer bg-transparent font-display text-lg font-bold text-white outline-none"
            >
              {MESES.map((m) => (
                <option key={m} value={m} className="bg-nexus-surface">
                  {formatarMesCurto(m)}
                </option>
              ))}
            </select>
          </span>
        </label>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-nexus-surface px-4 py-3">
          <IconUsers className="h-5 w-5 shrink-0 text-nexus-primary" />
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Turma
            </span>
            <span className="block truncate font-display text-lg font-bold text-white">
              {aluno?.turma?.nome ?? "—"}
            </span>
          </span>
        </div>
      </section>

      {aluno?.turma && (
        <p className="flex items-center gap-2 px-1 text-sm text-slate-400">
          <IconClock className="h-4 w-4" /> {aluno.turma.horarios}
        </p>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-nexus-primary/20 bg-nexus-primary/10 p-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-nexus-primary text-nexus-bg">
          <IconBolt className="h-4 w-4" />
        </span>
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-nexus-highlight">Dica da semana:</span> presença
          confirmada no treino garante{" "}
          <span className="font-semibold text-white">+5 pts automáticos</span> no ranking mensal.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Spinner /> Carregando...
        </div>
      ) : (
        <div className={`space-y-5 transition-opacity ${isFetching ? "opacity-60" : ""}`}>
          {/* Pódio */}
          <section className="rounded-2xl border border-white/10 bg-nexus-surface px-4 pt-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-xl font-bold text-white">
                <IconTrophy className="h-5 w-5 text-nexus-gold" /> Pódio da turma
              </h2>
              {mes === mesAtual() && (
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Atualizado hoje
                </span>
              )}
            </div>
            {podio.length > 0 ? (
              <div className="flex items-end gap-2 sm:gap-6">
                {podio.map((item) => (
                  <DegrauPodio key={item.alunoId} item={item} souEu={item.alunoId === aluno?.id} />
                ))}
              </div>
            ) : (
              <p className="pb-6 text-center text-sm text-slate-400">
                Ninguém pontuou neste mês ainda.
              </p>
            )}
          </section>

          {/* Classificação completa */}
          <section>
            <div className="mb-3 flex items-baseline justify-between px-1">
              <h2 className="font-display text-xl font-bold text-white">Classificação completa</h2>
              <span className="text-xs text-slate-500">{lista.length} atletas</span>
            </div>
            {lista.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 bg-nexus-surface/50 p-8 text-center text-sm text-slate-400">
                Sem atletas nesta turma.
              </div>
            ) : (
              <ul className="space-y-2">
                {lista.map((item) => {
                  const souEu = item.alunoId === aluno?.id;
                  const lider = item.posicao === 1 && item.pontos > 0;
                  return (
                    <li
                      key={item.alunoId}
                      className={`relative flex items-center gap-3 overflow-hidden rounded-2xl border p-3 sm:p-4 ${
                        souEu
                          ? "border-nexus-primary/40 bg-nexus-primary/10 shadow-nexus-glow"
                          : "border-white/10 bg-nexus-surface"
                      }`}
                    >
                      {souEu && <span className="absolute inset-y-0 left-0 w-1 bg-nexus-primary" />}
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          souEu
                            ? "bg-nexus-primary text-nexus-bg"
                            : lider
                              ? "bg-nexus-gold/20 text-nexus-gold"
                              : item.posicao <= 3
                                ? "bg-white/10 text-white"
                                : "text-slate-500"
                        }`}
                      >
                        {item.posicao}
                      </span>
                      <Avatar nome={item.nome} fotoUrl={item.fotoUrl} tamanho="md" />
                      <div className="min-w-0 flex-1">
                        <p className="flex items-center gap-2">
                          <span
                            className={`truncate font-semibold ${souEu ? "text-nexus-highlight" : "text-white"}`}
                          >
                            {item.nome}
                          </span>
                          {lider && (
                            <span className="shrink-0 rounded bg-nexus-gold/15 px-1.5 py-0.5 text-[10px] font-bold uppercase text-nexus-gold">
                              Líder
                            </span>
                          )}
                          {souEu && (
                            <span className="shrink-0 rounded bg-nexus-primary px-1.5 py-0.5 text-[10px] font-bold uppercase text-nexus-bg">
                              Você
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400">
                          {item.presencas} {item.presencas === 1 ? "treino" : "treinos"}
                          {item.frequenciaPercentual !== null && (
                            <> • {item.frequenciaPercentual}% freq.</>
                          )}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="flex items-center justify-end gap-1 font-display text-xl font-bold text-white">
                          {souEu ? (
                            <IconFlame className="h-4 w-4 text-nexus-primary" />
                          ) : (
                            <IconStar className="h-4 w-4 text-nexus-gold" />
                          )}
                          {item.pontos}
                        </p>
                        {mes === mesAtual() && (
                          <p
                            className={`text-[11px] ${
                              item.pontosSemana > 0 ? "text-status-verde" : "text-slate-500"
                            }`}
                          >
                            +{item.pontosSemana} pts semana
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* Objetivo fixo acima da barra inferior */}
      {eu && mes === mesAtual() && (
        <div className="sticky bottom-20 z-20">
          <div className="flex items-center gap-3 rounded-2xl border border-nexus-primary/30 bg-nexus-bg/95 p-3 shadow-2xl backdrop-blur">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-nexus-gold text-nexus-bg">
              <IconFlame className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-nexus-gold">
                Objetivo de ouro
              </p>
              <p className="truncate text-sm font-semibold text-white">
                {daFrente
                  ? `Faltam +${daFrente.pontos - eu.pontos} pts para assumir o ${daFrente.posicao}º lugar`
                  : "Você está no topo! Defenda a liderança."}
              </p>
            </div>
            <Link
              to="/aluno/calendario"
              className="flex shrink-0 items-center gap-1 rounded-xl bg-nexus-primary px-3 py-2 text-sm font-bold text-nexus-bg transition hover:brightness-110"
            >
              Treinar <IconArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
