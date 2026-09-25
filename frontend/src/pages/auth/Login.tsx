import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { IconArrowRight, IconEye, IconEyeOff, IconLock, IconMail } from "../../components/Icons";

const campo =
  "w-full rounded-xl border border-white/15 bg-nexus-bg/40 py-3 pl-11 pr-4 text-sm text-white placeholder-slate-400 outline-none transition focus:border-nexus-primary focus:ring-2 focus:ring-nexus-primary/30";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
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
      {/* A arte de fundo já traz o logo Nexus; ela fica ancorada no topo para
          o logo ter posição previsível e o card ficar sempre logo abaixo dele. */}
      <div
        className="absolute inset-0 bg-cover bg-top"
        style={{ backgroundImage: "url(/images/login-bg.webp)" }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-nexus-bg/80 via-transparent to-transparent"
        aria-hidden="true"
      />

      {/* O logo da arte termina em ~39% da altura da imagem exibida, que é o
          maior entre a altura da tela e 56% da largura (proporção da arte). */}
      <div className="relative z-10 flex min-h-screen w-full flex-col items-center px-4 pb-10 pt-[max(42vh,24vw)]">
        <div className="w-full max-w-md rounded-2xl border border-nexus-primary/30 bg-nexus-bg/45 p-6 shadow-[0_0_40px_rgba(0,180,255,0.15)] backdrop-blur-md sm:p-8">
          <h1 className="text-2xl font-bold text-white">Bem-vindo de volta!</h1>
          <p className="mt-1 text-sm text-slate-300">Entre com sua conta para continuar.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="relative">
              <IconMail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              <input
                type="email"
                required
                autoComplete="email"
                aria-label="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={campo}
                placeholder="E-mail"
              />
            </div>

            <div className="relative">
              <IconLock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              <input
                type={mostrarSenha ? "text" : "password"}
                required
                autoComplete="current-password"
                aria-label="Senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className={`${campo} pr-12`}
                placeholder="Senha"
              />
              <button
                type="button"
                onClick={() => setMostrarSenha((v) => !v)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-300 transition hover:text-white"
              >
                {mostrarSenha ? <IconEye className="h-5 w-5" /> : <IconEyeOff className="h-5 w-5" />}
              </button>
            </div>

            {erro && <p className="text-sm text-red-400">{erro}</p>}

            <button
              type="submit"
              disabled={enviando}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-nexus-primary py-3 text-sm font-semibold text-nexus-bg shadow-nexus-glow transition hover:brightness-110 disabled:opacity-60"
            >
              {enviando ? "Entrando..." : "Entrar"}
              {!enviando && <IconArrowRight className="h-4 w-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
