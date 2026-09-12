import { Router } from "express";
import { resumoDashboardController } from "../controllers/dashboard.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.get("/resumo", authenticate, authorize("admin"), resumoDashboardController);

export default router;
