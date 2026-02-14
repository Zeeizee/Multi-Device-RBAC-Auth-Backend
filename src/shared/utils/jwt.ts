import config from "../../dotenvConfig.js";
import { IUser } from "../../modules/user/user.model.js";
import jwt, { SignOptions } from 'jsonwebtoken'

interface ITokenPayload{
  _id:string,
  role:string,
  name:string,
}
export const getAccessToken = (user: ITokenPayload, ) => {
  const payload = { 
    _id: user._id, 
    role: user.role, 
    name: user.name,
   
  }
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, { expiresIn: '15m' }) 
}

export const getRefreshToken=(user:ITokenPayload)=>{
  const payload={_id:user._id,role:user.role,name:user.name}
  return jwt.sign(payload,config.JWT_REFRESH_SECRET,{expiresIn:'7d'})
}

export const verifyAccessToken=(token:string)=>{
  return jwt.verify(token,config.JWT_ACCESS_SECRET)
}

export const verifyRefreshToken=(token:string)=>{
  return jwt.verify(token,config.JWT_REFRESH_SECRET) as ITokenPayload
}
