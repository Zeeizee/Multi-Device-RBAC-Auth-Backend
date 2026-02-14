import mongoose from "mongoose";

export interface IDevice extends mongoose.Document {
    deviceId: string;
    refreshToken: string;
    userId: mongoose.Types.ObjectId;
    IP: string;
    userAgent: string;
    lastActive: Date;

    createdAt?: Date;
}

const deviceSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    refreshToken: {
        type: String,
        required: true,
        select: false
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    IP: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    lastActive: {
        type: Date,
        default: Date.now,
        index: true
    },
   
}, {
    timestamps: true
});

// Index for faster queries
deviceSchema.index({ userId: 1, deviceId: 1 });
deviceSchema.index({ userId: 1, lastActive: -1 });

const DeviceModel = mongoose.model<IDevice>('Device', deviceSchema);

export default DeviceModel;

