import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { hashPassword } from "../../shared/utils/auth.ts";

export interface IUser extends mongoose.Document{
    name:string,
    email:string,
    password:string,
    role:"admin"|"manager"|"user",
    comparePassword:(password:string)=>Promise<boolean>
   

}

const userSchema=new mongoose.Schema({
    name:{type:String,required:true,trim:true,index:true},
    email:{type:String,required:true,unique:true,trim:true,index:true,lowercase:true},
    password:{type:String,required:true,select:false},
    role:{type:String,enum:["admin","manager","user"],default:"user"},
    
},
{timestamps:true}



);
userSchema.pre('save',async function(next){
   if(!this.isModified('password'))return 
   this.password=await hashPassword(this.password)
   
})

userSchema.methods.comparePassword=async function(password:string){
    return await bcrypt.compare(password,this.password)
}

userSchema.index({email:'text',name:'text'})

const UserModel=mongoose.model<IUser>('User',userSchema)

export default  UserModel