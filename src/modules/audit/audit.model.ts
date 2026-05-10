import mongoose from "mongoose";

export type AuditAction =
    | "login"
    | "logout"
    | "refresh_token"
    | "password_change";

export interface IAuditLog extends mongoose.Document {
    userId: mongoose.Types.ObjectId;
    action: AuditAction;
    IP: string;
    deviceId?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}

const auditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        action: {
            type: String,
            enum: ["login", "logout", "refresh_token", "password_change"],
            required: true,
            index: true,
        },
        IP: {
            type: String,
            required: true,
        },
        deviceId: {
            type: String,
            index: true,
        },
        userAgent: {
            type: String,
        },
    },
    { timestamps: true }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

const AuditLogModel = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);

export default AuditLogModel;
