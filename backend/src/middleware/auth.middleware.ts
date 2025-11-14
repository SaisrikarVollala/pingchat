import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../model/user.model";
import { verifyToken } from "../services/authUser"; 
import { ZodError } from "zod";

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.jwt;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access: No token provided",
      });
    }

    const decoded = verifyToken(token);

    const userExists = await User.exists({ _id: decoded._id });

    if (!userExists) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access: User not found",
      });
    }

    req.auth = decoded;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "Token has expired",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized Access: Invalid token",
      });
    }

    if (error instanceof ZodError) {
      console.error("hello")
      return res.status(401).json({
        success: false,
        error: error.issues.map((e) => e.message),
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error during authentication",
    }); 
  }
}; 