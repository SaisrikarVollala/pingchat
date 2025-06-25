import {z} from 'zod';
export const userShape = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters").trim(),
    email: z.string().email("Invalid email format").trim().toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    profilePic:z.string().optional().default("")
  });
export const loginShape = z.object({
    email: z.string().email("Invalid email format").trim(),
    password: z.string().min(8, "Password must be at least 8 characters").trim()
});
export type TUser = z.infer<typeof userShape>;
export type TformData = Omit<TUser, 'profilePic'>
export type TLoginFormData = Pick<TUser, 'email' | 'password'>; 
// export type FormErrors = Partial<
//   Record<keyof z.infer<typeof userShape>, string[]>
// >;