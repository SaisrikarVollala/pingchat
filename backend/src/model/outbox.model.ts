import { Schema, model, Types, InferSchemaType } from "mongoose";

const outboxSchema = new Schema(
  {
    aggregateId: { type: Types.ObjectId, required: true },
    chatId: { type: Types.ObjectId, required: true },
    eventType: {
      type: String,
      enum: ["message.created", "chat.updated"],
      required: true,
    },
    payload: { type: Schema.Types.Mixed, required: true },
    status: { type: String, enum: ["pending", "published"], default: "pending" },
    attempts: { type: Number, default: 0 },
    publishedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

outboxSchema.index({ status: 1, createdAt: 1 });
outboxSchema.index(
  { publishedAt: 1 },
  { expireAfterSeconds: 86400, partialFilterExpression: { status: "published" } }
);

export type OutboxDoc = InferSchemaType<typeof outboxSchema>;
export const Outbox = model("Outbox", outboxSchema);