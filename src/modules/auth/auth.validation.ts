import {z} from "zod"

export const signupSchema = z.object({
    name: z.string().min(6),
    email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,{message:"Invalid email address"}),
    password: z.string().min(6),
    role: z.enum(["admin","manager","user"]),
})

export const loginSchema = z.object({
    email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,{message:"Invalid email address"}),
    password: z.string().min(6).refine((password)=>{
        return password.length >= 6
    },{message:"Password must be at least 6 characters long"}),
})

export const refreshTokenSchema = z.object({
    refreshToken: z.string().min(1)
})