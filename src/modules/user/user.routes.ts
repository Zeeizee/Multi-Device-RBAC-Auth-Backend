import { Router } from "express"
import { verifyAuth } from "../../shared/middlewares/authMiddleware.js"
import { getUserController } from "./user.controller.js"
import { accessRolesMiddleware } from "../../shared/middlewares/accessRolesMiddleware.js"
import { USER_ROLES } from "../../shared/constants/userRoles.ts"


const app=Router()
app.get('/',verifyAuth(),accessRolesMiddleware([USER_ROLES.ADMIN,USER_ROLES.MANAGER,USER_ROLES.USER]),getUserController)

export default app