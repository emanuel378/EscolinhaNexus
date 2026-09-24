import { useState } from "react";
import { Link } from "react-router-dom";
import { useStatusRelatoriosDoMes } from "../../hooks/useRelatorios";
import { Avatar } from "../../components/Avatar";
import { Spinner } from "../../components/Spinner";

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
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-white">
          Relatórios mensais
        </h1>
        <input
          type="month"
          value={mesReferencia}
          onChange={(e) => setMesReferencia(e.target.value)}
          className="rounded-lg border border-white/10 bg-nexus-surface px-3 py-1.5 text-sm text-white outline-none transition focus:border-nexus-primary focus:ring-2 focus:ring-nexus-primary/40"
        />
      </div>

      {data && (
        <p className="mb-4 text-sm text-slate-400">
          <span className="font-semibold text-white">
            {lancados} de {total}
          </span>{" "}
          alunos com relatório lançado neste mês.
        </p>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Spinner /> Carregando...
        </div>
      )}
      {data && data.alunos.length === 0 && (
        <div className="rounded-xl border border-dashed border-white/10 bg-nexus-surface/50 p-8 text-center text-sm text-slate-400">
          Nenhum aluno ativo encontrado.
        </div>
      )}

      {data && data.alunos.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-nexus-surface">
          {data.alunos.map((aluno) => (
            <div
              key={aluno.alunoId}
              className="flex items-center justify-between border-b border-white/5 px-4 py-3 text-sm last:border-0"
            >
              <div className="flex items-center gap-3">
                <Avatar nome={aluno.nome} fotoUrl={aluno.fotoUrl} tamanho="sm" />
                <div>
                  <p className="font-medium text-white">{aluno.nome}</p>
                  <p className="text-xs text-slate-500">{aluno.turma ?? "—"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                    aluno.relatorioId
                      ? "border-status-verde/30 bg-status-verde/10 text-status-verde"
                      : "border-status-amarelo/30 bg-status-amarelo/10 text-status-amarelo"
                  }`}
                >
                  {aluno.relatorioId ? "Lançado" : "Pendente"}
                </span>
                <Link
                  to={`/admin/alunos/${aluno.alunoId}${aluno.relatorioId ? "" : "?relatorio=1"}`}
                  className="rounded-lg border border-white/10 px-3 py-1 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
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
