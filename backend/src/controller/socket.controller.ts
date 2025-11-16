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
import { messageSchema, type MessageData } from '../validation/messagevalidation';
import {z} from "zod"
import { _discriminatedUnion } from 'zod/v4/core';

type AckResponse<T>={success:false ,"error":string}|{success:true,message:T}



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
    const userId = socket.data.userId;
    console.log(`User ${userId} connected – socket ${socket.id}`);

    (async () => {
      try {
        await setUserOnline(userId, socket.id);
        socket.join(`user:${userId}`);
        
        // Notify others that this user is online
        socket.broadcast.emit('user:online', userId);
      } catch (e) {
        console.error('setUserOnline failed:', e);
      }
    })();

    socket.on(
      'message:send',
      async (data: MessageData, ack: (res: AckResponse<MessageData>) => void) => {
        const parsedMessage=messageSchema.parse(data)
        if (parsedMessage.senderId !== userId) {
          ack({ success: false, error: 'Unauthorized sender' });
          return;
        }

        try {
          const { chatId, content, attachments} = parsedMessage;
          const chat = await Chat.findById(chatId);
          if (
            !chat ||
            !chat.participants.map((p) => p.toString()).includes(userId)
          ) {
            ack({ success: false, error: "Unauth" });
            return;
          }


      
         
          const receiverId = chat.participants
            .map((id) => id.toString())
            .find((id) => id !== userId)!;

          // Create message
          const Newmessage = await Message.create({
            chatId,
            senderId: userId,
            content: content.trim(),
            attachments,
            deliveredAt: null,
            readAt: null,
          });

          // Update chat's last message
          await Chat.findByIdAndUpdate(chatId, { 
            lastMessage: Newmessage._id,
            updatedAt: new Date()
          });
          
          const messagejson=Newmessage.toJSON()
          // Acknowledge sender
          ack({
            success: true,
            message:messageSchema.parse ({
              ...messagejson,
              _id :messagejson._id.toString(),
              chatId: messagejson.chatId.toString(),
              senderId: messagejson.senderId.toString(),
            }),
          });

          // Try to deliver to receiver
          const receiverSocketId = await getUserSocketId(receiverId);
          if (receiverSocketId) {
            io.to(receiverSocketId).emit('message:received',messageSchema.parse ({
              ...messagejson,
              _id :messagejson._id.toString(),
              chatId: messagejson.chatId.toString(),
              senderId: messagejson.senderId.toString(),
            }));
          } else {
            await incrementUnreadCount(receiverId, chatId);
          }
        } catch (err) {
           if (err instanceof z.ZodError) {
                ack({success:false,error:JSON.stringify(z.treeifyError(err))})
              }
          
          ack({ success: false, error: 'Failed to send message' });
        }
      }
    );

    socket.on(
      "message:receivedSuccess",
      async (
        { messageId, senderId,chatId }: { messageId: string; senderId: string;chatId:string }) => {
        try {
          // Mark as delivered
          await Message.findByIdAndUpdate(messageId, {
            deliveredAt: new Date(),
          });
          
          // Notify sender of delivery
          const senderSocketId = await getUserSocketId(senderId);
          if (senderSocketId) {
            io.to(senderSocketId).emit("message:delivered", { messageId,chatId });
          }
        } catch (e: any) {
          console.error("message:received error:", e);
        }
      }
    );

    socket.on(
      'chat:read',
      async (
        { chatId,otherUserId}: { chatId: string;otherUserId:string }) => {
        try {
          // Mark all messages from other user as read
          await Message.updateMany(
            { chatId, senderId: otherUserId, readAt: null },
            { readAt: new Date() }
          );

          // Clear unread count in cache
          await clearUnreadCount(userId, chatId);

          // Notify other user their messages were read
          const otherSocketId = await getUserSocketId(otherUserId);
          if (otherSocketId) {
            io.to(otherSocketId).emit('chat:messageRead', { chatId });
          }
        } catch (e) {
          console.error('chat:markRead error:', e);
        }
      }
    );

    socket.on('disconnect', async () => {
      try {
        await removeUserOnline(userId);
        
        // Notify others that this user went offline
        socket.broadcast.emit('user:offline', userId);
        
        console.log(`User ${userId} disconnected`);
      } catch (e) {
        console.error('disconnect cleanup error:', e);
      }
    });
  });
};