import { Request, Response } from "express";
import { registerSchema, otpSchema } from "../validation/auth.validation";
import { sendMail } from "../utils/nodemailer";
import { User } from "../model/user.model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Env } from "../config/env";


const otpStore = new Map<string, { otp: string, data: any, expiresAt: number }>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function register(req: Request, res: Response) {
  try {
    const data = registerSchema.parse(req.body);

    const existing = await User.findOne({ $or: [{ email: data.email }, { username: data.username }] });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const otp = generateOtp();
    otpStore.set(data.email, { otp, data, expiresAt: Date.now() + 5 * 60 * 1000 });

    await sendMail(data.email, otp);
    res.json({ message: "OTP sent to email" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { email, otp } = otpSchema.parse(req.body);
    const record = otpStore.get(email);

    if (!record || record.otp !== otp || Date.now() > record.expiresAt)
      return res.status(400).json({ message: "Invalid or expired OTP" });

    const hashedPassword = await bcrypt.hash(record.data.password, 10);
    const user = new User({ ...record.data, passwordHash: hashedPassword });
    await user.save();

    otpStore.delete(email);

    const token = jwt.sign({ userId: user._id }, Env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "User created successfully", token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
