import mongoose from "mongoose";
import { IUser } from "../services/validation.user";
import bcrypt from "bcrypt";
import { TAuth } from "../services/validation.user";
const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    profilePic: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }

);
userSchema.methods.toAuthJSON = function (): TAuth {
   const AuthUser={
    id: this._id.toString(),
    fullName: this.fullName,
    email: this.email,
    profilePic: this.profilePic,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
   }
   return AuthUser;
};

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt=await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

const User =mongoose.model<IUser>("User", userSchema);
export default User;