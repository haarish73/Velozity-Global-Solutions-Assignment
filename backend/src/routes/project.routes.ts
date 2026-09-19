import { Router } from "express";
import { createProject, getProjects } from "../controllers/project.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorizeRoles } from "../middleware/role.middleware";

const router = Router();

router.post("/", authenticate, authorizeRoles("ADMIN", "PM"), createProject);
router.get("/", authenticate, getProjects);

export default router;