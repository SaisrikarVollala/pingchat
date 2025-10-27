import jwt, { JwtPayload }  from "jsonwebtoken"
import { Env } from "../config/env";

export interface IDecode extends JwtPayload {
    username: string;
    id: string;
}
export const generateToken=(payload:{
   username: string;
   id: string;
 }):string=>{
    const token=jwt.sign(payload,Env.JWT_SECRET,{
        expiresIn:"7d",
        issuer:"PingChat"
    })
    return token;
}

