import { useState } from "react";
import { Link } from "react-router-dom";
import { useAlterarStatusAluno, useAlunos, useRemoverAluno } from "../../hooks/useAlunos";
import { StatusBadge } from "../../components/StatusBadge";
import { Spinner } from "../../components/Spinner";
import { StatusAluno } from "../../types";

export function AlunosListPage() {
  const [filtro, setFiltro] = useState<StatusAluno | undefined>(undefined);
  const { data: alunos, isLoading, isError } = useAlunos(filtro);
  const alterarStatus = useAlterarStatusAluno();
  const removerAluno = useRemoverAluno();

  async function handleToggleStatus(id: string, statusAtual: StatusAluno) {
    const novoStatus: StatusAluno = statusAtual === "ativo" ? "inativo" : "ativo";
    await alterarStatus.mutateAsync({ id, status: novoStatus });
  }

  async function handleRemover(id: string, nome: string) {
    if (!confirm(`Remover o aluno "${nome}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    await removerAluno.mutateAsync(id);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
          Alunos
        </h1>
        <div className="flex items-center gap-2">
          <select
            value={filtro ?? ""}
            onChange={(e) =>
              setFiltro(e.target.value === "" ? undefined : (e.target.value as StatusAluno))
            }
            className="rounded-lg border border-white/10 bg-nexus-surface px-3 py-2 text-sm text-white outline-none transition focus:border-nexus-primary focus:ring-2 focus:ring-nexus-primary/40"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
          <Link
            to="/admin/alunos/novo"
            className="rounded-lg bg-nexus-primary px-4 py-2 text-sm font-semibold text-nexus-bg shadow-nexus-glow transition hover:bg-nexus-highlight"
          >
            + Novo aluno
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Spinner /> Carregando alunos...
        </div>
      )}
      {isError && <p className="text-sm text-red-400">Erro ao carregar alunos.</p>}

      {alunos && alunos.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 bg-nexus-surface/50 p-8 text-center text-sm text-slate-400">
          Nenhum aluno cadastrado.
        </div>
      )}

      {alunos && alunos.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-nexus-surface">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-white/5 text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Turma</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => (
                <tr key={aluno.id} className="border-t border-white/5">
                  <td className="px-4 py-3">
                    <Link
                      to={`/admin/alunos/${aluno.id}`}
                      className="font-medium text-white hover:text-nexus-highlight hover:underline"
                    >
                      {aluno.usuario.nome}
                    </Link>
                    <div className="text-xs text-slate-500">{aluno.usuario.email}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{aluno.turma?.nome ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={aluno.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/alunos/${aluno.id}?relatorio=1`}
                        className="rounded-lg border border-nexus-primary/40 bg-nexus-primary/10 px-3 py-1 text-xs font-medium text-nexus-primary transition hover:bg-nexus-primary/20"
                      >
                        Relatório
                      </Link>
                      <Link
                        to={`/admin/alunos/${aluno.id}/editar`}
                        className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(aluno.id, aluno.status)}
                        className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
                      >
                        {aluno.status === "ativo" ? "Desativar" : "Ativar"}
                      </button>
                      <button
                        onClick={() => handleRemover(aluno.id, aluno.usuario.nome)}
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
