import { profile } from 'console';
import {z} from 'zod';


export const userShape = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters").trim(),
    email: z.string().email("Invalid email format").trim().toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    profilePic:z.string().default("")
  });

export const userProfileShape=z.object({
  email:z.string().email("Invalid Email"),
  password:z.string()
})

export const updateUserShape = z.object({
  profilePic: z.string()
})

export interface IUser {
  email: string;
  fullName: string;
  password: string;
  profilePic: string;
  createdAt: Date;
  updatedAt: Date;
  toAuthJSON(): TAuth;
}

export type TAuth={
  id:string;
  email:string;
  fullName:string;
  profilePic:string;
  createdAt:string;
  updatedAt:string;
}






