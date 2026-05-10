import { Router } from "express";
import { verifyAuth } from "../../shared/middlewares/authMiddleware.ts";
import { accessRolesMiddleware } from "../../shared/middlewares/accessRolesMiddleware.ts";
import { USER_ROLES } from "../../shared/constants/userRoles.ts";
import { getAllAuditController, getMyAuditController } from "./audit.controller.ts";

const auditRouter = Router();

// Authenticated user can view their own audit history
auditRouter.get("/me", verifyAuth(), getMyAuditController);

// Admin only: view all audit logs with optional filters
auditRouter.get(
    "/",
    verifyAuth(),
    accessRolesMiddleware([USER_ROLES.ADMIN]),
    getAllAuditController
);

export default auditRouter;
