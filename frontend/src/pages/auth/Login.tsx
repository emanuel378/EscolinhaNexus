import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      const usuario = await login(email, senha);
      navigate(usuario.role === "admin" ? "/admin" : "/aluno", { replace: true });
    } catch {
      setErro("Email ou senha inválidos.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-nexus-bg">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/login-bg.webp)" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-nexus-bg/90 via-nexus-bg/20 to-transparent lg:bg-gradient-to-l lg:from-nexus-bg/80 lg:via-transparent lg:to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-screen w-full flex-col items-center justify-end px-4 pb-10 pt-[45vh] sm:px-6 lg:flex-row lg:justify-end lg:px-16 lg:py-12 xl:px-24">
        <div className="w-full max-w-sm rounded-2xl border border-nexus-primary/20 bg-nexus-surface/85 p-6 shadow-nexus-glow backdrop-blur-md sm:p-8">
          <div className="mb-6">
            <img
              src="/images/nexus-logo.jpg"
              alt="Nexus Vôlei"
              className="h-12 w-12 rounded-xl shadow-nexus-glow"
            />
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-nexus-highlight/80">
              <span className="h-px w-6 bg-nexus-gold" />
              Nexus Vôlei
            </div>
            <h1 className="mt-3 font-display text-2xl font-bold uppercase tracking-wide text-white sm:text-3xl">
              CT Escolinha de Vôlei
            </h1>
            <p className="mt-1 text-sm text-slate-400">Entre com sua conta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-nexus-bg/60 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-nexus-primary focus:ring-2 focus:ring-nexus-primary/40"
                placeholder="seuemail@exemplo.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                Senha
              </label>
              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-nexus-bg/60 px-3 py-2 text-sm text-white placeholder-slate-500 outline-none transition focus:border-nexus-primary focus:ring-2 focus:ring-nexus-primary/40"
                placeholder="••••••••"
              />
            </div>

            {erro && <p className="text-sm text-red-400">{erro}</p>}

            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-lg bg-nexus-primary py-2 text-sm font-semibold text-nexus-bg shadow-nexus-glow transition hover:bg-nexus-highlight disabled:opacity-60"
            >
              {enviando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] uppercase tracking-[0.2em] text-slate-500">
            Disciplina <span className="text-nexus-gold">•</span> Foco{" "}
            <span className="text-nexus-gold">•</span> Evolução
          </p>
        </div>
      </div>
    </div>
  );
}
