// import { io } from '../index';
// import { Message } from '../model/message.model';
// import { Chat } from '../model/chats.model';

//  io.on('connection', (socket) => {
//     console.log('User connected:', socket.id);

//     socket.on('user:online', async (userId: string) => {
//       await setUserOnline(userId, socket.id);
//       socket.join(`user:${userId}`);
//       console.log(`User ${userId} is online`);
//     });

//     // Send message
//     socket.on('message:send', async (data: {
//       chatId: string;
//       senderId: string;
//       receiverId: string;
//       content: string;
//       attachments?: Array<{ type: string; url: string }>;
//     }) => {
//       try {
//         const message = await Message.create({
//           chatId: data.chatId,
//           senderId: data.senderId,
//           content: data.content,
//           attachments: data.attachments || [],
//           deliveredAt: new Date(),
//           readAt: null,
//         });

//         await Chat.findByIdAndUpdate(data.chatId, {
//           lastMessage: message._id,
//         });

//         const populatedMessage = await Message.findById(message._id)
//           .populate('senderId', 'name avatar');

//         // Send to sender
//         socket.emit('message:received', populatedMessage);

//         // Send to receiver if online
//         const receiverSocketId = await getUserSocketId(data.receiverId);
//         if (receiverSocketId) {
//           io.to(receiverSocketId).emit('message:received', populatedMessage);
          
//           // Auto-mark as delivered
//           await Message.findByIdAndUpdate(message._id, {
//             deliveredAt: new Date(),
//           });
          
//           io.to(socket.id).emit('message:delivered', {
//             messageId: message._id,
//             deliveredAt: new Date(),
//           });
//         } else {
//           // User offline - increment unread count in Redis
//           await incrementUnreadCount(data.receiverId, data.chatId);
//         }
//       } catch (error) {
//         socket.emit('message:error', { error: 'Failed to send message' });
//       }
//     });

//     // Typing indicator
//     socket.on('typing:start', async (data: { chatId: string; userId: string; receiverId: string }) => {
//       const receiverSocketId = await getUserSocketId(data.receiverId);
//       if (receiverSocketId) {
//         io.to(receiverSocketId).emit('typing:status', {
//           chatId: data.chatId,
//           userId: data.userId,
//           isTyping: true,
//         });
//       }
//     });

//     socket.on('typing:stop', async (data: { chatId: string; userId: string; receiverId: string }) => {
//       const receiverSocketId = await getUserSocketId(data.receiverId);
//       if (receiverSocketId) {
//         io.to(receiverSocketId).emit('typing:status', {
//           chatId: data.chatId,
//           userId: data.userId,
//           isTyping: false,
//         });
//       }
//     });

//     // Message delivered
//     socket.on('message:delivered', async (data: { messageId: string; senderId: string }) => {
//       try {
//         await Message.findByIdAndUpdate(data.messageId, {
//           deliveredAt: new Date(),
//         });

//         const senderSocketId = await getUserSocketId(data.senderId);
//         if (senderSocketId) {
//           io.to(senderSocketId).emit('message:delivered', {
//             messageId: data.messageId,
//             deliveredAt: new Date(),
//           });
//         }
//       } catch (error) {
//         console.error('Error marking message as delivered:', error);
//       }
//     });

//     // Message seen/read
//     socket.on('message:read', async (data: { messageId: string; senderId: string }) => {
//       try {
//         await Message.findByIdAndUpdate(data.messageId, {
//           readAt: new Date(),
//         });

//         const senderSocketId = await getUserSocketId(data.senderId);
//         if (senderSocketId) {
//           io.to(senderSocketId).emit('message:read', {
//             messageId: data.messageId,
//             readAt: new Date(),
//           });
//         }
//       } catch (error) {
//         console.error('Error marking message as read:', error);
//       }
//     });

//     // Mark all messages in chat as read
//     socket.on('chat:markRead', async (data: { chatId: string; userId: string; otherUserId: string }) => {
//       try {
//         await Message.updateMany(
//           {
//             chatId: data.chatId,
//             senderId: data.otherUserId,
//             readAt: null,
//           },
//           {
//             readAt: new Date(),
//           }
//         );

//         // Clear unread count in Redis
//         await clearUnreadCount(data.userId, data.chatId);

//         const otherUserSocketId = await getUserSocketId(data.otherUserId);
//         if (otherUserSocketId) {
//           io.to(otherUserSocketId).emit('chat:messagesRead', {
//             chatId: data.chatId,
//             readAt: new Date(),
//           });
//         }
//       } catch (error) {
//         console.error('Error marking chat as read:', error);
//       }
//     });

//     // User disconnects
//     socket.on('disconnect', async () => {
//       // Find and remove user from Redis/DB
//       const allUsers = await getAllOnlineUsers();
//       for (const [userId, socketId] of Object.entries(allUsers)) {
//         if (socketId === socket.id) {
//           await removeUserOnline(userId);
//           console.log(`User ${userId} went offline`);
//           break;
//         }
//       }
//     });
//   });