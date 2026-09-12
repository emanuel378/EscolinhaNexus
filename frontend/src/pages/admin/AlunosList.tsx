import { useState } from "react";
import { Link } from "react-router-dom";
import { useAlterarStatusAluno, useAlunos, useRemoverAluno } from "../../hooks/useAlunos";
import { StatusBadge } from "../../components/StatusBadge";
import { StatusAluno } from "../../types";
import { iniciais } from "../../utils/nome";

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
        <h1 className="text-lg font-semibold text-slate-900">Alunos</h1>
        <div className="flex items-center gap-2">
          <select
            value={filtro ?? ""}
            onChange={(e) =>
              setFiltro(e.target.value === "" ? undefined : (e.target.value as StatusAluno))
            }
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
          <Link
            to="/admin/alunos/novo"
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            + Novo aluno
          </Link>
        </div>
      </div>

      {isLoading && <p className="text-sm text-slate-500">Carregando alunos...</p>}
      {isError && (
        <p className="text-sm text-status-vermelho">Erro ao carregar alunos.</p>
      )}

      {alunos && alunos.length === 0 && (
        <p className="text-sm text-slate-500">Nenhum aluno cadastrado.</p>
      )}

      {alunos && alunos.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">Turma</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => (
                <tr key={aluno.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {aluno.fotoUrl ? (
                        <img
                          src={aluno.fotoUrl}
                          alt={aluno.usuario.nome}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                          {iniciais(aluno.usuario.nome)}
                        </div>
                      )}
                      <div>
                        <Link
                          to={`/admin/alunos/${aluno.id}`}
                          className="font-medium text-slate-900 hover:underline"
                        >
                          {aluno.usuario.nome}
                        </Link>
                        <div className="text-xs text-slate-500">{aluno.usuario.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {aluno.turma?.nome ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={aluno.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        to={`/admin/alunos/${aluno.id}/editar`}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleToggleStatus(aluno.id, aluno.status)}
                        className="rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
                      >
                        {aluno.status === "ativo" ? "Desativar" : "Ativar"}
                      </button>
                      <button
                        onClick={() => handleRemover(aluno.id, aluno.usuario.nome)}
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
