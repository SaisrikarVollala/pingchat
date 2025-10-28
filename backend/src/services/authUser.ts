import jwt, { JwtPayload }  from "jsonwebtoken"
import { Env } from "../config/env";
import { TAuth } from "../model/user.model";

export interface IDecode extends JwtPayload {
    payload:TAuth
}
export const generateToken=(payload:TAuth):string=>{
    const token=jwt.sign(payload,Env.JWT_SECRET,{
        expiresIn:"7d",
        issuer:"PingChat"
    })
    return token;
}

