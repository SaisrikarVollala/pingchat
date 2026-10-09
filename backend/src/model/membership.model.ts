import { Schema, model, Types, InferSchemaType } from "mongoose";

const membershipSchema = new Schema(
  {
    chatId: { type: Types.ObjectId, ref: "Chat", required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["owner", "admin", "member"],
      default: "member",
    },
    lastDeliveredSequenceNumber: { type: Number, default: 0 },
    lastReadSequenceNumber: { type: Number, default: 0 },
    joinedAtSequenceNumber: { type: Number, default: 0 },
    mutedUntil: Date,
    leftAt: Date,
  },
  { timestamps: true },
);

membershipSchema.index({ chatId: 1, userId: 1 }, { unique: true });
membershipSchema.index({ userId: 1, leftAt: 1, updatedAt: -1 });

export type MembershipDoc = InferSchemaType<typeof membershipSchema>;
export const Membership = model("Membership", membershipSchema);
