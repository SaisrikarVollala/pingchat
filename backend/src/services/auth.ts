import { env } from "./env"
import jwt  from "jsonwebtoken"
import { Types } from "mongoose"

export const generateToken=(userId:Types.ObjectId):string=>{
    const token=jwt.sign({userId},env.JWT_KEY,{
        expiresIn:"7d"
    })
    return token;
}

