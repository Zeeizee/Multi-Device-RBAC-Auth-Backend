import { Request, Response } from "express";
import { loginUserService, signupUserService, refreshTokenService, logoutCurrentDeviceService, logoutAllDevicesService } from "./auth.service.ts";
import { AuthRequest } from "../../shared/middlewares/authMiddleware.ts";

export const signupUserController=async(req:Request,res:Response)=>{
   
    const {name,email,password,role}=req.body
    if(!name || !email || !password){
        return res.status(400).json({message:"All fields are required"})
    }
    await signupUserService(name,email,password,role)
    return res.status(200).json({message:"User registered successfully",})

}
export const loginUserController=async(req:Request,res:Response)=>{
    try {
        const {email,password}=req.body
        const IP = req.ip || req.socket.remoteAddress || 'unknown'
        const userAgent = req.get('user-agent') || 'unknown'
        
        const result=await loginUserService(email,password,IP,userAgent)
        
     
        res.cookie('refreshToken', result.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })
        
      
        res.cookie('deviceId', result.deviceId, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })
        
        
        return res.status(200).json({
            success: true,
            message: "User logged in successfully",
            user: result.user,
            accessToken: result.accessToken,
            deviceId: result.deviceId 
        })
    } catch (error) {
        return res.status(401).json({success:false,message:(error as Error).message})
    }
}

export const refreshTokenController=async(req:Request,res:Response)=>{
    try {
    
        const refreshToken = req.cookies?.refreshToken
        const deviceId = req.cookies?.deviceId
        
        if(!refreshToken || !deviceId){
            return res.status(401).json({success:false,message:"Refresh token or device ID not found"})
        }
        
        const tokens=await refreshTokenService(refreshToken, deviceId)
        
        
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })
        
        // Return only new accessToken in response body
        return res.status(200).json({
            success: true,
            message: "Token refreshed successfully",
            accessToken: tokens.accessToken
        })
    } catch (error) {
       
        if((error as Error).message.includes("Security alert")){
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })
            res.clearCookie('deviceId', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict'
            })
            return res.status(401).json({
                success: false,
                message: (error as Error).message,
                logoutRequired: true
            })
        }
        return res.status(401).json({success:false,message:(error as Error).message})
    }
}

export const logoutController=async(req:AuthRequest,res:Response)=>{
    try {
        const deviceId = req.cookies?.deviceId
        
      
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        })
        res.clearCookie('deviceId', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        })
        
   
        if(deviceId){
            await logoutCurrentDeviceService(deviceId)
        }
        
        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        })
    } catch (error) {
        return res.status(500).json({success:false,message:(error as Error).message})
    }
}
