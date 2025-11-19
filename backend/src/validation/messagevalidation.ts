import { z } from "zod";

export const attachmentSchema = z.object({
  type: z.string().min(1, "Attachment type is required"),
  url: z.string().url("Invalid attachment URL"),
});

export const messageSchema = z.object({
  _id: z.string().optional(),
  chatId: z.string().min(1, "Chat ID is required"),
  senderId: z.string().min(1, "Sender ID is required"),
  content: z
    .string()
    .min(1, "Message content is required")
    .max(5000, "Message too long"),
  attachments: z.array(attachmentSchema).optional().default([]),
  deliveredAt: z.string().nullable().optional(),
  readAt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type MessageData = z.infer<typeof messageSchema>;
