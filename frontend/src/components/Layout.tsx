import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ADMIN = [
  { to: "/admin", label: "Painel", end: true },
  { to: "/admin/alunos", label: "Alunos" },
  { to: "/admin/turmas", label: "Turmas" },
  { to: "/admin/treinos", label: "Treinos" },
];

export function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-nexus-bg">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-96 bg-[radial-gradient(ellipse_60%_100%_at_50%_-10%,rgba(0,180,255,0.12),transparent)]"
        aria-hidden="true"
      />
      <header className="sticky top-0 z-10 border-b border-white/10 bg-nexus-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <img
              src="/images/nexus-logo.jpg"
              alt="Nexus Vôlei"
              className="h-9 w-9 rounded-lg shadow-nexus-glow"
            />
            <div className="leading-tight">
              <p className="font-display text-sm font-bold uppercase tracking-[0.15em] text-white">
                Nexus <span className="text-nexus-primary">Vôlei</span>
              </p>
              <p className="hidden text-[11px] text-slate-500 sm:block">
                CT Escolinha de Vôlei
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="hidden sm:inline">{usuario?.nome}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-nexus-primary/40 hover:bg-white/5 hover:text-white"
            >
              Sair
            </button>
          </div>
        </div>
        {usuario?.role === "admin" && (
          <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
            {NAV_ADMIN.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-nexus-primary text-nexus-bg"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>
      <main className="relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
