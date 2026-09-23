import { Link } from "react-router-dom";
import { useRemoverTurma, useTurmas } from "../../hooks/useTurmas";
import { Spinner } from "../../components/Spinner";

export function TurmasListPage() {
  const { data: turmas, isLoading, isError } = useTurmas();
  const removerTurma = useRemoverTurma();

  async function handleRemover(id: string, nome: string) {
    if (!confirm(`Remover a turma "${nome}"? Treinos vinculados também serão removidos.`)) {
      return;
    }
    await removerTurma.mutateAsync(id);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
          Turmas
        </h1>
        <Link
          to="/admin/turmas/nova"
          className="rounded-lg bg-nexus-primary px-4 py-2 text-sm font-semibold text-nexus-bg shadow-nexus-glow transition hover:bg-nexus-highlight"
        >
          + Nova turma
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Spinner /> Carregando turmas...
        </div>
      )}
      {isError && <p className="text-sm text-red-400">Erro ao carregar turmas.</p>}
      {turmas && turmas.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 bg-nexus-surface/50 p-8 text-center text-sm text-slate-400">
          Nenhuma turma cadastrada.
        </div>
      )}

      {turmas && turmas.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {turmas.map((turma) => (
            <div
              key={turma.id}
              className="rounded-xl border border-white/10 bg-nexus-surface p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-white">{turma.nome}</p>
                  <p className="text-sm text-slate-400">{turma.horarios}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/admin/turmas/${turma.id}/editar`}
                    className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleRemover(turma.id, turma.nome)}
                    className="rounded-lg border border-status-vermelho/30 px-3 py-1 text-xs text-status-vermelho transition hover:bg-status-vermelho/10"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
