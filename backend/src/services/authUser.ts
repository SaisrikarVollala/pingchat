import jwt, { JwtPayload }  from "jsonwebtoken"
import { Env } from "../config/env";
import type { IAuthenticate } from "../model/user.model";


export const generateToken=(payload:IAuthenticate):string=>{
    const token=jwt.sign(payload,Env.JWT_SECRET,{
        expiresIn:"7d",
        issuer:"PingChat"
    })
    return token;
}

