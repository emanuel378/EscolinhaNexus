import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "./Spinner";
import { Role } from "../types";

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { autenticado, usuario, carregando } = useAuth();

  if (carregando) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-nexus-bg text-sm text-slate-400">
        <Spinner size="md" />
        Carregando...
      </div>
    );
  }

  if (!autenticado || !usuario) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(usuario.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
