import type { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware.js";
import { HTTPSTATUS } from "../config/http.config.js";
import { getCurrentUserService } from "../service/user.service.js";

export const getCurrentUserController = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
        const userId = req.user?._id;
        const { user } = await getCurrentUserService(userId);

        return res.status(HTTPSTATUS.OK).json({
            message: "User fetch successfully",
            user
        })
    }
)