import { env } from "./env"
import jwt, { JwtPayload }  from "jsonwebtoken"
export interface customeJWTPayload extends JwtPayload {
    userId:string;  
}
export const generateToken=(userId:string):string=>{

    const token=jwt.sign({userId},env.JWT_KEY,{
        expiresIn:"7d"
    })
    return token;
}

