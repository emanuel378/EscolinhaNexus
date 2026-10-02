import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTreinos } from "../../hooks/useTreinos";
import { Icon } from "../../components/Icon";
import { CabecalhoPagina, Esqueleto, EstadoVazio, MensagemErro } from "../../components/AdminUI";
import { TreinoCard, hojeISO, situacaoDoTreino } from "../../components/TreinoCard";
import { Treino } from "../../types";

function somarDias(dataISO: string, dias: number) {
  const d = new Date(dataISO + "T00:00:00");
  d.setDate(d.getDate() + dias);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Grupo({ titulo, icone, cor, treinos }: { titulo: string; icone: string; cor: string; treinos: Treino[] }) {
  if (treinos.length === 0) return null;
  return (
    <section className="mb-6">
      <h2 className={`label-up mb-3 flex items-center gap-1.5 ${cor}`}>
        <Icon name={icone} className="text-[18px]" />
        {titulo} ({treinos.length})
      </h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3 lg:gap-4">
        {treinos.map((t) => (
          <TreinoCard key={t.id} treino={t} />
        ))}
      </div>
    </section>
  );
}

// Atalho "Chamada" da navegação: junta os treinos que precisam de chamada
// (pendentes, de qualquer mês) e os de hoje/próximos dias.
export function ChamadaSelecaoPage() {
  const { data: treinos, isLoading, isError } = useTreinos();

  const grupos = useMemo(() => {
    const hoje = hojeISO();
    const daquiUmaSemana = somarDias(hoje, 7);
    const duasSemanasAtras = somarDias(hoje, -14);
    const ordenados = [...(treinos ?? [])].sort((a, b) =>
      (a.data + a.horaInicio).localeCompare(b.data + b.horaInicio)
    );
    const dia = (t: Treino) => t.data.substring(0, 10);
    return {
      pendentes: ordenados.filter((t) => situacaoDoTreino(t) === "pendente"),
      proximos: ordenados.filter(
        (t) => situacaoDoTreino(t) === "agendado" && dia(t) <= daquiUmaSemana
      ),
      realizadas: ordenados
        .filter((t) => situacaoDoTreino(t) === "realizada" && dia(t) >= duasSemanasAtras)
        .reverse(),
    };
  }, [treinos]);

  const vazio =
    grupos.pendentes.length + grupos.proximos.length + grupos.realizadas.length === 0;

  return (
    <div>
      <CabecalhoPagina
        rotulo="Registro de presença"
        titulo="Chamada"
        subtitulo="Escolha o treino para marcar presenças. Cada presença vale +5 pontos."
        acao={
          <Link to="/admin/treinos" className="btn-secundario">
            <Icon name="calendar_month" className="text-[20px]" /> Todos os treinos
          </Link>
        }
      />

      {isLoading && <Esqueleto linhas={3} altura="h-44" />}
      {isError && <MensagemErro>Erro ao carregar treinos.</MensagemErro>}
      {treinos && vazio && (
        <EstadoVazio icone="event_available">
          Nenhuma chamada pendente nem treino nos próximos 7 dias.
        </EstadoVazio>
      )}

      {treinos && (
        <>
          <Grupo titulo="Chamadas pendentes" icone="pending_actions" cor="text-nexus-gold" treinos={grupos.pendentes} />
          <Grupo titulo="Próximos 7 dias" icone="event_upcoming" cor="text-nexus-primary" treinos={grupos.proximos} />
          <Grupo titulo="Feitas nas últimas 2 semanas" icone="task_alt" cor="text-slate-400" treinos={grupos.realizadas} />
        </>
      )}
    </div>
  );
}
