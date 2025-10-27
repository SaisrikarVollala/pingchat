import jwt from 'jsonwebtoken';
import { User } from '../model/user.model';
import { Request, Response, NextFunction } from 'express';
import { Env } from '../config/env';
import type { IDecode } from '../services/authUser';




export const authenticateToken = async (
  req: Request,
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

    const decode = jwt.verify(token, Env.JWT_SECRET) as IDecode 
    
    const user = await User.findById(decode.id);
    
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized Access: User not found'
      });
      return;
    }

    req.authInfo = user.toAuthJSON();
    next();
    
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized Access: Invalid token'
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};