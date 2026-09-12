import { Router } from "express";
import {
  atualizarRelatorioController,
  removerRelatorioController,
} from "../controllers/relatorio.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, authorize("admin"));

router.put("/:relatorioId", atualizarRelatorioController);
router.delete("/:relatorioId", removerRelatorioController);

export default router;
