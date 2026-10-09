import { Request, Response } from "express";
import {
  registerSchema,
  loginSchema,
} from "../validation/auth.validation";
import { generateToken } from "../services/authUser";
import { User } from "../model/user.model";
import type { AuthToken } from "../validation/auth.validation";
import bcrypt from "bcryptjs";
import { Env } from "../config/env";

declare global {
  namespace Express {
    interface Request {
      auth: AuthToken;
    }
  }
}


export async function handleRegister(req: Request, res: Response) {
  try {
    const { username, email, password, displayName } = registerSchema.parse(
      req.body
    );

    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: "Username already taken",
      });
    }

    const existingEmail = await User.findOne({ email });

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
      password: passwordHash,
    });

    const token = generateToken({
      _id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      email: user.email,
    });
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
        message: "Invalid username",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    const token = generateToken({
      _id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      email: user.email,
    });
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: Env.NODE_ENV === "production",
      sameSite: Env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
      .status(200)
      .json({
        success: true,
        message: "Login successful",
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
      sameSite: Env.NODE_ENV === "production" ? "none" : "strict",
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
