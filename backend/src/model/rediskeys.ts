export const redisKeys = {
  chatChannel: (chatId: string) => `ps:chat:${chatId}`,
  userChannel: (userId: string) => `ps:user:${userId}`,
  presence: (userId: string) => `presence:user:${userId}`,
  socket: (socketId: string) => `socket:${socketId}`,
  node: (nodeId: string) => `node:${nodeId}`,
  idempotency: (chatId: string, clientId: string, clientMessageId: string) =>
    `idem:${chatId}:${clientId}:${clientMessageId}`,
  chatMembers: (chatId: string) => `chat:${chatId}:members`,
  typing: (chatId: string, userId: string) => `typing:${chatId}:${userId}`,
  messageRateLimit: (userId: string) => `rl:msg:${userId}`,
  uploadRateLimit: (userId: string) => `rl:upload:${userId}`,
} as const;
//redis keyfactory


export const redisTtl = {
  presenceSeconds: 90,
  socketSeconds: 90,
  nodeSeconds: 30,
  idempotencySeconds: 300,
  chatMembersSeconds: 3600,
  typingSeconds: 5,
  messageRateLimitSeconds: 10,
  uploadRateLimitSeconds: 60,
} as const;

export type ChatEvent<T = unknown> = {
  type: "message.created" | "chat.updated" | "receipt.updated" | "typing";
  chatId: string;
  originNodeId: string;
  sequenceNumber?: number;
  payload: T;
};