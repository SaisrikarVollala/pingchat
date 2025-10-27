import { Schema, model, Document} from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
 username: string;
 displayName: string;
 profilePic: string;
 passwordHash: string;
 email: string;
 createdAt: Date;
 updatedAt: Date;
 toAuthJSON():{
   username: string;
   id: string;
 };
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




userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toAuthJSON = function ():{
  username: string;
  id: string;
} {
  return {
    username: this.username,
    id: this._id.toString(),
  };
}

export const User = model<IUser>("User", userSchema);
