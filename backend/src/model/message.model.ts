// models/Message.ts
import { Schema, model, Document, Types } from "mongoose";

interface TAttachment {
  type: string; 
  url: string;
}

export interface IMessage{
  chatId: Types.ObjectId;  
  senderId: Types.ObjectId;        
  content: string;
  attachments?: TAttachment[];
  deliveredAt: Date|null;
  readAt: Date|null;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    senderId: { type: Schema.Types.ObjectId, required: true },
    readAt: { type: Date},
    deliveredAt: { type: Date  },
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
MessageSchema.index({ chatId: 1, createdAt: -1 });

export const Message = model<IMessage>("Message", MessageSchema);
