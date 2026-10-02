import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useRemoverTreino, useTreinos } from "../../hooks/useTreinos";
import { useTurmas } from "../../hooks/useTurmas";
import { Icon } from "../../components/Icon";
import { CabecalhoPagina, Esqueleto, EstadoVazio, MensagemErro } from "../../components/AdminUI";
import { AbasTreinosTurmas, TreinoCard, situacaoDoTreino } from "../../components/TreinoCard";
import { mesAtual } from "../../utils/data";

export function TreinosListPage() {
  const [turmaId, setTurmaId] = useState<string>("");
  const [mes, setMes] = useState(mesAtual);
  const { data: turmas } = useTurmas();
  const { data: treinos, isLoading, isError } = useTreinos(turmaId || undefined);
  const removerTreino = useRemoverTreino();

  const doMes = useMemo(
    () =>
      (treinos ?? [])
        .filter((t) => !mes || t.data.substring(0, 7) === mes)
        .sort((a, b) => (a.data + a.horaInicio).localeCompare(b.data + b.horaInicio)),
    [treinos, mes]
  );
  const pendentes = doMes.filter((t) => situacaoDoTreino(t) === "pendente").length;

  async function handleRemover(id: string) {
    if (!confirm("Remover este treino? A frequência marcada nele também será removida.")) {
      return;
    }
    await removerTreino.mutateAsync(id);
  }

  return (
    <div>
      <CabecalhoPagina
        rotulo="Operação de quadra"
        titulo="Gestão de treinos & turmas"
        acao={
          pendentes > 0 ? (
            <span className="chip-amarelo normal-case tracking-normal">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
              {pendentes} {pendentes === 1 ? "chamada pendente" : "chamadas pendentes"}
            </span>
          ) : undefined
        }
      />

      <AbasTreinosTurmas />

      <div className="mb-5 flex flex-wrap gap-2">
        <label className="relative flex-1 sm:max-w-[13rem]">
          <span className="sr-only">Mês</span>
          <input type="month" value={mes} onChange={(e) => setMes(e.target.value)} className="campo" />
        </label>
        <label className="relative flex-1 sm:max-w-[15rem]">
          <span className="sr-only">Turma</span>
          <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)} className="campo">
            <option value="">Turma: todas</option>
            {turmas?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </label>
        {mes && (
          <button onClick={() => setMes("")} className="btn-secundario px-3 text-xs">
            Ver todos os meses
          </button>
        )}
        <Link to="/admin/treinos/novo" className="btn-primario ml-auto shadow-nexus-glow" aria-label="Novo treino">
          <Icon name="add" className="text-[22px]" />
          <span className="hidden sm:inline">Novo treino</span>
        </Link>
      </div>

      {isLoading && <Esqueleto linhas={3} altura="h-44" />}
      {isError && <MensagemErro>Erro ao carregar treinos.</MensagemErro>}
      {treinos && doMes.length === 0 && (
        <EstadoVazio icone="event_busy">
          {treinos.length === 0 ? "Nenhum treino cadastrado." : "Nenhum treino neste mês."}
        </EstadoVazio>
      )}

      {doMes.length > 0 && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 2xl:grid-cols-3 lg:gap-4">
          {doMes.map((treino) => (
            <TreinoCard key={treino.id} treino={treino} onRemover={handleRemover} />
          ))}
        </div>
      )}
    </div>
  );
}
