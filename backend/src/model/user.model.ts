import { Schema, model} from "mongoose";

export interface IUser {
 username: string;
 displayName: string;
 avatarUrl?: string;
 passwordHash: string;
 email: string;
 createdAt: Date;
 toAuthJSON(): userInfo;
}

type userInfo={
  username: string;
  displayName: string;
  avatarUrl: string;
}

const UserSchema = new Schema<IUser>(
  {
   email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    avatarUrl: { type: String ,default: "" },
    passwordHash: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

UserSchema.methods.toAuthJSON = function (): userInfo {
  return {
    username: this.userName,
    displayName: this.displayName,
    avatarUrl: this.avatarUrl,
  };
}

export const User = model<IUser>("User", UserSchema);
