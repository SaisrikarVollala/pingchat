import jwt from 'jsonwebtoken';
import { IAuthenticate, User } from '../model/user.model';
import { Request, Response, NextFunction } from 'express';
import { Env } from '../config/env';






export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
)=> {
  try {
    const token = req.cookies.jwt;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized Access: No token provided'
      });
    }

    const decode = jwt.verify(token, Env.JWT_SECRET) as IAuthenticate
    console.log(decode);

    const user = await User.exists({ _id: decode.id });
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized Access: User not found'
      });
    }

    req.auth = decode;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
     return res.status(401).json({
        success: false,
        message: 'Unauthorized Access: Invalid token'
      });
    }

   return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};