import { AuthRequest } from "../../shared/middlewares/authMiddleware.js"
import { Request, Response } from "express"
import { getUserService } from "./user.service.js"
import UserModel from "./user.model.ts"
import { writeAuditLog } from "../audit/audit.service.ts"
export const getUserController=async(req:AuthRequest,res:Response)=>{
    try{
        if(!req.user || !req.user._id){
            return res.status(401).json({success:false,message:"User not authenticated"})
        }
        const user=await getUserService(req.user._id)
        if(!user){
            return res.status(404).json({success:false,message:"User not found"})
        }
        return res.status(200).json({success:true,message:"User fetched successfully",user})
    }catch(error){
        return res.status(500).json({success:false,message:"Internal server error"})
    }
}
export const changePasswordController=async(req:AuthRequest,res:Response)=>{
    try{
        const user=await UserModel.findOne({_id:req?.user?._id}).select('+password')
        if(!user){
            return res.status(404).json({success:false,message:"User not found"})

        }
      
        const isPasswordSame=await user?.comparePassword(req.body.oldPassword)
        if(!isPasswordSame){
            return res.status(400).json({success:false,message:"Old password is incorrect"})
        }
        user.password=req.body.newPassword
        await user.save()

        const IP = req.ip || req.socket.remoteAddress || 'unknown'
        const userAgent = req.get('user-agent') || 'unknown'

        await writeAuditLog({
            userId: user._id.toString(),
            action: "password_change",
            IP,
            deviceId: req.cookies?.deviceId,
            userAgent,
        })

        return res.status(200).json({success:true,message:"Password changed successfully"})
        }
    catch(error){
        console.log(error)
        return res.status(500).json({success:false,message:"Internal server error"})
    }
}
