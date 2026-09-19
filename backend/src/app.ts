import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOptions } from "./config/cors";

import authRoutes from "./routes/auth.routes";
import projectRoutes from "./routes/project.routes";
import taskRoutes from "./routes/task.routes";
import activityRoutes from "./routes/activity.routes";
import notificationRoutes from "./routes/notification.routes";

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());



app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationRoutes);

export default app;