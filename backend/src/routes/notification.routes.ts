import { Router } from "express";
import { getActivityFeed } from "../controllers/activity.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getActivityFeed);

export default router;