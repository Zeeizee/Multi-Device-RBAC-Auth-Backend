import { NextFunction, Request, Response } from "express"
import { verifyAccessToken } from "../utils/jwt.js"
import { getDeviceByDeviceId } from "../../modules/device/device.service.ts"

interface ITokenPayload {
    _id: string;
    role: string;
    name: string;
    deviceId: string;
}

export interface AuthRequest extends Request {
    user?: ITokenPayload
}

export const verifyAuth=()=>{
    return async (req:AuthRequest,res:Response,next:NextFunction )=>{
        try {
            const token=req.headers.authorization
            if(!token){
                return res.status(401).json({success:false,message:'Unauthorized'})
            }
            if(!token.startsWith('Bearer '))
            {
                return res.status(401).json({success:false,message:'Unauthorized'})
            }
           
            const decoded= verifyAccessToken(token?.split(' ')[1] || '') as ITokenPayload
           
            if(!decoded){
            return res.status(401).json({success:false,message:'Unauthorized'})
           }
         
           const deviceId = req.cookies?.deviceId
           if(!deviceId || deviceId !== decoded.deviceId){
               // No deviceId means session was cleared (logout) - token invalidated immediately
               return res.status(401).json({
                   success: false,
                   message: 'Session expired. Please login again'
               })
           }
           
           // Verify device session exists and belongs to the user
           const device = await getDeviceByDeviceId(deviceId)
           if(!device || device.userId.toString() !== decoded._id.toString()){
               // Device session doesn't exist (logout) or doesn't match user - token invalidated immediately
               return res.status(401).json({
                   success: false,
                   message: 'Session expired. Please login again'
               })
           }          
           req.user=decoded
           next()
            
        } catch (error) {
            return res.status(401).json({success:false,message:'Invalid or expired token'})
        }
    }
}   
