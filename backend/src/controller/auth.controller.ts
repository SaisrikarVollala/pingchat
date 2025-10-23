import { Request, Response } from "express";
import { registerSchema, otpSchema,loginSchema } from "../validation/auth.validation";
import redisClient  from "../config/redisClient";
import { generateToken } from "../services/authUser";
import { sendMail } from "../utils/nodemailer";
import { User } from "../model/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Env } from "../config/env";



function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


export async function register(req: Request, res: Response) {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }],
    });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const otp = generateOtp();

    await redisClient.setEx(
      `otp:${data.email}`,
      300, 
      JSON.stringify({ otp, data })
    );

    await sendMail(data.email, otp);
    res.json({ message: "OTP sent to email" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}


export async function verifyOtp(req: Request, res: Response) {
  try {
    const { email, otp } = otpSchema.parse(req.body);

    const recordStr = await redisClient.get(`otp:${email}`);
    if (!recordStr)

    return res.status(400).json({ message: "Invalid or expired OTP" });

    const record = JSON.parse(recordStr);
    if (record.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    const user=await User.create({ ...record.data });


    await redisClient.del(`otp:${email}`);

    const token=generateToken(user.toAuthJSON());

    res.json({ message: "User created successfully",}).status(201).cookie("jwt",token,{
      httpOnly:true,
      secure:Env.NODE_ENV==="production",
      maxAge:7*24*60*60*1000, 
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
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

    const token=generateToken(user.toAuthJSON());

    res.json({ message: "Login successful" }).cookie("jwt",token,{
      httpOnly:true,
      secure:Env.NODE_ENV==="production",
        maxAge:7*24*60*60*1000, 
    });
    } catch (err: any) {
    res.status(400).json({ error: err.message });
    }
}