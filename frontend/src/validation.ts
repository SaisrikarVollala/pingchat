import {z} from 'zod';
export const userShape=z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email format"),
  profilePic: z.string()
});
export type TUser = z.infer<typeof userShape>;
export type TformData = Omit<TUser, 'profilePic'> & { password: string }