import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import authRoutes from './modules/auth/auth.routes.ts'
import userRoutes from './modules/user/user.routes.ts'
import deviceRoutes from './modules/device/device.routes.ts'
import auditRoutes from './modules/audit/audit.routes.ts'
import { rateLimiterMiddleware } from './shared/middlewares/rateLimit.ts'




const app=express()
app.use(express.json())
app.use(cookieParser())


app.set('trust proxy', 1)

app.use(cors({
    credentials: true, 
    origin: process.env.FRONTEND_URL || 'http://localhost:3000' 
}))

app.use(rateLimiterMiddleware())



app.get('/',(_,res)=>{
    res.send("Welcome to api server")
})
app.use('/api/auth',authRoutes)
app.use('/api/user',userRoutes)
app.use('/api/device',deviceRoutes)
app.use('/api/audit',auditRoutes)

export default app