import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useFichaDeChamada, useMarcarFrequencias } from "../../hooks/useFrequencia";
import { useTreino } from "../../hooks/useTreinos";
import { StatusFrequencia } from "../../types";
import { Icon } from "../../components/Icon";
import { AvatarAtleta, Esqueleto, EstadoVazio } from "../../components/AdminUI";
import { rotuloDia } from "../../utils/data";

const OPCOES: {
  valor: StatusFrequencia;
  rotulo: string;
  icone: string;
  ativo: string;
}[] = [
  {
    valor: "presente",
    rotulo: "Pres. (+5)",
    icone: "check_circle",
    ativo: "border-status-verde bg-status-verde text-white shadow-[0_0_16px_rgba(22,163,74,0.35)]",
  },
  {
    valor: "falta",
    rotulo: "Falta",
    icone: "cancel",
    ativo: "border-status-vermelho bg-status-vermelho text-white shadow-[0_0_16px_rgba(220,38,38,0.35)]",
  },
  {
    valor: "falta_justificada",
    rotulo: "Justif.",
    icone: "info",
    ativo: "border-status-amarelo bg-status-amarelo text-white shadow-[0_0_16px_rgba(202,138,4,0.35)]",
  },
];

const CHIP_STATUS: Record<StatusFrequencia, { classe: string; rotulo: string }> = {
  presente: { classe: "chip-azul", rotulo: "Confirmado" },
  falta: { classe: "chip-vermelho", rotulo: "Ausente" },
  falta_justificada: { classe: "chip-amarelo", rotulo: "Justificado" },
};

