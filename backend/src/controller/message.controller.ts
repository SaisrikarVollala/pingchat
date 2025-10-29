// import express from 'express';
// import { Chat } from '../model/chats.model';
// import { Message } from '../model/message.model';
// import { authenticate } from './middleware/auth';

// const router = express.Router();

// router.get('/chats', authenticate, async (req, res) => {
//   try {
//     const userId = req.user._id;

//     const chats = await Chat.find({
//       type: 'direct',
//       participants: userId,
//     })
//       .populate('participants', 'name avatar email')
//       .populate({
//         path: 'lastMessage',
//         select: 'content createdAt senderId readAt deliveredAt',
//       })
//       .sort({ updatedAt: -1 });

//     // Get unread counts from Redis (faster) with DB fallback
//     const chatsWithUnread = await Promise.all(
//       chats.map(async (chat) => {
//         let unreadCount = await getCachedUnreadCount(userId.toString(), chat._id.toString());
        
//         // Fallback to DB if not in cache
//         if (unreadCount === null) {
//           unreadCount = await Message.countDocuments({
//             chatId: chat._id,
//             senderId: { $ne: userId },
//             readAt: null,
//           });
//           // Cache for next time
//           await cacheUnreadCount(userId.toString(), chat._id.toString(), unreadCount);
//         }

//         // Check if other participant is online
//         const otherUser = chat.participants.find((p: any) => p._id.toString() !== userId.toString());
//         const isOnline = otherUser ? !!(await getUserSocketId(otherUser._id.toString())) : false;

//         return {
//           ...chat.toObject(),
//           unreadCount,
//           isOnline,
//         };
//       })
//     );

//     res.json({ success: true, chats: chatsWithUnread });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Failed to fetch chats' });
//   }
// });

// // Get or create direct chat with another user
// router.post('/chats/direct', authenticate, async (req, res) => {
//   try {
//     const { otherUserId } = req.body;
//     const currentUserId = req.user._id;

//     if (otherUserId === currentUserId.toString()) {
//       return res.status(400).json({ success: false, error: 'Cannot chat with yourself' });
//     }

//     // Check if chat already exists
//     let chat = await Chat.findOne({
//       type: 'direct',
//       participants: { $all: [currentUserId, otherUserId], $size: 2 },
//     }).populate('participants', 'name avatar email');

//     if (!chat) {
//       chat = await Chat.create({
//         type: 'direct',
//         participants: [currentUserId, otherUserId],
//       });

//       chat = await Chat.findById(chat._id).populate('participants', 'name avatar email');
//     }

//     res.json({ success: true, chat });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Failed to create/get chat' });
//   }
// });

// // Get messages for a specific chat (with pagination)
// router.get('/chats/:chatId/messages', authenticate, async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const page = parseInt(req.query.page as string) || 1;
//     const limit = parseInt(req.query.limit as string) || 50;
//     const skip = (page - 1) * limit;

//     // Verify user is participant
//     const chat = await Chat.findOne({
//       _id: chatId,
//       participants: req.user._id,
//     });

//     if (!chat) {
//       return res.status(404).json({ success: false, error: 'Chat not found' });
//     }

//     const messages = await Message.find({ chatId })
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(limit)
//       .populate('senderId', 'name avatar');

//     const total = await Message.countDocuments({ chatId });

//     res.json({
//       success: true,
//       messages: messages.reverse(),
//       pagination: {
//         page,
//         limit,
//         total,
//         pages: Math.ceil(total / limit),
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Failed to fetch messages' });
//   }
// });

// // Get single chat details
// router.get('/chats/:chatId', authenticate, async (req, res) => {
//   try {
//     const { chatId } = req.params;

//     const chat = await Chat.findOne({
//       _id: chatId,
//       participants: req.user._id,
//     })
//       .populate('participants', 'name avatar email')
//       .populate('lastMessage');

//     if (!chat) {
//       return res.status(404).json({ success: false, error: 'Chat not found' });
//     }

//     const unreadCount = await Message.countDocuments({
//       chatId: chat._id,
//       senderId: { $ne: req.user._id },
//       readAt: null,
//     });

//     res.json({
//       success: true,
//       chat: {
//         ...chat.toObject(),
//         unreadCount,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Failed to fetch chat' });
//   }
// });

// // Delete chat
// router.delete('/chats/:chatId', authenticate, async (req, res) => {
//   try {
//     const { chatId } = req.params;

//     const chat = await Chat.findOne({
//       _id: chatId,
//       participants: req.user._id,
//     });

//     if (!chat) {
//       return res.status(404).json({ success: false, error: 'Chat not found' });
//     }

//     await Message.deleteMany({ chatId });
//     await Chat.findByIdAndDelete(chatId);

//     res.json({ success: true, message: 'Chat deleted successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Failed to delete chat' });
//   }
// });

// // Search messages in a chat
// router.get('/chats/:chatId/search', authenticate, async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const { query } = req.query;

//     const chat = await Chat.findOne({
//       _id: chatId,
//       participants: req.user._id,
//     });

//     if (!chat) {
//       return res.status(404).json({ success: false, error: 'Chat not found' });
//     }

//     const messages = await Message.find({
//       chatId,
//       content: { $regex: query, $options: 'i' },
//     })
//       .sort({ createdAt: -1 })
//       .limit(50)
//       .populate('senderId', 'name avatar');

//     res.json({ success: true, messages });
//   } catch (error) {
//     res.status(500).json({ success: false, error: 'Failed to search messages' });
//   }
// });

// export default router;