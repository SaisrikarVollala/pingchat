import {z} from 'zod';
export const registerForm = z.object({
    username: z.string().min(3, "Full name must be at least 3 characters").trim(),
    email: z.email("Invalid email format").trim(),
    displayName: z.string().min(3, "Display name must be at least 3 characters").trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
  });


export const loginForm= z.object({
    username: z.string().trim(),
    password: z.string(),
});

export const CheckAuthResponseSchema = z.object({
  _id: z.string(),
  username: z.string(),
  displayName: z.string(),
  email: z.email(),
  avatar: z.string(),
});

export type TAuth = z.infer<typeof CheckAuthResponseSchema>;
export type user=Omit<TAuth,"email">
export type TRegisterForm = z.infer<typeof registerForm>;
export type TLoginForm = z.infer<typeof loginForm>;