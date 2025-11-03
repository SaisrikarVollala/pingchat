import redisClient from '../config/redisClient';
interface OnlineUsers {
    userId: string;
    socketId: string;
}

export const setUserOnline = async (userId: string, socketId: string) => {
  await redisClient.hSet('online_users', userId, socketId);
};

export const getUserSocketId = async (userId: string): Promise<string | null> => {
  return await redisClient.hGet('online_users', userId);
};

export const removeUserOnline = async (userId: string) => {
  await redisClient.hDel('online_users', userId);
};

export const getAllOnlineUsers = async (): Promise<Record<string, string>> => {
  return await redisClient.hGetAll('online_users');
};


export const getOnlineUserIds = async (): Promise<string[]> => {
  return await redisClient.hKeys('online_users');
}

export const cacheUnreadCount = async (userId: string, chatId: string, count: number) => {
  await redisClient.hSet(`unread:${userId}`, chatId, count.toString());
};

export const getCachedUnreadCount = async (userId: string, chatId: string): Promise<number | null> => {
  const count = await redisClient.hGet(`unread:${userId}`, chatId);
  return count ? parseInt(count) : null;
};

export const incrementUnreadCount = async (userId: string, chatId: string) => {
  await redisClient.hIncrBy(`unread:${userId}`, chatId, 1);
};

export const clearUnreadCount = async (userId: string, chatId: string) => {
  await redisClient.hDel(`unread:${userId}`, chatId);
};