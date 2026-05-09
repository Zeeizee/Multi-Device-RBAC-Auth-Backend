import z from "zod"

export const changePasswordValidate=z.object({
    oldPassword:z.string().min(6),
    newPassword:z.string().min(6),
})