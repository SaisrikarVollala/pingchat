import { Schema, model, Document} from "mongoose";
import type {TAuth} from "../validation/auth.validation";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
 username: string;
 displayName: string;
 profilePic: string;
 passwordHash: string;
 email: string;
 createdAt: Date;
 updatedAt: Date;
 toAuthJSON():TAuth;
 comparePassword(candidatePassword: string): Promise<boolean>;
}



const userSchema = new Schema<IUser>(
  {
   email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    profilePic: { type: String ,default: "" },
    passwordHash: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  try {
    const salt = await bcrypt.genSalt(10); // or 12 for stronger hash
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});


userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toAuthJSON = function (): TAuth {
  return {
    username: this.userName,
    id: this._id.string(),
    displayName: this.displayName,
    profilePic: this.avatarUrl,
  };
}

export const User = model<IUser>("User", userSchema);
