import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().min(3).max(20),
  displayName: z.string().min(2).max(50),
  email: z.email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const AuthTokenSchema = z.object({
  _id: z.string(),
  username: z.string(),
  displayName: z.string(),
  avatarUrl: z.string().optional(),
  email: z.string().email(),
});

export type AuthToken = z.infer<typeof AuthTokenSchema>;
export type TRegistration = z.infer<typeof registerSchema>;

