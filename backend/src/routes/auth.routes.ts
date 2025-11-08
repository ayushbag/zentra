import { Router } from "express";
import passport from "passport";
import { config } from "../config/app.config.js";
import { googleLoginController } from "../controllers/auth.controller.js";

const failedUrl = `${config.FRONTEND_GOOGLE_CALLBACK_URL}?status=failure`;

const authRoutes = Router();

authRoutes.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

authRoutes.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: failedUrl,
  }),
  googleLoginController
);

export default authRoutes;