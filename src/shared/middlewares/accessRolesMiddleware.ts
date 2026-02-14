import { NextFunction, Response } from "express"
import { AuthRequest } from "./authMiddleware.js"

export const accessRolesMiddleware=(roles:string[])=>{
    return(req:AuthRequest,res:Response,next:NextFunction)=>{
        try {
            // Check if user is authenticated
            if(!req.user){
                return res.status(401).json({
                    success:false,
                    message:"Authentication required"
                })
            }

            // Check if user has required role
            if(!roles.includes(req.user.role)){
                return res.status(403).json({
                    success:false,
                    message:"You are not authorized to access this resource"
                })
            }
            
            next()
        } catch (error) {
            return res.status(500).json({
                success:false,
                message:"Internal server error",
                error: (error as Error).message
            })
        }
    }
}