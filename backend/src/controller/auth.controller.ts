import { Request, Response } from "express";
import {
  registerSchema,
  otpSchema,
  loginSchema,
} from "../validation/auth.validation";
import redisClient from "../config/redisClient";
import { generateToken } from "../services/authUser";
import { User } from "../model/user.model";
import type { TAuth } from "../validation/auth.validation";
import bcrypt from "bcryptjs";
import { Env } from "../config/env";

declare global {
  namespace Express {
    interface Request {
      auth: TAuth;
    }
  }
}

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function handleRegister(req: Request, res: Response) {
  try {
    const { username, email, password, displayName } = registerSchema.parse(
      req.body
    );

    const existingUsername = await User.findOne({ username }).lean();
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    const existingEmail = await User.findOne({ email }).lean();
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      displayName,
      passwordHash,
    });
    
    const token = generateToken(user.toJson());

    return res
      .status(201)
      .cookie("jwt", token, {
        httpOnly: true,
        secure: Env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: Env.NODE_ENV === "production" ? "none" : "strict",
      })
      .json({
        success: true,
        message: "Account created successfully",
      });

    
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message || "Registration failed",
    });
  }
}

export async function handleLogin(req: Request, res: Response) {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const payload = user.toJson();
    const token = generateToken(payload);
    console.log("Generated JWT token for user:", username);
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: Env.NODE_ENV === "production",
      sameSite: Env.NODE_ENV==="production"?"none":"strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    console.log("JWT cookie set for user:", username);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: payload,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
}

export async function handleLogout(req: Request, res: Response) {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: Env.NODE_ENV === "production",
      sameSite:Env.NODE_ENV==="production"?"none":"strict",
    });
    console.log("JWT cookie cleared");
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: "Logout failed",
    });
  }
}

export async function checkAuth(req: Request, res: Response) {
  try {
    return res.status(200).json({
      success: true,
      authPayload: req.auth,
    });
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: "Authentication check failed",
    });
  }
}
