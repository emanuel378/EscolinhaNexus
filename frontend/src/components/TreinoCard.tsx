import { Link, NavLink } from "react-router-dom";
import { Treino } from "../types";
import { rotuloDia } from "../utils/data";
import { Icon } from "./Icon";

export function hojeISO() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}-${String(
    agora.getDate()
  ).padStart(2, "0")}`;
}

export type SituacaoTreino = "pendente" | "realizada" | "agendado";

/** Pendente = já aconteceu (ou é hoje) e ainda não tem chamada. */
export function situacaoDoTreino(treino: Treino): SituacaoTreino {
  if (treino.frequenciasRegistradas > 0) return "realizada";
  return treino.data.substring(0, 10) <= hojeISO() ? "pendente" : "agendado";
}

/** Abas "Treinos | Turmas" do protótipo, compartilhadas pelas duas telas. */
export function AbasTreinosTurmas() {
  const aba = ({ isActive }: { isActive: boolean }) =>
    `flex h-12 flex-1 items-center justify-center gap-2 rounded-lg font-chivo text-base font-bold transition ${
      isActive ? "bg-nexus-primary text-nexus-bg shadow-nexus-glow" : "text-slate-300 hover:text-white"
    }`;
  return (
    <div className="mb-5 flex gap-1 rounded-xl border border-white/10 bg-nexus-surface p-1 lg:max-w-md">
      <NavLink to="/admin/treinos" className={aba}>
        <Icon name="sports_volleyball" className="text-[22px]" /> Treinos
      </NavLink>
      <NavLink to="/admin/turmas" className={aba}>
        <Icon name="groups" className="text-[22px]" /> Turmas
      </NavLink>
    </div>
  );
}

export function TreinoCard({ treino, onRemover }: { treino: Treino; onRemover?: (id: string) => void }) {
  const situacao = situacaoDoTreino(treino);
  const data = treino.data.substring(0, 10);

  const acento = {
    pendente: "before:bg-nexus-gold",
    realizada: "before:bg-nexus-highlight/70",
    agendado: "before:bg-white/10",
  }[situacao];

  return (
    <div
      className={`card relative overflow-hidden p-4 pl-5 before:absolute before:inset-y-0 before:left-0 before:w-1.5 ${acento}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="rounded-md bg-nexus-bg/70 px-2 py-1 font-chivo text-xs font-bold text-white">
          {rotuloDia(data)} • {treino.horaInicio} - {treino.horaFim}
        </span>
        {situacao === "pendente" && (
          <span className="chip-amarelo normal-case tracking-normal">
            <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" /> Chamada pendente
          </span>
        )}
        {situacao === "realizada" && (
          <span className="chip-azul normal-case tracking-normal">
            <Icon name="check_circle" className="text-[14px]" /> Chamada feita ({treino.frequenciasRegistradas})
          </span>
        )}
        {situacao === "agendado" && (
          <span className="chip-neutro normal-case tracking-normal">
            <Icon name="schedule" className="text-[14px]" /> Agendado
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-nexus-bg text-nexus-gold">
          <Icon name="sports_volleyball" className="text-[28px]" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-chivo text-lg font-extrabold text-white">{treino.turma?.nome ?? "—"}</p>
          <p className="flex flex-wrap items-center gap-x-1.5 text-sm text-slate-400">
            <Icon name="location_on" className="text-[16px]" />
            {treino.local}
            <span>•</span>
            <span className="text-nexus-highlight">{treino.tipo}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        {situacao === "realizada" ? (
          <Link to={`/admin/treinos/${treino.id}/chamada`} className="btn-secundario flex-1 font-chivo uppercase tracking-wide text-nexus-highlight">
            <Icon name="visibility" className="text-[20px]" /> Ver presenças
          </Link>
        ) : (
          <Link
            to={`/admin/treinos/${treino.id}/chamada`}
            className={`flex-1 ${situacao === "pendente" ? "btn-primario shadow-nexus-glow" : "btn-secundario"}`}
          >
            <Icon name="fact_check" className="text-[20px]" /> Fazer chamada
          </Link>
        )}
        <Link to={`/admin/treinos/${treino.id}/editar`} className="btn-icone" aria-label="Editar treino" title="Editar">
          <Icon name="edit" className="text-[20px]" />
        </Link>
        {onRemover && (
          <button
            onClick={() => onRemover(treino.id)}
            className="btn-icone text-red-400 hover:border-status-vermelho/60 hover:text-red-400"
            aria-label="Excluir treino"
            title="Excluir"
          >
            <Icon name="delete" className="text-[20px]" />
          </button>
        )}
      </div>
    </div>
  );
}
