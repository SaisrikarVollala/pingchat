import { io } from '../config/soket.config';
import { Message } from '../model/message.model';
import { Chat } from '../model/chats.model';
import {
  setUserOnline,
  getUserSocketId,
getAllOnlineUsers,
  removeUserOnline,
  incrementUnreadCount,
  clearUnreadCount,
} from '../utils/messagesCache';

type AckResponse = { status: 'ok' | 'error'; error?: string };

type TMessageData = {
  chatId: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachments?: Array<{ type: string; url: string }>;
};


  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('user:online', async (userId: string, ack: (res: AckResponse) => void) => {
      try {
        await setUserOnline(userId, socket.id);
        socket.join(`user:${userId}`);
        console.log(`User ${userId} online`);
        ack({ status: 'ok' });
      } catch (err) {
        ack({ status: 'error', error: 'Failed to go online' });
      }
    });

  
    socket.on('message:send', async (data: TMessageData, ack: (res: AckResponse) => void) => {
      try {
        const { chatId, senderId, receiverId, content, attachments = [] } = data;

        const message = await Message.create({
          chatId,
          senderId,
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

        // SEND ACK → SENDER SHOWS SINGLE TICK
        ack({ status: 'ok' });

        const receiverSocketId = await getUserSocketId(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('message:received', populated);
        } else {
          await incrementUnreadCount(receiverId, chatId);
        }
      } catch (error: any) {
        console.error('message:send error:', error);
        ack({ status: 'error', error: error.message });
      }
    });


    socket.on(
      'message:delivered',
      async (
        data: { messageId: string; senderId: string },
        ack: (res: AckResponse) => void
      ) => {
        try {
          const { messageId, senderId } = data;


          await Message.findByIdAndUpdate(messageId, { deliveredAt: new Date() });

          ack({ status: 'ok' });

          const senderSocketId = await getUserSocketId(senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit('message:delivered', { messageId });
          }
        } catch (error: any) {
          console.error('message:delivered error:', error);
          ack({ status: 'error', error: 'Failed to mark delivered' });
        }
      }
    );


    socket.on(
      'chat:markRead',
      async (
        data: { chatId: string; userId: string; otherUserId: string },
        ack: (res: AckResponse) => void
      ) => {
        try {
          const { chatId, userId, otherUserId } = data;

          await Message.updateMany(
            { chatId, senderId: otherUserId, readAt: null },
            { readAt: new Date() }
          );

          await clearUnreadCount(userId, chatId);

          ack({ status: 'ok' });

          const senderSocketId = await getUserSocketId(otherUserId);
          if (senderSocketId) {
            io.to(senderSocketId).emit('chat:messagesRead', { chatId });
          }
        } catch (error: any) {
          console.error('chat:markRead error:', error);
          ack({ status: 'error', error: 'Failed to mark read' });
        }
      }
    );


    socket.on('typing:start', async (data: { chatId: string; userId: string; receiverId: string }) => {
      const { receiverId, chatId, userId } = data;
      const receiverSocketId = await getUserSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:status', {
          chatId,
          userId,
          isTyping: true,
        });
      }
    });

    socket.on('typing:stop', async (data: { chatId: string; userId: string; receiverId: string }) => {
      const { receiverId, chatId, userId } = data;
      const receiverSocketId = await getUserSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('typing:status', {
          chatId,
          userId,
          isTyping: false,
        });
      }
    });


    socket.on('disconnect', async () => {
      try {
        const onlineUsers = await getAllOnlineUsers();
        for (const [userId, sid] of Object.entries(onlineUsers)) {
          if (sid === socket.id) {
            await removeUserOnline(userId);
            console.log(`User ${userId} offline`);
            break;
          }
        }
      } catch (err) {
        console.error('disconnect error:', err);
      }
    });
  });
