import jwt from 'jsonwebtoken';
import { customeJWTPayload } from '../services/auth';
import User from '../models/user.model';
import { Request, Response, NextFunction } from 'express';
import { env } from '../services/env';
import { TAuth } from '../services/validation.user';



export interface AuthenticatedRequest extends Request {
  cookies: {
    jwt?: string;
  };
  userInfo?: TAuth;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
)=> {
  try {
    const token = req.cookies.jwt;
    
    if (!token) {
       res.status(401).json({
        success: false,
        message: 'Unauthorized Access: No token provided'
      });
      return;
    }

    const decode = jwt.verify(token, env.JWT_KEY) as customeJWTPayload;
    
    const user = await User.findById(decode.userId);
    
    if (!user) {
       res.status(401).json({
        success: false,
        message: 'Unauthorized Access: User not found'
      });
      return;
    }

    req.userInfo  = user.toAuthJSON();
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
       res.status(401).json({
        success: false,
        message: 'Unauthorized Access: Invalid token'
      })
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};