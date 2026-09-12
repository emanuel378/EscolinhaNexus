import { Router } from "express";
import {
  atualizarMensalidadeController,
  removerMensalidadeController,
  contarPendentesController,
} from "../controllers/mensalidade.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, authorize("admin"));

router.get("/pendentes/contagem", contarPendentesController);
router.put("/:mensalidadeId", atualizarMensalidadeController);
router.delete("/:mensalidadeId", removerMensalidadeController);

export default router;
