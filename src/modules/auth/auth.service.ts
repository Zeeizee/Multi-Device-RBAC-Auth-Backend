import { getAccessToken, getRefreshToken, verifyRefreshToken } from "../../shared/utils/jwt.ts"
import UserModel from "../user/user.model.ts"
import { createDeviceSession, updateDeviceSession, getDeviceByDeviceIdAndToken, logoutCurrentDevice, logoutAllDevices } from "../device/device.service.ts"
import { v4 as uuidv4 } from 'uuid'

export const signupUserService = async (name: string, email: string, password: string, role: "admin" | "manager" | "user" = "user") => {
    const isUserExists = await UserModel.findOne({ email })
    if (isUserExists) {
        throw new Error("User already exists")
    }
    const body = { name, email, password, role }
    const user = await UserModel.create(body)
    return user
}


export const loginUserService = async (
    email: string,
    password: string,
    IP: string,
    userAgent: string
) => {
    const user = await UserModel.findOne({ email }).select('+password')
    if (!user) {
        throw new Error("User not found")
    }
    const isPasswordCorrect = await user.comparePassword(password)
    if (!isPasswordCorrect) {
        throw new Error("Invalid password")
    }
    const userData = { ...user.toObject(), password: undefined }
    const deviceId = uuidv4()
    const accessToken = getAccessToken({ _id: userData._id.toString(), role: userData.role, name: userData.name, deviceId },)
    const refreshToken = getRefreshToken({ _id: userData._id.toString(), role: userData.role, name: userData.name, deviceId })


    await createDeviceSession(
        userData._id.toString(),
        deviceId,
        refreshToken,
        IP,
        userAgent,

    )

    return { user: userData, accessToken, deviceId, refreshToken }
}

export const refreshTokenService = async (refreshToken: string, deviceId: string) => {
    try {
        const decoded = verifyRefreshToken(refreshToken)
        const user = await UserModel.findById(decoded._id.toString())
        if (!user) {
            throw new Error("User not found")
        }
        const device = await getDeviceByDeviceIdAndToken(deviceId, refreshToken)
        if (!device) {

            await logoutAllDevices(decoded._id.toString())
            throw new Error("Security alert: Invalid device session. You have been logged out from all devices for security reasons.")
        }
        const userData = { ...user.toObject(), password: undefined }

        const newAccessToken = getAccessToken({ _id: userData._id.toString(), role: userData.role, name: userData.name, deviceId })
        const newRefreshToken = getRefreshToken({ _id: userData._id.toString(), role: userData.role, name: userData.name, deviceId })


        await updateDeviceSession(deviceId, newRefreshToken)

        return { accessToken: newAccessToken, refreshToken: newRefreshToken }
    } catch (error) {
        if ((error as Error).message.includes("Security alert")) {
            throw error
        }
        throw new Error("Invalid or expired refresh token")
    }
}

export const logoutCurrentDeviceService = async (deviceId: string) => {
    await logoutCurrentDevice(deviceId)
    return { message: "Logged out from current device successfully" }
}

export const logoutAllDevicesService = async (userId: string) => {
    await logoutAllDevices(userId)
    return { message: "Logged out from all devices successfully" }
}
