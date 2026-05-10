import AuditLogModel, { AuditAction } from "./audit.model.ts";

interface WriteAuditLogParams {
    userId: string;
    action: AuditAction;
    IP: string;
    deviceId?: string;
    userAgent?: string;
}

export const writeAuditLog = async (params: WriteAuditLogParams): Promise<void> => {
    try {
        await AuditLogModel.create(params);
    } catch (error) {
        // Audit failure must NEVER break the main request flow
        console.error("Audit log write failed:", (error as Error).message);
    }
};

interface PaginationParams {
    page?: number;
    limit?: number;
}

export const getUserAuditHistory = async (
    userId: string,
    { page = 1, limit = 50 }: PaginationParams = {}
) => {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);

    const [logs, total] = await Promise.all([
        AuditLogModel.find({ userId })
            .sort({ createdAt: -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit)
            .lean(),
        AuditLogModel.countDocuments({ userId }),
    ]);

    return {
        logs,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
    };
};

interface AdminQueryFilters extends PaginationParams {
    action?: AuditAction;
    userId?: string;
    from?: Date;
    to?: Date;
}

export const getAllAuditLogs = async (filters: AdminQueryFilters = {}) => {
    const { action, userId, from, to, page = 1, limit = 50 } = filters;
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const safePage = Math.max(page, 1);

    const query: Record<string, unknown> = {};
    if (action) query.action = action;
    if (userId) query.userId = userId;
    if (from || to) {
        const range: Record<string, Date> = {};
        if (from) range.$gte = from;
        if (to) range.$lte = to;
        query.createdAt = range;
    }

    const [logs, total] = await Promise.all([
        AuditLogModel.find(query)
            .sort({ createdAt: -1 })
            .skip((safePage - 1) * safeLimit)
            .limit(safeLimit)
            .populate("userId", "name email role")
            .lean(),
        AuditLogModel.countDocuments(query),
    ]);

    return {
        logs,
        total,
        page: safePage,
        limit: safeLimit,
        totalPages: Math.ceil(total / safeLimit),
    };
};
