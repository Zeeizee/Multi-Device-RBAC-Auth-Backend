import { Response } from "express";
import { AuthRequest } from "../../shared/middlewares/authMiddleware.ts";
import { getAllAuditLogs, getUserAuditHistory } from "./audit.service.ts";
import { AuditAction } from "./audit.model.ts";

const ALLOWED_ACTIONS: AuditAction[] = [
    "login",
    "logout",
    "refresh_token",
    "password_change",
];

export const getMyAuditController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;

        const result = await getUserAuditHistory(req.user._id, { page, limit });

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: (error as Error).message,
        });
    }
};

export const getAllAuditController = async (req: AuthRequest, res: Response) => {
    try {
        const { action, userId, from, to } = req.query;
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;

        let parsedAction: AuditAction | undefined;
        if (typeof action === "string") {
            if (!ALLOWED_ACTIONS.includes(action as AuditAction)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid action filter. Allowed: ${ALLOWED_ACTIONS.join(", ")}`,
                });
            }
            parsedAction = action as AuditAction;
        }

        const parsedFrom = typeof from === "string" ? new Date(from) : undefined;
        const parsedTo = typeof to === "string" ? new Date(to) : undefined;

        if (parsedFrom && isNaN(parsedFrom.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid 'from' date",
            });
        }
        if (parsedTo && isNaN(parsedTo.getTime())) {
            return res.status(400).json({
                success: false,
                message: "Invalid 'to' date",
            });
        }

        const result = await getAllAuditLogs({
            action: parsedAction,
            userId: typeof userId === "string" ? userId : undefined,
            from: parsedFrom,
            to: parsedTo,
            page,
            limit,
        });

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: (error as Error).message,
        });
    }
};
