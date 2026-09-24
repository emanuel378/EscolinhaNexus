import { Router } from "express";
import { rankingController } from "../controllers/ranking.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, authorize("admin"), rankingController);

export default router;
