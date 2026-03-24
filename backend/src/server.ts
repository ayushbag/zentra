import "dotenv/config";
import express, {
  type Request,
  type Response,
  type NextFunction,
} from "express";
import cors from "cors";
import session from "cookie-session";
import { config } from "./config/app.config.js";
import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { HTTPSTATUS } from "./config/http.config.js";
import { BadRequestException } from "./utils/app-error.js";
import { asyncHandler } from "./middlewares/asyncHandler.middleware.js";
import { ErrorCodeEnum } from "./enums/error-code.enum.js";

import "./config/passport.config.js";
import passport from "passport";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.route.js";
import isAuthenticated from "./middlewares/isAuthenticated.middleware.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import memberRoutes from "./routes/member.route.js";
import { projectRoutes } from "./routes/project.route.js";
import { taskRoutes } from "./routes/task.route.js";

export const app = express();
const BASE_PATH = config.BASE_PATH;

// Parse incoming JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure cookie-based sessions
app.use(
  session({
    name: "session",
    keys: [config.SESSION_SECRET],
    maxAge: 24 * 60 * 60 * 1000,
    secure: config.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Enable CORS for frontend origin
app.use(
  cors({
    origin: config.FRONTEND_ORIGIN,
    credentials: true,
  })
);

// Routes
app.get(
  "/",
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    throw new BadRequestException(
      "This is bad request",
      ErrorCodeEnum.AUTH_INVALID_TOKEN
    );
    res.status(HTTPSTATUS.OK).json({
      message: "Hello World",
    });
  })
);

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/user`, isAuthenticated, userRoutes);
app.use(`${BASE_PATH}/workspace`, isAuthenticated, workspaceRoutes);
app.use(`${BASE_PATH}/member`, isAuthenticated, memberRoutes);
app.use(`${BASE_PATH}/project`, isAuthenticated, projectRoutes);
app.use(`${BASE_PATH}/task`, isAuthenticated, taskRoutes);

// Error handling
app.use(errorHandler);