export function ChamadaPage() {
  const { id } = useParams<{ id: string }>();
  const { data: treino } = useTreino(id ?? "");
  const { data: ficha, isLoading } = useFichaDeChamada(id ?? "");
  const marcarFrequencias = useMarcarFrequencias(id ?? "");

  const [statusPorAluno, setStatusPorAluno] = useState<Record<string, StatusFrequencia>>({});
  const [mensagem, setMensagem] = useState<{ tipo: "ok" | "erro"; texto: string } | null>(null);

  useEffect(() => {
    if (ficha) {
      const inicial: Record<string, StatusFrequencia> = {};
      for (const item of ficha) {
        inicial[item.alunoId] = item.status ?? "presente";
      }
      setStatusPorAluno(inicial);
    }
  }, [ficha]);

  const total = ficha?.length ?? 0;
  const presentes = Object.values(statusPorAluno).filter((s) => s === "presente").length;
  const percentualPresentes = total > 0 ? Math.round((presentes / total) * 1000) / 10 : 0;
  const chamadaJaFeita = ficha?.some((item) => item.status !== null) ?? false;

  function marcar(alunoId: string, status: StatusFrequencia) {
    setMensagem(null);
    setStatusPorAluno((prev) => ({ ...prev, [alunoId]: status }));
  }

  function marcarTodosPresentes() {
    setMensagem(null);
    setStatusPorAluno((prev) =>
      Object.fromEntries(Object.keys(prev).map((alunoId) => [alunoId, "presente" as const]))
    );
  }

  async function handleSalvar() {
    setMensagem(null);
    const registros = Object.entries(statusPorAluno).map(([alunoId, status]) => ({
      alunoId,
      status,
    }));

    try {
      await marcarFrequencias.mutateAsync(registros);
      setMensagem({ tipo: "ok", texto: "Chamada salva! Pontos de presença atualizados no ranking." });
    } catch {
      setMensagem({ tipo: "erro", texto: "Não foi possível salvar a chamada. Tente novamente." });
    }
  }

  return (
    <div className="pb-24 lg:pb-28">
      <Link
        to="/admin/chamada"
        className="mb-4 inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-sm font-semibold text-nexus-highlight transition hover:bg-white/10"
      >
        <Icon name="arrow_back" className="text-[18px]" /> Treinos para chamada
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start lg:gap-6">
        {/* Resumo do treino */}
        <div className="space-y-4 lg:sticky lg:top-24 lg:col-span-4">
          <section className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-[#0d2a40] via-nexus-surface to-nexus-surface p-4 lg:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className={chamadaJaFeita ? "chip-verde" : "chip-azul"}>
                <span className={`h-1.5 w-1.5 rounded-full ${chamadaJaFeita ? "bg-green-500" : "bg-nexus-primary"}`} />
                {chamadaJaFeita ? "Chamada registrada" : "Em andamento"}
              </span>
              {treino && (
                <span className="flex items-center gap-1 text-sm text-slate-300">
                  <Icon name="schedule" className="text-[18px] text-nexus-primary" />
                  {treino.horaInicio} - {treino.horaFim}
                </span>
              )}
            </div>
            <h1 className="mt-3 font-chivo text-xl font-extrabold text-white lg:text-2xl">
              {treino?.turma?.nome ?? "Carregando..."}
            </h1>
            {treino && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-300">
                <Icon name="sports_volleyball" className="text-[18px] text-nexus-gold" />
                {rotuloDia(treino.data.substring(0, 10))} • {treino.local}
              </p>
            )}

            <div className="mt-4 rounded-lg border border-white/10 bg-nexus-bg/50 p-3">
              <div className="mb-2 flex items-end justify-between">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-200">
                  <Icon name="groups" className="text-[20px] text-nexus-primary" />
                  Status da lista
                </span>
                <span className="num text-3xl text-nexus-primary">
                  {presentes}
                  <span className="text-base text-slate-400">/{total}</span>
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-nexus-primary via-green-400 to-nexus-gold transition-[width] duration-500"
                  style={{ width: `${percentualPresentes}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">{percentualPresentes}% presentes</p>
            </div>
          </section>

          <section className="flex items-center gap-3 rounded-xl border border-nexus-gold/30 bg-nexus-surface p-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-nexus-gold text-nexus-bg">
              <Icon name="stars" filled className="text-[26px]" />
            </span>
            <p className="text-sm text-slate-300">
              <span className="block font-semibold text-nexus-gold">Bônus de frequência</span>
              Cada presença confirmada soma <span className="font-semibold text-nexus-highlight">+5 pontos</span> no
              ranking do mês do treino.
            </p>
          </section>

          {total > 0 && (
            <button onClick={marcarTodosPresentes} className="btn-secundario w-full font-chivo uppercase tracking-wide text-nexus-highlight">
              <Icon name="done_all" className="text-[22px]" />
              Marcar todos como presentes
            </button>
          )}
        </div>

        {/* Lista de alunos */}
        <div className="lg:col-span-8">
          {isLoading && <Esqueleto linhas={4} altura="h-32" />}
          {ficha && ficha.length === 0 && (
            <EstadoVazio icone="group_off">Nenhum aluno ativo nesta turma.</EstadoVazio>
          )}

          {ficha && ficha.length > 0 && (
            <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {ficha.map((item) => {
                const status = statusPorAluno[item.alunoId];
                const chip = status ? CHIP_STATUS[status] : null;
                return (
                  <div key={item.alunoId} className="card p-3">
                    <div className="mb-3 flex items-center gap-3">
                      <AvatarAtleta nome={item.nome} fotoUrl={item.fotoUrl} />
                      <p className="min-w-0 flex-1 truncate font-chivo text-base font-bold text-white">{item.nome}</p>
                      {chip && <span className={chip.classe}>{chip.rotulo}</span>}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {OPCOES.map((opcao) => {
                        const ativo = status === opcao.valor;
                        return (
                          <button
                            key={opcao.valor}
                            type="button"
                            onClick={() => marcar(item.alunoId, opcao.valor)}
                            aria-pressed={ativo}
                            className={`flex min-h-[52px] items-center justify-center gap-1.5 rounded-lg border px-1 text-sm font-semibold transition active:scale-[0.98] ${
                              ativo
                                ? opcao.ativo
                                : "border-white/10 bg-nexus-raised/70 text-slate-300 hover:border-white/25 hover:text-white"
                            }`}
                          >
                            <Icon name={opcao.icone} className="text-[20px]" />
                            {opcao.rotulo}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Salvar — fixo acima da barra inferior no celular */}
      {ficha && ficha.length > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(68px+env(safe-area-inset-bottom))] z-20 px-4 pb-3 lg:bottom-0 lg:left-[260px] lg:px-8 lg:pb-6">
          <div className="mx-auto max-w-7xl">
            {mensagem && (
              <div
                className={`mb-2 flex items-center gap-2 rounded-lg border px-3 py-2 text-sm backdrop-blur ${
                  mensagem.tipo === "ok"
                    ? "border-status-verde/50 bg-status-verde/20 text-green-300"
                    : "border-status-vermelho/50 bg-status-vermelho/20 text-red-300"
                }`}
              >
                <Icon name={mensagem.tipo === "ok" ? "check_circle" : "error"} className="text-[20px]" />
                {mensagem.texto}
              </div>
            )}
            <button
              onClick={handleSalvar}
              disabled={marcarFrequencias.isPending}
              className="btn-primario w-full min-h-[56px] text-base shadow-nexus-glow lg:min-h-[52px]"
            >
              <Icon name="verified" className="text-[24px]" />
              {marcarFrequencias.isPending ? "Salvando..." : `Salvar chamada (${total} atletas)`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
