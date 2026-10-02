import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { iniciais } from "../utils/nome";
import { Icon } from "./Icon";

interface NavItem {
  to: string;
  label: string;
  icon: string;
  end?: boolean;
}

// Menu lateral (desktop): todas as áreas do admin.
const NAV_LATERAL: NavItem[] = [
  { to: "/admin", label: "Painel", icon: "dashboard", end: true },
  { to: "/admin/alunos", label: "Alunos", icon: "group" },
  { to: "/admin/chamada", label: "Chamada", icon: "fact_check" },
  { to: "/admin/treinos", label: "Treinos", icon: "sports_volleyball" },
  { to: "/admin/turmas", label: "Turmas", icon: "groups" },
  { to: "/admin/ranking", label: "Ranking", icon: "emoji_events" },
  { to: "/admin/relatorios", label: "Relatórios", icon: "assignment" },
];

// Barra inferior (celular): as 5 áreas de uso diário na quadra. Turmas e
// Relatórios ficam no menu do avatar (e Turmas também como aba em Treinos).
const NAV_INFERIOR: NavItem[] = [
  { to: "/admin", label: "Painel", icon: "dashboard", end: true },
  { to: "/admin/alunos", label: "Alunos", icon: "group" },
  { to: "/admin/chamada", label: "Chamada", icon: "fact_check" },
  { to: "/admin/ranking", label: "Ranking", icon: "emoji_events" },
  { to: "/admin/treinos", label: "Treinos", icon: "sports_volleyball" },
];

const TITULOS: [RegExp, string][] = [
  [/^\/admin\/?$/, "Painel"],
  [/^\/admin\/alunos\/novo/, "Novo aluno"],
  [/^\/admin\/alunos\/[^/]+\/editar/, "Editar aluno"],
  [/^\/admin\/alunos\/[^/]+/, "Detalhes do atleta"],
  [/^\/admin\/alunos/, "Alunos"],
  [/^\/admin\/treinos\/[^/]+\/chamada/, "Chamada"],
  [/^\/admin\/chamada/, "Chamada"],
  [/^\/admin\/treinos\/novo/, "Novo treino"],
  [/^\/admin\/treinos\/[^/]+\/editar/, "Editar treino"],
  [/^\/admin\/treinos/, "Treinos"],
  [/^\/admin\/turmas\/nova/, "Nova turma"],
  [/^\/admin\/turmas\/[^/]+\/editar/, "Editar turma"],
  [/^\/admin\/turmas/, "Turmas"],
  [/^\/admin\/ranking/, "Ranking"],
  [/^\/admin\/relatorios/, "Relatórios"],
];

function tituloDaRota(pathname: string) {
  return TITULOS.find(([padrao]) => padrao.test(pathname))?.[1] ?? "Painel";
}

function Logo({ compacto = false }: { compacto?: boolean }) {
  return (
    <Link to="/admin" className="flex shrink-0 items-center gap-2.5">
      <img
        src="/images/nexus-logo.jpg"
        alt="Nexus Vôlei"
        className="h-9 w-9 rounded-lg shadow-nexus-glow"
      />
      {!compacto && (
        <span className="font-chivo text-lg font-extrabold tracking-[0.12em] text-white">
          NEXUS
        </span>
      )}
    </Link>
  );
}

function AvatarAdmin({ nome }: { nome: string }) {
  return (
    <span className="relative inline-flex">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-nexus-primary to-nexus-highlight font-chivo text-sm font-extrabold text-nexus-bg ring-2 ring-nexus-gold">
        {iniciais(nome)}
      </span>
      <span className="absolute -bottom-1 -right-2 rounded-full bg-nexus-gold px-1.5 font-chivo text-[9px] font-extrabold leading-4 text-nexus-bg">
        ADM
      </span>
    </span>
  );
}

