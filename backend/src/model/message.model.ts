import { Schema, model, Types, InferSchemaType } from "mongoose";

const messageSchema = new Schema(
  {
    chatId: { type: Types.ObjectId, ref: "Chat", required: true },
    senderId: { type: Types.ObjectId, ref: "User", required: true },
    clientId: { type: String, required: true },
    //to identify the devices of the sender
    clientMessageId: { type: String, required: true },
    sequenceNumber: { type: Number, required: true },
    type: { type: String, enum: ["text", "image", "gif"], required: true },
    body: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ chatId: 1, sequenceNumber: -1 }, { unique: true });
//unique index for sequence in the chat  per chat sequence


messageSchema.index(
  { chatId: 1, clientId: 1, clientMessageId: 1 },
  { unique: true }
);
//compound index for idempotency 

export type MessageDoc = InferSchemaType<typeof messageSchema>;
export const Message = model("Message", messageSchema);