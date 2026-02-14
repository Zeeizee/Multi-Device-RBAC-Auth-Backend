import { Response } from "express";
import { AuthRequest } from "../../shared/middlewares/authMiddleware.ts";
import { logoutCurrentDevice, logoutAllDevices, getUserDevices } from "./device.service.ts";

export const logoutCurrentDeviceController = async (req: AuthRequest, res: Response) => {
    try {
        const deviceId = req.cookies?.deviceId || req.body.deviceId;
        
        if (!deviceId) {
            return res.status(400).json({
                success: false,
                message: "Device ID is required"
            });
        }

        await logoutCurrentDevice(deviceId);

        // Clear cookies for current device
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.clearCookie('deviceId', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return res.status(200).json({
            success: true,
            message: "Logged out from current device successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }
};

export const logoutAllDevicesController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        await logoutAllDevices(req.user._id.toString());

        // Clear cookies
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.clearCookie('deviceId', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        return res.status(200).json({
            success: true,
            message: "Logged out from all devices successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }
};

export const getActiveDevicesController = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        const devices = await getUserDevices(req.user._id.toString());

        return res.status(200).json({
            success: true,
            devices
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: (error as Error).message
        });
    }
};

