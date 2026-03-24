import type z from "zod";
import ProjectModel from "../models/project.model.js"
import type { createProjectSchema, updateProjectSchema } from "../validation/project.validation.js";
import WorkspaceModel from "../models/workspace.model.js";
import { NotFoundException } from "../utils/app-error.js";
import TaskModel from "../models/task.model.js";
import mongoose from "mongoose";
import { TaskStatusEnum } from "../enums/task.enum.js";

export const createProjectService = async (
    userId: string,
    workspaceId: string,
    body: z.infer<typeof createProjectSchema>
) => {
    const project = new ProjectModel({
        ...(body.emoji && { emoji: body.emoji }),
        name: body.name,
        description: body.description,
        workspace: workspaceId,
        createdBy: userId
    })

    await project.save();

    return {
        project,
    }
}

export const getAllProjectsInWorkspaceService = async (
    workspaceId: string,
    pageSize: number,
    pageNumber: number
) => {
    const totalCount = await ProjectModel.countDocuments({
        workspace: workspaceId
    })

    const skip = (pageNumber - 1) * pageSize;

    const projects = await ProjectModel.find({
        workspace: workspaceId
    })
        .skip(skip)
        .limit(pageSize)
        .populate("createdBy", "_id name profilePicture -password")
        .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
        projects,
        totalCount,
        totalPages,
        skip,
    };
}

export const getProjectByIdService = async (
    projectId: string,
    workspaceId: string
) => {
    const project = await ProjectModel.findOne({
        _id: projectId,
        workspace: workspaceId
    }).select("_id emoji name description");

    if (!project) {
        throw new NotFoundException(
            "Project not found or does not belong to specified workspace"
        );
    }

    return {
        project,
    }
}

export const getProjectAnalyticsService = async (
    workspaceId: string,
    projectId: string
) => {
    const project = await ProjectModel.findById(projectId);

    if (!project || project.workspace.toString() !== workspaceId) {
        throw new NotFoundException(
            "Project not found or does not belong to this workspace",
        )
    }

    const currentDate = new Date();

    // Using mongoose aggregate
    const taskAnalytics = await TaskModel.aggregate([
        {
            $match: {
                project: new mongoose.Types.ObjectId(projectId),
            },
        },
        {

            $facet: {
                totalTasks: [{ $count: "count" }],
                overdueTasks: [
                    {
                        $match: {
                            dueDate: { $lt: currentDate },
                            status: {
                                $ne: TaskStatusEnum.DONE,
                            },
                        },
                    },
                    {
                        $count: "count",
                    },
                ],
                completedTasks: [
                    {
                        $match: { 
                            status: TaskStatusEnum.DONE,  
                        },
                    },
                    {
                        $count: "count"
                    },
                ]
            }
        }
    ]);

    const _analytics = taskAnalytics[0];

    const analytics = {
        totalTasks: _analytics.totalTasks[0]?.count || 0,
        overdueTasks: _analytics.overdueTasks[0]?.count || 0,
        completedTasks: _analytics.completedTasks[0]?.count || 0,
    }

    return {
        analytics,
    }
}

export const updateProjectService = async (
    workspaceId: string,
    projectId: string,
    body: z.infer<typeof updateProjectSchema>
) => {
    const { name, description, emoji } = body;

    const project = await ProjectModel.findOne({
        _id: projectId,
        workspace: workspaceId
    });
    
    if (!project) {
        throw new NotFoundException(
            "Project not found or does not belong to specified workspace",
        )
    }

    if (name) project.name = name;
    if (description) project.description = description;
    if (emoji) project.emoji = emoji;

    await project.save();

    return {
        project,
    }
}

export const deleteProjectService = async (
    workspaceId: string,
    projectId: string
) => {
    const project = await ProjectModel.findOne({
        _id: projectId,
        workspace: workspaceId,
    })

    if (!project) {
        throw new NotFoundException(
            "Project not found or does not belong to specified workspace",
        )
    }

    await project.deleteOne();

    await TaskModel.deleteMany({
        project: project._id
    })

    return { 
        deletedProjectId: project._id,
    };
}