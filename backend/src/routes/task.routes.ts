import { Router } from "express";
import {
  createTask,
  updateTaskStatus,
  getTasks,
} from "../controllers/task.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, createTask);
router.put("/:taskId/status", authenticate, updateTaskStatus);
router.get("/", authenticate, getTasks);

export default router;