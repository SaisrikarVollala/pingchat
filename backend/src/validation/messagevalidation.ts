import { z } from "zod";

export const attachmentSchema = z.object({
  type: z.string().min(1, "Attachment type is required"),
  url: z.url("Invalid attachment URL"),
});

export const messageSchema = z.object({
  chatId: z.string().min(1, "Chat ID is required"),
  senderId: z.string().min(1, "Sender ID is required"),
  content: z.string().min(1, "Message content is required").max(5000, "Message too long"),
  attachments: z
    .array(attachmentSchema)
    .optional()
    .default([]),
})
.loose()

export type MessageData = z.infer<typeof messageSchema>;