import  { Request, Response } from "express";
import { registerSchema, otpSchema,loginSchema } from "../validation/auth.validation";
import redisClient  from "../config/redisClient";
import { generateToken } from "../services/authUser";
import { sendMail } from "../utils/nodemailer";
import { TAuth, User } from "../model/user.model";
import bcrypt from "bcryptjs";
import { Env } from "../config/env";


declare global {
  namespace Express {
    interface Request {
      auth:TAuth
    }
  }
}



function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


export async function register(req: Request, res: Response) {
  try {
    const { username, email, password, displayName } = registerSchema.parse(req.body);

    const existing = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const otp = generateOtp();
    const passwordHash = await bcrypt.hash(password, 10); 

    await redisClient.setEx(
      `otp:${email}`,
      300,
      JSON.stringify({
        otp,
        userData: { username, email, displayName, passwordHash } 
      })
    );

    await sendMail(email, otp);

    return res.status(200).json({ message: "OTP sent to email" });
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}



export async function verifyOtp(req: Request, res: Response) {
  try {
    const { email, otp } = otpSchema.parse(req.body);

    const recordStr = await redisClient.get(`otp:${email}`);
    if (!recordStr) return res.status(400).json({ message: "Invalid or expired OTP" });

    const { otp: savedOtp, userData } = JSON.parse(recordStr);
    if (savedOtp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    const { username, displayName, passwordHash } = userData;

    const user = await User.create({
      username,
      email,
      displayName,
      passwordHash,        
    });

    await redisClient.del(`otp:${email}`);

    const token = generateToken(user.toJson());

    return res
      .status(201)
      .cookie("jwt", token, {
        httpOnly: true,
        secure: Env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ message: "User created successfully" });

  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
}


export async function handleLogin(req: Request, res: Response) {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ message: "Invalid username or password" }); 
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid)
        return res.status(400).json({ message: "Invalid username or password" });

    const token=generateToken(user.toJson());

    res.cookie("jwt",token,{
      httpOnly:true,
      secure:Env.NODE_ENV==="production",
        maxAge:7*24*60*60*1000, 
    }).json({ message: "Login successful",token});
    } catch (err: any) {
    res.status(400).json({ error: err.message });
    }
}

export async function handleLogout(req: Request, res: Response) {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: Env.NODE_ENV === "production",
    }).json({ message: "Logout successful" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  } 
}
export async function checkAuth(req:Request, res: Response) {
  try {
    res.status(200).json(req.auth);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  } 
}
