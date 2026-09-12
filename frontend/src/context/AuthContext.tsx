import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../services/supabaseClient";
import { Usuario } from "../types";

interface AuthContextValue {
  usuario: Usuario | null;
  carregando: boolean;
  autenticado: boolean;
  login: (email: string, senha: string) => Promise<Usuario>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// O papel (admin | aluno) vive em app_metadata, que só o backend (service
// role) consegue escrever — diferente de user_metadata, o próprio usuário
// não tem como alterar isso pelo client-side SDK.
function paraUsuario(user: User | null | undefined): Usuario | null {
  if (!user || !user.email) return null;

  const role = user.app_metadata?.role;
  if (role !== "admin" && role !== "aluno") return null;

  return {
    id: user.id,
    nome: (user.user_metadata?.nome as string | undefined) ?? user.email,
    email: user.email,
    role,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUsuario(paraUsuario(data.session?.user));
      setCarregando(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(paraUsuario(session?.user));
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function login(email: string, senha: string): Promise<Usuario> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error || !data.user) {
      throw error ?? new Error("Não foi possível autenticar.");
    }

    const usuarioLogado = paraUsuario(data.user);
    if (!usuarioLogado) {
      await supabase.auth.signOut();
      throw new Error("Usuário sem papel (role) definido.");
    }

    setUsuario(usuarioLogado);
    return usuarioLogado;
  }

  async function logout(): Promise<void> {
    await supabase.auth.signOut();
    setUsuario(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      usuario,
      carregando,
      autenticado: !!usuario,
      login,
      logout,
    }),
    [usuario, carregando]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider.");
  }
  return context;
}
