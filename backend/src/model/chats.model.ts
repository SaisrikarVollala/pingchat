// models/Chat.ts
import { Schema, model, Types } from "mongoose";

export interface IChat {
  type: "direct" | "group";
  participants: string[];        
  lastMessage?: Types.ObjectId; 
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    type: { type: String, enum: ["direct", "group"], required: true },
    participants: [{ type: String, required: true }], // Clerk IDs
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

export const Chat = model<IChat>("Chat", ChatSchema);
