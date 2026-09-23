import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import * as alunoService from "../../services/aluno.service";
import { StatusBadge } from "../../components/StatusBadge";
import { Spinner } from "../../components/Spinner";
import { ProgressRing } from "../../components/ProgressRing";
import { SkillBar } from "../../components/SkillBar";
import { useMinhaFrequencia } from "../../hooks/useFrequencia";
import { useMeusRelatorios } from "../../hooks/useRelatorios";
import { CATEGORIAS_HABILIDADES } from "../../constants/relatorioSkills";
import { Relatorio } from "../../types";

function formatarMesReferencia(mesReferencia: string) {
  const [ano, mes] = mesReferencia.split("-");
  const data = new Date(Number(ano), Number(mes) - 1, 1);
  const texto = data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function DetalheRelatorio({ relatorio }: { relatorio: Relatorio }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ProgressRing
          label="Técnico"
          value={relatorio.medias.tecnico}
          max={5}
          size={76}
          sublabel={relatorio.medias.tecnico.toFixed(1)}
        />
        <ProgressRing
          label="Físico"
          value={relatorio.medias.fisico}
          max={5}
          size={76}
          sublabel={relatorio.medias.fisico.toFixed(1)}
        />
        <ProgressRing
          label="Tático"
          value={relatorio.medias.tatico}
          max={5}
          size={76}
          sublabel={relatorio.medias.tatico.toFixed(1)}
        />
        <ProgressRing
          label="Mental"
          value={relatorio.medias.mental}
          max={5}
          size={76}
          sublabel={relatorio.medias.mental.toFixed(1)}
        />
      </div>

      {CATEGORIAS_HABILIDADES.map((categoria) => (
        <div key={categoria.key}>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-nexus-highlight">
            {categoria.titulo}
          </h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {categoria.skills.map((skill) => (
              <SkillBar
                key={skill.key}
                label={skill.label}
                value={
                  (relatorio.habilidades[categoria.key] as unknown as Record<string, number>)[
                    skill.key
                  ]
                }
              />
            ))}
          </div>
        </div>
      ))}

      <div className="space-y-3">
        <div className="rounded-lg border-l-2 border-status-verde bg-white/5 p-3 text-sm">
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-status-verde">
            Pontos fortes
          </p>
          <p className="text-slate-300">{relatorio.pontosFortes}</p>
        </div>
        <div className="rounded-lg border-l-2 border-status-amarelo bg-white/5 p-3 text-sm">
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-status-amarelo">
            A melhorar
          </p>
          <p className="text-slate-300">{relatorio.pontosMelhorar}</p>
        </div>
        <div className="rounded-lg border-l-2 border-nexus-primary bg-white/5 p-3 text-sm">
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-wide text-nexus-primary">
            Objetivo do mês
          </p>
          <p className="text-slate-300">{relatorio.objetivoProximoMes}</p>
        </div>
      </div>
    </div>
  );
}

function SecaoDesempenho() {
  const { data: relatorios, isLoading } = useMeusRelatorios();
  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="mt-4 rounded-xl border border-white/10 bg-nexus-surface p-6">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Spinner /> Carregando desempenho...
        </div>
      </div>
    );
  }

  if (!relatorios || relatorios.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-nexus-surface p-6 text-center text-sm text-slate-400">
        Seu relatório de desempenho ainda não foi enviado pelo técnico.
      </div>
    );
  }

  const [ultimo, ...anteriores] = relatorios;

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-xl border border-white/10 bg-nexus-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Meu desempenho — {formatarMesReferencia(ultimo.mesReferencia)}
          </h2>
          <span className="rounded-full border border-nexus-primary/30 bg-nexus-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-nexus-primary">
            Geral {ultimo.medias.geral.toFixed(1)}
          </span>
        </div>
        <DetalheRelatorio relatorio={ultimo} />
      </div>

      {anteriores.length > 0 && (
        <div className="rounded-xl border border-white/10 bg-nexus-surface p-6">
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Relatórios anteriores
          </h3>
          <div className="space-y-2">
            {anteriores.map((relatorio) => {
              const expandido = expandidoId === relatorio.id;
              return (
                <div key={relatorio.id} className="border-t border-white/5 pt-2 first:border-0 first:pt-0">
                  <button
                    onClick={() => setExpandidoId(expandido ? null : relatorio.id)}
                    className="flex w-full items-center justify-between gap-3 py-1 text-left"
                  >
                    <span className="text-sm font-medium text-white">
                      {formatarMesReferencia(relatorio.mesReferencia)}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-slate-300">
                        Geral {relatorio.medias.geral.toFixed(1)}
                      </span>
                      <svg
                        viewBox="0 0 20 20"
                        className={`h-4 w-4 fill-none stroke-slate-400 transition-transform ${expandido ? "rotate-180" : ""}`}
                      >
                        <path d="M5.5 7.5l4.5 4.5 4.5-4.5" strokeWidth="1.5" />
                      </svg>
                    </span>
                  </button>
                  {expandido && (
                    <div className="mt-3 pb-2">
                      <DetalheRelatorio relatorio={relatorio} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function AlunoHomePage() {
  const { data: aluno, isLoading, isError } = useQuery({
    queryKey: ["alunos", "me"],
    queryFn: alunoService.meuPerfil,
  });
  const { data: frequencia } = useMinhaFrequencia();

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

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 font-display text-2xl font-bold uppercase tracking-wide text-white">
        Olá, {aluno.usuario.nome.split(" ")[0]}!
      </h1>
      <p className="mb-6 text-sm text-slate-400">
        Este é o seu espaço para acompanhar sua evolução no CT.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-nexus-surface p-6">
          <div>
            <p className="text-sm text-slate-400">Status</p>
            <div className="mt-2">
              <StatusBadge status={aluno.status} />
            </div>
            <p className="mt-3 text-sm text-slate-400">Turma</p>
            <p className="text-white">{aluno.turma?.nome ?? "—"}</p>
          </div>
        </div>

        {frequencia && (
          <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-nexus-surface p-6">
            <ProgressRing
              label="Frequência"
              value={frequencia.percentual}
              size={84}
              sublabel={`${frequencia.percentual}%`}
            />
            <p className="text-xs text-slate-400">
              {frequencia.presencas} presenças de {frequencia.totalRegistros} treinos registrados
            </p>
          </div>
        )}
      </div>

      <SecaoDesempenho />

      <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-nexus-surface p-6 text-center text-sm text-slate-400">
        Ranking e pontuação chegam nas próximas fases.
      </div>
    </div>
  );
}
