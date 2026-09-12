import { Router } from "express";
import {
  listarTurmasController,
  buscarTurmaController,
  criarTurmaController,
  atualizarTurmaController,
  removerTurmaController,
} from "../controllers/turma.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/", listarTurmasController);
router.get("/:id", buscarTurmaController);
router.post("/", criarTurmaController);
router.put("/:id", atualizarTurmaController);
router.delete("/:id", removerTurmaController);

export default router;
