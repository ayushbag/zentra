import { Router } from "express";
import { joinWorkspaceController } from "../controllers/member.controller.js";

const memberRoutes = Router();

memberRoutes.get("/workspace/:inviteCode/join", joinWorkspaceController);

export default memberRoutes;