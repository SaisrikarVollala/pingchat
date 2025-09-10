// models/User.ts
import { Schema, model} from "mongoose";

export interface IUser {
  clerkUserId: string;   
  username: string;     
  avatarUrl?: string;    
  bio?: string;          
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    clerkUserId: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    avatarUrl: { type: String },
    bio: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export const User = model<IUser>("User", UserSchema);
