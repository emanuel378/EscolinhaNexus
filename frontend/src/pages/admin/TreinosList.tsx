import { useState } from "react";
import { Link } from "react-router-dom";
import { useRemoverTreino, useTreinos } from "../../hooks/useTreinos";
import { useTurmas } from "../../hooks/useTurmas";

export function TreinosListPage() {
  const [turmaId, setTurmaId] = useState<string>("");
  const { data: turmas } = useTurmas();
  const { data: treinos, isLoading, isError } = useTreinos(turmaId || undefined);
  const removerTreino = useRemoverTreino();

  async function handleRemover(id: string) {
    if (!confirm("Remover este treino? A frequência marcada nele também será removida.")) {
      return;
    }
    await removerTreino.mutateAsync(id);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-lg font-semibold text-slate-900">Treinos</h1>
        <div className="flex items-center gap-2">
          <select
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Todas as turmas</option>
            {turmas?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
          <Link
            to="/admin/treinos/novo"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            + Novo treino
          </Link>
        </div>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Carregando treinos...</p>}
      {isError && <p className="text-sm text-status-vermelho">Erro ao carregar treinos.</p>}
      {treinos && treinos.length === 0 && (
        <p className="text-sm text-slate-500">Nenhum treino cadastrado.</p>
      )}

      {treinos && treinos.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Turma</th>
                <th className="px-4 py-3 font-medium">Horário</th>
                <th className="px-4 py-3 font-medium">Local</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {treinos.map((treino) => (
                <tr key={treino.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    {new Date(treino.data).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{treino.turma?.nome ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {treino.horaInicio}–{treino.horaFim}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{treino.local}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/treinos/${treino.id}/chamada`}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
                      >
                        Chamada
                      </Link>
                      <Link
                        to={`/admin/treinos/${treino.id}/editar`}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleRemover(treino.id)}
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs text-status-vermelho hover:bg-red-50"
                      >
                        Remover
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
