import { Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/auth/Login";
import { AdminDashboardPage } from "./pages/admin/Dashboard";
import { AlunosListPage } from "./pages/admin/AlunosList";
import { AlunoFormPage } from "./pages/admin/AlunoForm";
import { AlunoDetailPage } from "./pages/admin/AlunoDetail";
import { TurmasListPage } from "./pages/admin/TurmasList";
import { TurmaFormPage } from "./pages/admin/TurmaForm";
import { TreinosListPage } from "./pages/admin/TreinosList";
import { TreinoFormPage } from "./pages/admin/TreinoForm";
import { ChamadaPage } from "./pages/admin/Chamada";
import { RankingPage } from "./pages/admin/Ranking";
import { RelatoriosStatusPage } from "./pages/admin/RelatoriosStatus";
import { AlunoHomePage } from "./pages/aluno/Home";
import { AlunoRankingPage } from "./pages/aluno/Ranking";
import { AlunoEvolucaoPage } from "./pages/aluno/Evolucao";
import { AlunoCalendarioPage } from "./pages/aluno/Calendario";
import { AlunoRelatoriosPage } from "./pages/aluno/Relatorios";
import { AlunoPerfilPage } from "./pages/aluno/Perfil";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<Layout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/alunos" element={<AlunosListPage />} />
          <Route path="/admin/alunos/novo" element={<AlunoFormPage />} />
          <Route path="/admin/alunos/:id" element={<AlunoDetailPage />} />
          <Route path="/admin/alunos/:id/editar" element={<AlunoFormPage />} />

          <Route path="/admin/turmas" element={<TurmasListPage />} />
          <Route path="/admin/turmas/nova" element={<TurmaFormPage />} />
          <Route path="/admin/turmas/:id/editar" element={<TurmaFormPage />} />

          <Route path="/admin/treinos" element={<TreinosListPage />} />
          <Route path="/admin/treinos/novo" element={<TreinoFormPage />} />
          <Route path="/admin/treinos/:id/editar" element={<TreinoFormPage />} />
          <Route path="/admin/treinos/:id/chamada" element={<ChamadaPage />} />

          <Route path="/admin/ranking" element={<RankingPage />} />
          <Route path="/admin/relatorios" element={<RelatoriosStatusPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["aluno"]} />}>
        <Route element={<Layout />}>
          <Route path="/aluno" element={<AlunoHomePage />} />
          <Route path="/aluno/ranking" element={<AlunoRankingPage />} />
          <Route path="/aluno/evolucao" element={<AlunoEvolucaoPage />} />
          <Route path="/aluno/calendario" element={<AlunoCalendarioPage />} />
          <Route path="/aluno/relatorios" element={<AlunoRelatoriosPage />} />
          <Route path="/aluno/perfil" element={<AlunoPerfilPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
