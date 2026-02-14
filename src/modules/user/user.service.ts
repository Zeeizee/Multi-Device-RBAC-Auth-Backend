import UserModel from "./user.model.ts"

export const getUserService=async(id:string)=>{
    try{
        const user=await UserModel.findById(id)
        return user
    }catch(error){
        console.log(error)
        throw error
    }
}