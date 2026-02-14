import { NextFunction, Request, RequestHandler, Response } from "express"
import { ZodError, ZodSchema } from "zod"

export const validate=(schema:any)=>{
    return (req:Request,res:Response,next:NextFunction)=>{
        try {
            schema.parse(req.body)
            next()
        } catch (error:unknown) {
            if (error instanceof ZodError) {
                const errorMessages = error.issues.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message
                }))
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: errorMessages
                })
            }
            return res.status(400).json({
                success: false,
                message: "Validation error",
                error: (error as Error).message
            })
        }
    }
}