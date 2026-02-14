import { AuthRequest } from "../../shared/middlewares/authMiddleware.js"
import { Response } from "express"
import { getUserService } from "./user.service.js"
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
        console.log(error)
        return res.status(500).json({success:false,message:"Internal server error"})
    }
}
