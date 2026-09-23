import { useState } from "react";
import { Link } from "react-router-dom";
import { useRemoverTreino, useTreinos } from "../../hooks/useTreinos";
import { useTurmas } from "../../hooks/useTurmas";
import { Spinner } from "../../components/Spinner";

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
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
          Treinos
        </h1>
        <div className="flex items-center gap-2">
          <select
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
            className="rounded-lg border border-white/10 bg-nexus-surface px-3 py-2 text-sm text-white outline-none transition focus:border-nexus-primary focus:ring-2 focus:ring-nexus-primary/40"
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
            className="rounded-lg bg-nexus-primary px-4 py-2 text-sm font-semibold text-nexus-bg shadow-nexus-glow transition hover:bg-nexus-highlight"
          >
            + Novo treino
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Spinner /> Carregando treinos...
        </div>
      )}
      {isError && <p className="text-sm text-red-400">Erro ao carregar treinos.</p>}
      {treinos && treinos.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 bg-nexus-surface/50 p-8 text-center text-sm text-slate-400">
          Nenhum treino cadastrado.
        </div>
      )}

      {treinos && treinos.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-nexus-surface">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
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
                <tr key={treino.id} className="border-t border-white/5">
                  <td className="px-4 py-3 text-white">
                    {new Date(treino.data).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{treino.turma?.nome ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-400">
                    {treino.horaInicio}–{treino.horaFim}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{treino.local}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/treinos/${treino.id}/chamada`}
                        className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
                      >
                        Chamada
                      </Link>
                      <Link
                        to={`/admin/treinos/${treino.id}/editar`}
                        className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleRemover(treino.id)}
                        className="rounded-lg border border-status-vermelho/30 px-3 py-1 text-xs text-status-vermelho transition hover:bg-status-vermelho/10"
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
