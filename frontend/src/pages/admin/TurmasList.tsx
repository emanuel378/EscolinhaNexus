import { Link } from "react-router-dom";
import { useRemoverTurma, useTurmas } from "../../hooks/useTurmas";

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
        <h1 className="text-lg font-semibold text-slate-900">Turmas</h1>
        <Link
          to="/admin/turmas/nova"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Nova turma
        </Link>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Carregando turmas...</p>}
      {isError && <p className="text-sm text-status-vermelho">Erro ao carregar turmas.</p>}
      {turmas && turmas.length === 0 && (
        <p className="text-sm text-slate-500">Nenhuma turma cadastrada.</p>
      )}

      {turmas && turmas.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {turmas.map((turma) => (
            <div
              key={turma.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-900">{turma.nome}</p>
                  <p className="text-sm text-slate-500">{turma.horarios}</p>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/admin/turmas/${turma.id}/editar`}
                    className="rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleRemover(turma.id, turma.nome)}
                    className="rounded-lg border border-red-200 px-3 py-1 text-xs text-status-vermelho hover:bg-red-50"
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
