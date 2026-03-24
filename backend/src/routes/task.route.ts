import { Router } from "express";
import { createTaskController, getAllTasksController, updateTaskController, getTaskByIdController, deleteTaskController } from "../controllers/task.controller.js";

export const taskRoutes = Router();

taskRoutes.post("/projects/:projectId/workspace/:workspaceId/create", createTaskController);

taskRoutes.delete("/:id/workspace/:workspaceId/delete", deleteTaskController)

taskRoutes.put("/:id/projects/:projectId/workspace/:workspaceId/update", updateTaskController);

taskRoutes.get("/workspace/:workspaceId/all", getAllTasksController);

taskRoutes.get("/:id/project/:projectId/workspace/:workspaceId", getTaskByIdController);