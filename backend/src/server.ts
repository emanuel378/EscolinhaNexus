import express from "express";
import cors from "cors";
import { env } from "./lib/env";
import { errorHandler } from "./middlewares/errorHandler";
import alunoRoutes from "./routes/aluno.routes";
import turmaRoutes from "./routes/turma.routes";
import treinoRoutes from "./routes/treino.routes";
import mensalidadeRoutes from "./routes/mensalidade.routes";
import pontuacaoRoutes from "./routes/pontuacao.routes";
import relatorioRoutes from "./routes/relatorio.routes";
import rankingRoutes from "./routes/ranking.routes";

const app = express();

app.use(cors({ origin: env.frontendUrl, credentials: true }));
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

// Login/refresh/logout são feitos pelo frontend diretamente contra o
// Supabase Auth (supabase-js). Este backend só valida o token recebido
// (ver middlewares/auth.middleware.ts) e aplica as regras de autorização.
app.use("/alunos", alunoRoutes);
app.use("/turmas", turmaRoutes);
app.use("/treinos", treinoRoutes);
app.use("/mensalidades", mensalidadeRoutes);
app.use("/pontuacoes", pontuacaoRoutes);
app.use("/relatorios", relatorioRoutes);
app.use("/ranking", rankingRoutes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`Servidor rodando em http://localhost:${env.port}`);
});
