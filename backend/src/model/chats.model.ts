import { Schema, model, Types, InferSchemaType } from "mongoose";



const chatSchema = new Schema(
  {
    type: { type: String, enum: ["direct", "group"], required: true },
    directKey: { type: String },//for identifying direct chat
    name: { type: String },
    avatarUrl: { type: String },
    createdBy: { type: Types.ObjectId, ref: "User", required: true },
    memberCount: { type: Number, default: 0 },
    lastMessage: {
      messageId: Types.ObjectId,
      senderId: Types.ObjectId,
      type: String,
      body: String,
      sequenceNumber: Number,
      createdAt: Date,
    },
    lastSequenceNumber:{type:Number,required:true,default:0},
  },
  { timestamps: true }
);


chatSchema.index(
  { directKey: 1 },
  { unique: true, partialFilterExpression: { type: "direct" } },
);

export const buildDirectKey = (a: string, b: string) =>
  a < b ? `${a}:${b}` : `${b}:${a}`;

export type ChatDoc=InferSchemaType<typeof chatSchema>
export const Chat = model("Chat", chatSchema);
