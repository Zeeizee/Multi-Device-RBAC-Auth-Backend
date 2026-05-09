import { Router } from "express"
import { verifyAuth } from "../../shared/middlewares/authMiddleware.js"
import { changePasswordController, getUserController } from "./user.controller.js"
import { accessRolesMiddleware } from "../../shared/middlewares/accessRolesMiddleware.js"
import { USER_ROLES } from "../../shared/constants/userRoles.ts"
import { changePasswordValidate } from "./user.validation.ts"
import { validate } from "../../shared/middlewares/validateMiddleware.ts"


const app=Router()
app.get('/',verifyAuth(),accessRolesMiddleware([USER_ROLES.ADMIN,USER_ROLES.MANAGER,USER_ROLES.USER]),getUserController)
app.put('/change-password',verifyAuth(),accessRolesMiddleware([USER_ROLES.ADMIN,USER_ROLES.MANAGER,USER_ROLES.USER]),validate(changePasswordValidate),changePasswordController)
export default app