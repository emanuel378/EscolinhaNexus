import { Router } from "express";
import { removerPontuacaoController } from "../controllers/pontuacao.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate, authorize("admin"));

router.delete("/:pontuacaoId", removerPontuacaoController);

export default router;
