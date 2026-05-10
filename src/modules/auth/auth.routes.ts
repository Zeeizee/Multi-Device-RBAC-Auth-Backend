import { Router } from 'express'
import { signupUserController,loginUserController,logoutAllDevicesController,refreshTokenController,logoutController } from './auth.controller.ts'
import { loginSchema, signupSchema } from './auth.validation.ts'
import { validate } from '../../shared/middlewares/validateMiddleware.ts'
import { verifyAuth } from '../../shared/middlewares/authMiddleware.ts'
import { rateLimiterMiddleware } from '../../shared/middlewares/rateLimit.ts'
const app=Router()

app.get('/',(req,res)=>{
    res.send("Auth routes")
})
app.post('/signup',validate(signupSchema),signupUserController)
app.post('/login',validate(loginSchema),loginUserController)
app.post('/refresh',refreshTokenController)
app.post('/logout',logoutController)
app.post('/logout-all',logoutAllDevicesController)


export default app