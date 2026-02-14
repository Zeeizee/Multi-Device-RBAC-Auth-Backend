import DeviceModel from "./device.model.ts";
import { DeviceInfo } from "./device.types.ts";

export const createDeviceSession = async (
    userId: string,
    deviceId: string,
    refreshToken: string,
    IP: string,
    userAgent: string,

) => {
    const device = await DeviceModel.create({
        deviceId,
        refreshToken,
        userId,
        IP,
        userAgent,
        lastActive: new Date(),
     
    });
    return device;
};

export const updateDeviceSession = async (
    deviceId: string,
    refreshToken: string,
) => {
    const updateData: any = {
        refreshToken,
        lastActive: new Date()
    };
   
    const device = await DeviceModel.findOneAndUpdate(
        { deviceId },
        updateData,
        { new: true }
    );
    return device;
};

export const getDeviceByDeviceId = async (deviceId: string) => {
    return await DeviceModel.findOne({ deviceId }).select('+refreshToken');
};

export const logoutCurrentDevice = async (deviceId: string) => {
    const device = await DeviceModel.findOneAndDelete({ deviceId });
    return device;
};

export const logoutAllDevices = async (userId: string) => {
    const result = await DeviceModel.deleteMany({ userId });
    return result;
};

export const getUserDevices = async (userId: string): Promise<DeviceInfo[]> => {
    const devices = await DeviceModel.find({ userId })
        .select('-refreshToken')
        .sort({ lastActive: -1 });
    
    return devices.map(device => ({
        deviceId: device.deviceId,
        IP: device.IP,
        userAgent: device.userAgent,
        lastActive: device.lastActive,
        createdAt: device.createdAt
    }));
};

export const getDeviceByDeviceIdAndToken = async (
    deviceId: string,
    refreshToken: string
) => {
    return await DeviceModel.findOne({ deviceId, refreshToken }).select('+refreshToken');
};

