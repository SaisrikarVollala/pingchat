import { z } from "zod";


export const registerSchema = z.object({
  username: z.string().min(3).max(20),
  displayName: z.string().min(2).max(50),
  email: z.email(),
  password: z.string().min(6),
});

export const otpSchema = z.object({
  email: z.email(),
  otp: z.string().length(6),
});


export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const AuthPayloadSchema = z.object({
  _id: z.string(),
  username: z.string(),
  displayName: z.string(),
  avatar: z.string(),
  email: z.string(),
});

export type TAuth =z.infer<typeof AuthPayloadSchema>
export type RegisterInput = z.infer<typeof registerSchema>;
export type OtpInput = z.infer<typeof otpSchema>;
