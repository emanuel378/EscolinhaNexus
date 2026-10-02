import { useState } from "react";
import { Link } from "react-router-dom";
import { useTurmas } from "../../hooks/useTurmas";
import { useRanking } from "../../hooks/useRanking";
import { Icon } from "../../components/Icon";
import { AvatarAtleta, Barra, CabecalhoPagina, Esqueleto, EstadoVazio } from "../../components/AdminUI";
import { RankingItem } from "../../types";
import { mesAtual } from "../../utils/data";

function primeiroNome(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return partes.length > 1 ? `${partes[0]} ${partes[partes.length - 1][0]}.` : partes[0];
}

function Podio({ item, lugar }: { item: RankingItem | undefined; lugar: 1 | 2 | 3 }) {
  if (!item) return <div className="flex-1" />;
  const primeiro = lugar === 1;
  const altura = { 1: "h-36 lg:h-44", 2: "h-28 lg:h-36", 3: "h-24 lg:h-32" }[lugar];
  return (
    <Link to={`/admin/alunos/${item.alunoId}`} className="group flex min-w-0 flex-1 flex-col items-center">
      {primeiro && <Icon name="crown" filled className="mb-1 text-[28px] text-nexus-gold" />}
      <AvatarAtleta nome={item.nome} fotoUrl={item.fotoUrl} tamanho={primeiro ? "xl" : "lg"} destaque={primeiro} />
      <p
        className={`mt-2 w-full truncate text-center font-chivo font-extrabold ${
          primeiro ? "text-lg text-nexus-gold" : "text-base text-white"
        }`}
      >
        {primeiroNome(item.nome)}
      </p>
      <p className="label-up mb-2 w-full truncate text-center text-slate-400">{item.turma ?? "—"}</p>
      <div
        className={`flex w-full flex-col items-center justify-center rounded-t-xl border-x border-t ${altura} ${
          primeiro
            ? "border-nexus-gold/50 bg-gradient-to-b from-nexus-gold/25 to-nexus-gold/5 shadow-nexus-gold"
            : "border-white/10 bg-gradient-to-b from-white/10 to-white/[0.02]"
        }`}
      >
        <span
          className={`mb-1 flex h-8 w-8 items-center justify-center rounded-full font-chivo text-base font-extrabold ${
            primeiro ? "bg-nexus-gold text-nexus-bg" : "bg-white/10 text-white"
          }`}
        >
          {lugar}
        </span>
        <span className={`num ${primeiro ? "text-3xl text-nexus-gold lg:text-4xl" : "text-2xl text-white lg:text-3xl"}`}>
          {item.pontos.toLocaleString("pt-BR")}
        </span>
        <span className="label-up text-slate-400">pts</span>
      </div>
    </Link>
  );
}

export function RankingPage() {
  const [mesReferencia, setMesReferencia] = useState(mesAtual());
  const [turmaId, setTurmaId] = useState("");
  const { data: turmas } = useTurmas();
  const { data, isLoading } = useRanking({ mesReferencia, turmaId: turmaId || undefined });

  const ranking = data?.ranking ?? [];
  const comPontos = ranking.some((r) => r.pontos > 0);
  const [p1, p2, p3] = ranking;
  const demais = ranking.slice(3);

  return (
    <div>
      <CabecalhoPagina
        rotulo="Temporada oficial"
        titulo="Ranking de atletas"
        acao={
          mesReferencia === mesAtual() ? (
            <span className="chip-amarelo">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-500" /> Ao vivo
            </span>
          ) : undefined
        }
      />

      <div className="mb-5 grid grid-cols-2 gap-2 sm:flex">
        <input
          type="month"
          value={mesReferencia}
          onChange={(e) => setMesReferencia(e.target.value || mesAtual())}
          className="campo sm:w-52"
          aria-label="Mês"
        />
        <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)} className="campo sm:w-60" aria-label="Turma">
          <option value="">Todas as turmas</option>
          {turmas?.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </div>

      {isLoading && <Esqueleto linhas={2} altura="h-48" />}
      {data && ranking.length === 0 && <EstadoVazio icone="emoji_events">Nenhum aluno ativo encontrado.</EstadoVazio>}

      {ranking.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:gap-6">
          <div className="space-y-4 lg:col-span-7">
            <section className="relative overflow-hidden rounded-xl border border-white/10 bg-nexus-surface bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:28px_28px] px-3 pt-6 lg:px-8">
              {!comPontos && (
                <p className="mb-4 text-center text-sm text-slate-400">Ninguém pontuou neste mês ainda.</p>
              )}
              <div className="flex items-end gap-2 lg:gap-4">
                <Podio item={p2} lugar={2} />
                <Podio item={p1} lugar={1} />
                <Podio item={p3} lugar={3} />
              </div>
            </section>

            {demais.length > 0 && (
              <section>
                <p className="label-up mb-3 text-slate-300">Demais colocados (4º em diante)</p>
                <div className="space-y-2">
                  {demais.map((item) => (
                    <Link
                      key={item.alunoId}
                      to={`/admin/alunos/${item.alunoId}`}
                      className="card flex items-center gap-3 p-3 transition hover:border-nexus-primary/30"
                    >
                      <span className="num w-9 shrink-0 text-center text-xl text-slate-500">#{item.posicao}</span>
                      <AvatarAtleta nome={item.nome} fotoUrl={item.fotoUrl} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-white">{item.nome}</p>
                        <p className="truncate text-xs text-slate-400">{item.turma ?? "—"}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <Barra
                            valor={item.frequenciaPercentual ?? 0}
                            cor={(item.frequenciaPercentual ?? 0) >= 85 ? "azul" : "dourado"}
                            className="h-1.5 w-20"
                          />
                          <span className="text-[11px] text-nexus-highlight">
                            {item.frequenciaPercentual != null ? `${item.frequenciaPercentual}% freq.` : "sem chamadas"}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="num text-2xl text-white">{item.pontos.toLocaleString("pt-BR")}</p>
                        <p className="text-[11px] text-nexus-highlight">
                          {item.pontosSemana >= 0 ? "+" : ""}
                          {item.pontosSemana} pts semana
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:col-span-5">
            <section className="card p-4 lg:sticky lg:top-24 lg:p-6">
              <h2 className="mb-1 flex items-center gap-2 font-chivo text-lg font-bold text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-nexus-primary/15 text-nexus-primary">
                  <Icon name="verified" className="text-[20px]" />
                </span>
                Critérios de pontuação
              </h2>
              <p className="mb-4 text-sm text-slate-400">
                O ranking soma os pontos de cada atleta dentro do mês escolhido.
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3 rounded-lg bg-nexus-bg/60 p-3">
                  <Icon name="check_circle" className="text-[20px] text-nexus-highlight" />
                  <span className="flex-1 text-sm text-slate-200">Presença no treino (automático)</span>
                  <span className="num text-nexus-highlight">+5 pts</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-nexus-bg/60 p-3">
                  <Icon name="star" className="text-[20px] text-nexus-gold" />
                  <span className="flex-1 text-sm text-slate-200">Bônus do professor</span>
                  <span className="num text-nexus-gold">+ livre</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg bg-nexus-bg/60 p-3">
                  <Icon name="cancel" className="text-[20px] text-red-400" />
                  <span className="flex-1 text-sm text-slate-200">Penalidade do professor</span>
                  <span className="num text-red-400">− livre</span>
                </div>
              </div>
              <p className="mt-3 text-xs text-slate-500">
                Bônus e penalidades são lançados no perfil de cada atleta, escolhendo o mês.
              </p>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
