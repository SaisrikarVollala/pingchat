import { Server, Socket } from 'socket.io';
import { Message } from '../model/message.model';
import { Chat } from '../model/chats.model';
import {
  setUserOnline,
  getUserSocketId,
  removeUserOnline,
  incrementUnreadCount,
  clearUnreadCount,
} from '../services/messagesCache';
import { verifyToken } from '../services/authUser';
import { parse } from 'cookie';

type AckResponse = { success: boolean; error?: string };

type TMessageData = {
  chatId: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachments?: Array<{ type: string; url: string }>;
};

export const initSocket = (io: Server) => {
  io.use(async (socket: Socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie;
      if (!cookieHeader) return next(new Error('Missing cookie header'));

      const cookies = parse(cookieHeader);
      const token = cookies.jwt;
      if (!token) return next(new Error('jwt cookie not found'));

      const payload = await verifyToken(token);
      if (!payload?._id) return next(new Error('Invalid token'));
      socket.data.userId = payload._id;
      next();
    } catch {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as string;
    console.log(`User ${userId} connected – socket ${socket.id}`);

    (async () => {
      try {
        await setUserOnline(userId, socket.id);
        socket.join(`user:${userId}`);
      } catch (e) {
        console.error('setUserOnline failed:', e);
      }
    })();

    socket.on(
      'message:send',
      async (data: TMessageData, ack: (res: AckResponse) => void) => {
        if (data.senderId !== userId) {
          return ack({ success: false, error: 'Unauthorized sender' });
        }

        try {
          const { chatId, receiverId, content, attachments = [] } = data;

          const message = await Message.create({
            chatId,
            senderId: userId,
            receiverId,
            content: content.trim(),
            attachments,
            deliveredAt: null,
            readAt: null,
          });

          await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

          const populated = await Message.findById(message._id)
            .populate('senderId', 'name avatar')
            .lean();

          ack({ success: true });

          const receiverSid = await getUserSocketId(receiverId);
          if (receiverSid) {
            io.to(receiverSid).emit('message:received', populated);
          } else {
            await incrementUnreadCount(receiverId, chatId);
          }
        } catch (e: any) {
          console.error('message:send error:', e);
          ack({ success: false, error: e.message });
        }
      }
    );

    socket.on(
      'message:received',
      async (
        { messageId, senderId }: { messageId: string; senderId: string },
        ack: (res: AckResponse) => void
      ) => {
        try {
          await Message.findByIdAndUpdate(messageId, { deliveredAt: new Date() });
          ack({ success: true });

          const senderSid = await getUserSocketId(senderId);
          if (senderSid) {
            io.to(senderSid).emit('message:delivered', { messageId });
          }
        } catch (e: any) {
          ack({ success: false, error: e.message });
        }
      }
    );

    socket.on(
      'chat:markRead',
      async (
        { chatId, otherUserId }: { chatId: string; otherUserId: string },
        ack: (res: AckResponse) => void
      ) => {
        try {
          await Message.updateMany(
            { chatId, senderId: otherUserId, readAt: null },
            { readAt: new Date() }
          );

          await clearUnreadCount(userId, chatId);
          ack({ success: true });

          const otherSid = await getUserSocketId(otherUserId);
          if (otherSid) {
            io.to(otherSid).emit('chat:messagesRead', { chatId });
          }
        } catch (e: any) {
          ack({ success: false, error: e.message });
        }
      }
    );

    socket.on('disconnect', async () => {
      try {
        await removeUserOnline(userId);
        console.log(`User ${userId} disconnected`);
      } catch (e) {
        console.error('disconnect cleanup error:', e);
      }
    });
  });
};