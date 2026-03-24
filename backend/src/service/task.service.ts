import type z from "zod";
import { updateTaskSchema, type createTaskSchema, type TaskFilters } from "../validation/task.validation.js";
import TaskModel from "../models/task.model.js";
import ProjectModel from "../models/project.model.js";
import { BadRequestException, NotFoundException } from "../utils/app-error.js";
import MemberModel from "../models/member.model.js";
import { TaskPriorityEnum, TaskStatusEnum } from "../enums/task.enum.js";

export const createTaskService = async (
    workspaceId: string,
    projectId: string,
    userId: string,
    body: z.infer<typeof createTaskSchema>
) => {
    const { title, description, status, priority, assignedTo, dueDate } = body;

    const project = await ProjectModel.findById(projectId);

    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundException(
            "Project not found or does not belong to this workspace",
        )
    }

    if (assignedTo) {
        const isAssignedUserMember = await MemberModel.exists({
            userId: assignedTo,
            workspaceId
        })

        if (!isAssignedUserMember) {
            throw new Error("Assigned user is not a member of this workspace")
        }
    }

    const task = new TaskModel({
        title,
        description,
        priority: priority || TaskPriorityEnum.MEDIUM,
        status: status || TaskStatusEnum.TODO,
        assignedTo,
        createdBy: userId,
        workspace: workspaceId,
        project: projectId,
        dueDate,
    })

    await task.save();

    return {
        task
    }
}

export const updateTaskService = async (
    workspaceId: string,
    projectId: string,
    taskId: string,
    body: z.infer<typeof updateTaskSchema>
) => {
    const project = await ProjectModel.findById(projectId);

    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundException(
            "Project not found or does not belong to this workspace",
        )
    }

    const task = await TaskModel.findById(taskId);
    
    if (!task || task.project.toString() !== projectId.toString()) {
        throw new NotFoundException(
            "Task not found or does not belong to this project",
        )
    }

    const updatedTask = await TaskModel.findByIdAndUpdate(
        taskId,
        {
            ...body,
        },
        { new: true },
    )

    if (!updatedTask) {
        throw new BadRequestException("Failed to update task");
    }

    return {
        updatedTask,
    }
}

export const getAllTasksService = async (
    workspaceId: string,
    filters: TaskFilters,
    pagination: {
        pageSize: number;
        pageNumber: number;
    } 
) => {
    const query: Record<string, any> = {
        workspace: workspaceId,
    }

    if (filters.projectId) {
        query.project = filters.projectId;
    }
    
    if (filters.status && filters.status?.length > 0) {
        query.status = { $in: filters.status };
    }

    if (filters.priority && filters.priority?.length > 0) {
        query.priority = { $in: filters.priority };
    }

    if (filters.assignedTo && filters.assignedTo?.length > 0) {
        query.assignedTo = { $in: filters.assignedTo };
    }

    if (filters.keyword && filters.keyword?.length !== undefined) {
        query.title = { $regex: filters.keyword, $options: "i" };
    }

    if (filters.dueDate) {
        query.dueDate = {
            $eq: new Date(filters.dueDate),
        }
    }

    // Pagination Setup
    const { pageSize, pageNumber } = pagination;
    const skip = (pageNumber - 1) * pageSize;

    const [tasks, totalCount] = await Promise.all([
        TaskModel.find(query)
            .skip(skip)
            .limit(pageSize)
            .sort({ createdAt: -1 })
            .populate("assignedTo", "_id name profilePicture -password")
            .populate("project", "_id name emoji"),
        TaskModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        tasks,
        pagination: {
            pageSize,
            pageNumber,
            totalCount,
            totalPages,
            skip,
        },
    };
}

export const getTaskByIdService = async (
    taskId: string,
    projectId: string,
    workspaceId: string,
) => {
    const project = await ProjectModel.findById(projectId);

    if (!project || project.workspace.toString() !== workspaceId.toString()) {
        throw new NotFoundException(
            "Project not found or not belong to this workspace",
        )
    }

    const task = await TaskModel.findOne({
        _id: taskId,
        project: projectId,
        workspace: workspaceId,
    }).populate("assignedTo", "_id name profilePicture -password");

    if (!task) {
        throw new NotFoundException("Task not found");
    }

    return {
        task
    }
}

export const deleteTaskService = async (
    workspaceId: string,
    taskId: string,
) => {
    const task = await TaskModel.findOneAndDelete({
        _id: taskId,
        workspace: workspaceId
    });

    if (!task) {
        throw new NotFoundException(
            "Task not found or does not belong to specified workspace",
        )
    }

    return {
        deletedTaskId: task._id,
    };
}