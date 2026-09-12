import { Link } from "react-router-dom";
import { useAlunos } from "../../hooks/useAlunos";
import { useMensalidadesPendentes } from "../../hooks/useMensalidades";

export function AdminDashboardPage() {
  const { data: alunos } = useAlunos();
  const { data: pendentes } = useMensalidadesPendentes();
  const ativos = alunos?.filter((a) => a.status === "ativo").length ?? 0;
  const total = alunos?.length ?? 0;

  return (
    <div>
      <h1 className="mb-6 text-lg font-semibold text-slate-900">Painel do administrador</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Alunos ativos</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{ativos}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Total de alunos</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Pagamentos pendentes</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{pendentes ?? "—"}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-4">
        <Link to="/admin/alunos" className="text-sm font-medium text-slate-900 hover:underline">
          Ver todos os alunos →
        </Link>
        <Link to="/admin/turmas" className="text-sm font-medium text-slate-900 hover:underline">
          Gerenciar turmas →
        </Link>
        <Link to="/admin/treinos" className="text-sm font-medium text-slate-900 hover:underline">
          Gerenciar treinos →
        </Link>
      </div>
    </div>
  );
}
