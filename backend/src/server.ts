import "dotenv/config"
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import session from "cookie-session";
import { config } from "./config/app.config.js";

export const app = express();
const BASE_PATH = config.BASE_PATH;

// Parse incoming JSON and URL-encoded payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

// Configure cookie-based sessions
app.use(
    session({
        name: "session",
        keys: [config.SESSION_SECRET],
        maxAge: 24 * 60 * 60 * 1000,
        secure: config.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax"
    })
)

// Enable CORS for frontend origin
app.use(
    cors({
        origin: config.FRONTEND_ORIGIN,
        credentials: true
    })
)

// Routes
app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
        message: "Hello World"
    })
});