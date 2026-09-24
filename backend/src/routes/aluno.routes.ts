import { Router } from "express";
import multer from "multer";
import {
  listarAlunosController,
  buscarAlunoController,
  criarAlunoController,
  atualizarAlunoController,
  alterarStatusAlunoController,
  removerAlunoController,
  meuPerfilAlunoController,
  meuProximoTreinoController,
  meuCalendarioController,
  meuHistoricoMensalController,
  uploadFotoAlunoController,
  removerFotoAlunoController,
} from "../controllers/aluno.controller";
import {
  historicoFrequenciaAlunoController,
  minhaFrequenciaController,
} from "../controllers/frequencia.controller";
import {
  listarMensalidadesController,
  criarMensalidadeController,
  minhasMensalidadesController,
} from "../controllers/mensalidade.controller";
import {
  listarPontuacoesController,
  lancarPontuacaoController,
  minhasPontuacoesController,
} from "../controllers/pontuacao.controller";
import {
  listarRelatoriosController,
  criarRelatorioController,
  meusRelatoriosController,
} from "../controllers/relatorio.controller";
import { meuRankingController } from "../controllers/ranking.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

const uploadFoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.use(authenticate);

// Rotas do próprio aluno: somente leitura dos seus dados.
router.get("/me", authorize("aluno"), meuPerfilAlunoController);
router.get("/me/frequencias", authorize("aluno"), minhaFrequenciaController);
router.get("/me/pontuacoes", authorize("aluno"), minhasPontuacoesController);
router.get("/me/relatorios", authorize("aluno"), meusRelatoriosController);
router.get("/me/ranking", authorize("aluno"), meuRankingController);
router.get("/me/proximo-treino", authorize("aluno"), meuProximoTreinoController);
router.get("/me/calendario", authorize("aluno"), meuCalendarioController);
router.get("/me/historico-mensal", authorize("aluno"), meuHistoricoMensalController);
router.get("/me/mensalidades", authorize("aluno"), minhasMensalidadesController);

// Todas as rotas abaixo são exclusivas do admin.
router.get("/", authorize("admin"), listarAlunosController);
router.get("/:id", authorize("admin"), buscarAlunoController);
router.post("/", authorize("admin"), criarAlunoController);
router.put("/:id", authorize("admin"), atualizarAlunoController);
router.patch("/:id/status", authorize("admin"), alterarStatusAlunoController);
router.delete("/:id", authorize("admin"), removerAlunoController);

router.post(
  "/:id/foto",
  authorize("admin"),
  uploadFoto.single("foto"),
  uploadFotoAlunoController
);
router.delete("/:id/foto", authorize("admin"), removerFotoAlunoController);

router.get("/:id/frequencias", authorize("admin"), historicoFrequenciaAlunoController);

router.get("/:id/mensalidades", authorize("admin"), listarMensalidadesController);
router.post("/:id/mensalidades", authorize("admin"), criarMensalidadeController);

router.get("/:id/pontuacoes", authorize("admin"), listarPontuacoesController);
router.post("/:id/pontuacoes", authorize("admin"), lancarPontuacaoController);

router.get("/:id/relatorios", authorize("admin"), listarRelatoriosController);
router.post("/:id/relatorios", authorize("admin"), criarRelatorioController);

export default router;
