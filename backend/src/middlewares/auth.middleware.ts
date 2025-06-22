import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { Request,Response,NextFunction } from 'express';
export const authenticateToken=(req:Request,res:Response,next:NextFunction)=>{
    try {
        const token=req.cookies.jwt;
        if(!token){
            
        }

    } catch (error) {
        
    }
}