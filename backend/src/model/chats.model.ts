import { Schema, model, Types } from "mongoose";

interface IChat  {
  type: "direct" | "group";
  participants: Types.ObjectId[];        
  lastMessage?: Types.ObjectId; 
  createdAt?: Date;
  updatedAt?: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    type: { type: String, enum: ["direct", "group"], required: true },
    participants: [{ type: Schema.Types.ObjectId, required: true,ref: 'User' }], 
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

ChatSchema.index({ participants: 1 });

export const Chat = model<IChat>("Chat", ChatSchema);
