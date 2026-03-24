import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { createTaskSchema, taskIdSchema, updateTaskSchema, type TaskFilters } from "../validation/task.validation.js";
import { projectIdSchema } from "../validation/project.validation.js";
import { workspaceIdSchema } from "../validation/workspace.validation.js";
import { getMemberRoleInWorkspace } from "../service/member.service.js";
import { roleGuard } from "../utils/role-guard.js";
import { Permissions } from "../enums/role.enum.js";
import { createTaskService, getAllTasksService, updateTaskService } from "../service/task.service.js";
import { HTTPSTATUS } from "../config/http.config.js";

export const createTaskController = asyncHandler(
    async (req: Request, res: Response) => {
        const body = createTaskSchema.parse(req.body);
        const projectId = projectIdSchema.parse(req.params.projectId);
        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

        const userId = req.user?._id;

        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.CREATE_TASK]);

        const { task } = await createTaskService(
            workspaceId,
            projectId,
            userId,
            body
        )

        return res.status(HTTPSTATUS.CREATED).json({
            message: "Task created successfully",
            task
        })
    }
)

export const updateTaskController = asyncHandler(
    async (req: Request, res: Response) => {
        const body = updateTaskSchema.parse(req.body);
        const projectId = projectIdSchema.parse(req.params.projectId);
        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

        const userId = req.user?._id;

        const taskId = taskIdSchema.parse(req.params.id);

        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.CREATE_TASK]);

        const { updatedTask } = await updateTaskService(
            workspaceId,
            projectId,
            taskId,
            body
        )

        return res.status(HTTPSTATUS.OK).json({
            message: "Task updated successfully",
            task: updatedTask,
        })
    }
)

export const getAllTasksController = asyncHandler(
    async (req: Request, res: Response) => {
        const userId = req.user?._id;

        const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

        const filters: TaskFilters = {};

        if (req.query.projectId) {
            filters.projectId = req.query.projectId as string;
        }

        if (req.query.status) {
            filters.status = (req.query.status as string).split(",");
        }

        if (req.query.priority) {
            filters.priority = (req.query.priority as string).split(",");
        }

        if (req.query.assignedTo) {
            filters.assignedTo = (req.query.assignedTo as string).split(",");
        }

        if (req.query.keyword) {
            filters.keyword = req.query.keyword as string;
        }

        if (req.query.dueDate) {
            filters.dueDate = req.query.dueDate as string;
        }

        const pagination = {
            pageSize: parseInt(req.query.pageSize as string) || 10,
            pageNumber: parseInt(req.query.pageNumber as string) || 1,
        }

        const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
        roleGuard(role, [Permissions.VIEW_ONLY]);

        const result = await getAllTasksService(
            workspaceId, 
            filters, 
            pagination
        );

        res.status(HTTPSTATUS.OK).json({
            message: "All tasks fetched successfully",
            ...result
        })
    }
)