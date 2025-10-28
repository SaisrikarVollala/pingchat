import { Schema, model, Document} from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
 username: string;
 displayName: string;
 profile: string;
 passwordHash: string;
 email: string;
 createdAt: Date;
 updatedAt: Date;
 toJson():TAuth
 comparePassword(candidatePassword: string): Promise<boolean>;
}

export type TAuth = {
  username: string;
  displayName: string;
  id: string;
  profile: string;
}

const userSchema = new Schema<IUser>(
  {
   email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    profile: { type: String ,default: "" },
    passwordHash: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);




userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJson = function ():TAuth{
  return {
    username: this.username,
    id: this._id.toString(),
    profile: this.profile,
    displayName: this.displayName,
  };
}

export const User = model<IUser>("User", userSchema);
