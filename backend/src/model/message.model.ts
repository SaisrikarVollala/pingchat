// models/Message.ts
import { Schema, model, Document, Types } from "mongoose";
interface TAttachment {
  type: string; // "image" | "file" etc.
  url: string;
}
export interface IMessage{
  chatId: Types.ObjectId;  // Reference to Chat
  senderId: string;        // Clerk userId
  content: string;
  attachments?: TAttachment[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    senderId: { type: String, required: true }, // Clerk userId
    content: { type: String, required: true },
    attachments: [
      {
        type: {
          type: String,
        },
        url: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Message = model<IMessage>("Message", MessageSchema);
