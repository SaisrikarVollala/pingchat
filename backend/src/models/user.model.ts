import mongoose from "mongoose";
import { TUser } from "../services/validation.user";
const userSchema = new mongoose.Schema<TUser>(
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

const User =mongoose.model<TUser>("User", userSchema);
export default User;