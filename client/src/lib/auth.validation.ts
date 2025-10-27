import {z} from 'zod';
export const register = z.object({
    username: z.string().min(3, "Full name must be at least 3 characters").trim(),
    email: z.email("Invalid email format").trim(),
    displayName: z.string().min(3, "Display name must be at least 3 characters").trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
  });

export const login= z.object({
    username: z.string().trim(),
    password: z.string(),
});