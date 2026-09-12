import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ADMIN = [
  { to: "/admin", label: "Painel", end: true },
  { to: "/admin/alunos", label: "Alunos" },
  { to: "/admin/turmas", label: "Turmas" },
  { to: "/admin/treinos", label: "Treinos" },
  { to: "/admin/ranking", label: "Ranking" },
  { to: "/admin/relatorios", label: "Relatórios" },
];

const NAV_ALUNO = [
  { to: "/aluno", label: "🏠 Início", end: true },
  { to: "/aluno/ranking", label: "🏆 Ranking" },
  { to: "/aluno/evolucao", label: "📊 Evolução" },
  { to: "/aluno/calendario", label: "📅 Calendário" },
  { to: "/aluno/relatorios", label: "📋 Relatórios" },
  { to: "/aluno/perfil", label: "👤 Perfil" },
];

export function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <span className="font-semibold text-slate-900">
            CT Escolinha de Vôlei
          </span>
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <span>{usuario?.nome}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-3 py-1 hover:bg-slate-100"
            >
              Sair
            </button>
          </div>
        </div>
        {usuario && (
          <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2">
            {(usuario.role === "admin" ? NAV_ADMIN : NAV_ALUNO).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
