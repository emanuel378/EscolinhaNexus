import { Router } from "express";
import {
  listarTreinosController,
  buscarTreinoController,
  criarTreinoController,
  atualizarTreinoController,
  removerTreinoController,
} from "../controllers/treino.controller";
import {
  fichaDeChamadaController,
  marcarFrequenciasController,
} from "../controllers/frequencia.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/", listarTreinosController);
router.get("/:id", buscarTreinoController);
router.post("/", criarTreinoController);
router.put("/:id", atualizarTreinoController);
router.delete("/:id", removerTreinoController);

// Ficha de chamada do treino (listar alunos da turma + marcar presença em lote).
router.get("/:treinoId/frequencias", fichaDeChamadaController);
router.put("/:treinoId/frequencias", marcarFrequenciasController);

export default router;
