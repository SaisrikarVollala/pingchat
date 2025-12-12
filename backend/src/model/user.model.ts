import { Schema, model, Document} from "mongoose";
import { TAuth } from "../validation/auth.validation";

export interface IUser{
 username: string;
 displayName: string;
 avatar: string;
 passwordHash: string;
 email: string;
 createdAt: Date;
 updatedAt: Date;
 toJson():TAuth;
}

const userSchema = new Schema<IUser>(
  {
   email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    avatar: { type: String ,default: "" },
    passwordHash: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);


userSchema.methods.toJson = function (): TAuth {
  return {
    username: this.username,
    _id: this._id.toString(),
    displayName: this.displayName,
    avatar: this.avatar,
    email: this.email
  };
}

export const User = model<IUser>("User", userSchema);
