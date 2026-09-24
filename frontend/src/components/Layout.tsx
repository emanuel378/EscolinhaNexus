import { ComponentType, SVGProps } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import * as alunoService from "../services/aluno.service";
import { Avatar } from "./Avatar";
import { IconCalendar, IconClipboard, IconHome, IconTrend, IconTrophy } from "./Icons";

interface NavItem {
  to: string;
  label: string;
  end?: boolean;
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
}

const NAV_ADMIN: NavItem[] = [
  { to: "/admin", label: "Painel", end: true },
  { to: "/admin/alunos", label: "Alunos" },
  { to: "/admin/turmas", label: "Turmas" },
  { to: "/admin/treinos", label: "Treinos" },
  { to: "/admin/ranking", label: "Ranking" },
  { to: "/admin/relatorios", label: "Relatórios" },
];

// Perfil fica fora da barra de abas: é acessado pelo avatar no topo, como
// em apps mobile — assim a barra inferior cabe em 5 itens no celular.
const NAV_ALUNO: NavItem[] = [
  { to: "/aluno", label: "Início", end: true, icon: IconHome },
  { to: "/aluno/ranking", label: "Ranking", icon: IconTrophy },
  { to: "/aluno/evolucao", label: "Evolução", icon: IconTrend },
  { to: "/aluno/calendario", label: "Calendário", icon: IconCalendar },
  { to: "/aluno/relatorios", label: "Relatórios", icon: IconClipboard },
];

const TITULOS_ALUNO: Record<string, string> = {
  "/aluno": "Início",
  "/aluno/ranking": "Ranking",
  "/aluno/evolucao": "Evolução",
  "/aluno/calendario": "Calendário",
  "/aluno/relatorios": "Relatórios",
  "/aluno/perfil": "Perfil",
};

export function Layout() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const ehAluno = usuario?.role === "aluno";

  const { data: aluno } = useQuery({
    queryKey: ["alunos", "me"],
    queryFn: alunoService.meuPerfil,
    enabled: ehAluno,
  });

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const nav = ehAluno ? NAV_ALUNO : NAV_ADMIN;
  const tituloPagina = ehAluno ? TITULOS_ALUNO[pathname] : undefined;

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-nexus-bg">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-96 bg-[radial-gradient(ellipse_60%_100%_at_50%_-10%,rgba(0,180,255,0.12),transparent)]"
        aria-hidden="true"
      />
      <header className="sticky top-0 z-20 border-b border-white/10 bg-nexus-surface/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <img
              src="/images/nexus-logo.jpg"
              alt="Nexus Vôlei"
              className="h-9 w-9 rounded-lg shadow-nexus-glow"
            />
            <div className="leading-tight">
              <p className="font-display text-xs font-bold uppercase tracking-[0.15em] text-nexus-primary sm:text-sm">
                Nexus <span className="text-white">Vôlei</span>
              </p>
              {tituloPagina ? (
                <p className="font-display text-lg font-bold leading-none text-white">
                  {tituloPagina}
                </p>
              ) : (
                <p className="hidden text-[11px] text-slate-500 sm:block">CT Escolinha de Vôlei</p>
              )}
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
            {ehAluno && usuario && (
              <Link
                to="/aluno/perfil"
                aria-label="Meu perfil"
                className="rounded-full ring-2 ring-nexus-primary/40 transition hover:ring-nexus-primary"
              >
                <Avatar nome={usuario.nome} fotoUrl={aluno?.fotoUrl ?? null} tamanho="sm" />
              </Link>
            )}
          </div>
        </div>
        {usuario && !ehAluno && (
          <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-nexus-primary text-nexus-bg"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </NavLink>
            ))}
          </nav>
        )}
      </header>

      <main
        className={`relative z-10 mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 ${
          ehAluno ? "pb-28" : ""
        }`}
      >
        <Outlet />
      </main>

      {ehAluno && (
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-nexus-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <div className="mx-auto grid max-w-xl grid-cols-5">
            {NAV_ALUNO.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
                    isActive ? "text-nexus-primary" : "text-slate-500 hover:text-slate-300"
                  }`
                }
              >
                {item.icon && <item.icon className="h-5 w-5" />}
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  );
}
