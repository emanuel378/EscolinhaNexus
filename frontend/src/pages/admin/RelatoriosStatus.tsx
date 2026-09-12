import { useState } from "react";
import { Link } from "react-router-dom";
import { useStatusRelatoriosDoMes } from "../../hooks/useRelatorios";

function mesAtual() {
  const agora = new Date();
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, "0")}`;
}

export function RelatoriosStatusPage() {
  const [mesReferencia, setMesReferencia] = useState(mesAtual());
  const { data, isLoading } = useStatusRelatoriosDoMes(mesReferencia);

  const lancados = data?.alunos.filter((a) => a.relatorioId !== null).length ?? 0;
  const total = data?.alunos.length ?? 0;

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Relatórios mensais</h1>
        <input
          type="month"
          value={mesReferencia}
          onChange={(e) => setMesReferencia(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm"
        />
      </div>

      {data && (
        <p className="mb-4 text-sm text-slate-500">
          <span className="font-semibold text-slate-900">
            {lancados} de {total}
          </span>{" "}
          alunos com relatório lançado neste mês.
        </p>
      )}

      {isLoading && <p className="text-sm text-slate-500">Carregando...</p>}
      {data && data.alunos.length === 0 && (
        <p className="text-sm text-slate-500">Nenhum aluno ativo encontrado.</p>
      )}

      {data && data.alunos.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {data.alunos.map((aluno) => (
            <div
              key={aluno.alunoId}
              className="flex items-center justify-between border-b border-slate-100 px-4 py-3 text-sm last:border-0"
            >
              <div>
                <p className="font-medium text-slate-900">{aluno.nome}</p>
                <p className="text-xs text-slate-500">{aluno.turma ?? "—"}</p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={
                    aluno.relatorioId
                      ? "text-status-verde"
                      : "text-status-amarelo"
                  }
                >
                  {aluno.relatorioId ? "✅ Lançado" : "⏳ Pendente"}
                </span>
                <Link
                  to={`/admin/alunos/${aluno.alunoId}`}
                  className="rounded-lg border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
                >
                  Ver perfil
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
