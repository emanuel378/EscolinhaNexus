import { Router } from "express";
import {
  listarAlunosController,
  buscarAlunoController,
  criarAlunoController,
  atualizarAlunoController,
  alterarStatusAlunoController,
  removerAlunoController,
  meuPerfilAlunoController,
} from "../controllers/aluno.controller";
import {
  historicoFrequenciaAlunoController,
  minhaFrequenciaController,
} from "../controllers/frequencia.controller";
import {
  listarMensalidadesController,
  criarMensalidadeController,
} from "../controllers/mensalidade.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

// Rotas do próprio aluno: somente leitura dos seus dados.
router.get("/me", authorize("aluno"), meuPerfilAlunoController);
router.get("/me/frequencias", authorize("aluno"), minhaFrequenciaController);

// Todas as rotas abaixo são exclusivas do admin.
router.get("/", authorize("admin"), listarAlunosController);
router.get("/:id", authorize("admin"), buscarAlunoController);
router.post("/", authorize("admin"), criarAlunoController);
router.put("/:id", authorize("admin"), atualizarAlunoController);
router.patch("/:id/status", authorize("admin"), alterarStatusAlunoController);
router.delete("/:id", authorize("admin"), removerAlunoController);

router.get("/:id/frequencias", authorize("admin"), historicoFrequenciaAlunoController);

router.get("/:id/mensalidades", authorize("admin"), listarMensalidadesController);
router.post("/:id/mensalidades", authorize("admin"), criarMensalidadeController);

export default router;
