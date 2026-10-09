import { Schema, model,InferSchemaType} from "mongoose";

const userSchema = new Schema(
  {
   email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    avatarUrl: { type: String ,default: "" },
    password: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);


userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
//index for serching 
export type UserDoc=InferSchemaType<typeof userSchema>;
export const User= model("User", userSchema);