export function AdminShell() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const titulo = tituloDaRota(pathname);

  const [menuAberto, setMenuAberto] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMenuAberto(false), [pathname]);

  useEffect(() => {
    if (!menuAberto) return;
    function fechar(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuAberto(false);
    }
    document.addEventListener("mousedown", fechar);
    return () => document.removeEventListener("mousedown", fechar);
  }, [menuAberto]);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const nome = usuario?.nome ?? "Admin";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-nexus-bg">
      <div
        className="pointer-events-none fixed inset-x-0 top-0 z-0 h-96 bg-[radial-gradient(ellipse_60%_100%_at_50%_-10%,rgba(0,180,255,0.12),transparent)]"
        aria-hidden="true"
      />

      {/* Menu lateral — desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] flex-col border-r border-white/10 bg-nexus-surface/80 backdrop-blur lg:flex">
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <Logo />
          <span className="ml-auto rounded bg-nexus-primary/15 px-1.5 py-0.5 font-chivo text-[10px] font-bold uppercase tracking-[0.12em] text-nexus-highlight">
            CT Vôlei
          </span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV_LATERAL.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? "bg-nexus-primary/10 text-nexus-primary shadow-[inset_3px_0_0_#00B4FF]"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} filled={isActive} className="text-[22px]" />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-3 border-t border-white/10 p-4">
          <AvatarAdmin nome={nome} />
          <div className="min-w-0 flex-1 pl-1">
            <p className="truncate text-sm font-semibold text-white">{nome}</p>
            <p className="text-xs text-slate-500">Administrador</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            className="btn-icone h-10 w-10"
            aria-label="Sair"
          >
            <Icon name="logout" className="text-[20px]" />
          </button>
        </div>
      </aside>

      <div className="lg:pl-[260px]">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-nexus-bg/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 lg:px-8">
          <div className="lg:hidden">
            <Logo compacto />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="flex items-center gap-1.5 font-chivo text-[10px] font-bold uppercase tracking-[0.14em] text-nexus-primary">
              Nexus CT
              <span className="rounded bg-nexus-primary/15 px-1 text-nexus-highlight">Vôlei</span>
            </p>
            <p className="truncate font-chivo text-lg font-extrabold text-white lg:text-xl">
              {titulo}
            </p>
          </div>

          <div className="relative ml-auto" ref={menuRef}>
            <button
              onClick={() => setMenuAberto((v) => !v)}
              className="flex items-center gap-3 rounded-full transition hover:opacity-90"
              aria-label="Menu do administrador"
              aria-expanded={menuAberto}
            >
              <span className="hidden text-right lg:block">
                <span className="block text-sm font-semibold text-white">{nome}</span>
                <span className="block text-xs text-slate-500">Administrador</span>
              </span>
              <AvatarAdmin nome={nome} />
            </button>

            {menuAberto && (
              <div className="absolute right-0 top-14 w-56 overflow-hidden rounded-xl border border-white/[0.14] bg-nexus-raised py-1 shadow-2xl">
                <p className="truncate border-b border-white/10 px-4 py-2.5 text-sm font-semibold text-white lg:hidden">
                  {nome}
                </p>
                <Link
                  to="/admin/turmas"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-white/5 lg:hidden"
                >
                  <Icon name="groups" className="text-[20px] text-nexus-primary" /> Turmas
                </Link>
                <Link
                  to="/admin/relatorios"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-200 hover:bg-white/5 lg:hidden"
                >
                  <Icon name="assignment" className="text-[20px] text-nexus-primary" /> Relatórios
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-400 hover:bg-white/5"
                >
                  <Icon name="logout" className="text-[20px]" /> Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-32 pt-5 lg:px-8 lg:pb-12 lg:pt-8">
        <Outlet />
      </main>
      </div>

      {/* Barra inferior — celular/tablet */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-nexus-surface/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid h-[68px] max-w-xl grid-cols-5">
          {NAV_INFERIOR.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition ${
                  isActive ? "text-nexus-primary" : "text-slate-400 hover:text-slate-200"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} filled={isActive} className="text-[24px]" />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
