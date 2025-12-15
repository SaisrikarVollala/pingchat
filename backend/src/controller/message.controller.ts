import express from "express";
import { Chat } from "../model/chats.model";
import { Message } from "../model/message.model";
import { Request, Response } from "express";
import { User } from "../model/user.model";
import { authenticateToken } from "../middleware/auth.middleware";
const router = express.Router();
import {
  getCachedUnreadCount,
  cacheUnreadCount,
  getUserSocketId,
} from "../services/messagesCache";

export const getChats = async (req: Request, res: Response) => {
  try {
    const userId = req.auth._id;
    const chats = await Chat.find({
      type: "direct",
      participants: userId,
    })
      .populate("participants", "username avatar displayName ")
      .populate({
        path: "lastMessage",
        select: "content createdAt senderId readAt deliveredAt",
      })
      .sort({ updatedAt: -1 });

    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        let unreadCount = await getCachedUnreadCount(
          userId.toString(),
          chat._id.toString()
        );

        // Fallback to DB if not in cache
        if (unreadCount === null) {
          unreadCount = await Message.countDocuments({
            chatId: chat._id,
            senderId: { $ne: userId },
            readAt: null,
          });
          await cacheUnreadCount(
            userId.toString(),
            chat._id.toString(),
            unreadCount
          );
        }

        const otherUser = chat.participants.find(
          (p: any) => p._id.toString() !== userId.toString()
        );
        const isOnline = otherUser
          ? !!(await getUserSocketId(otherUser._id.toString()))
          : false;

        return {
          ...chat.toObject(),
          unreadCount,
          isOnline,
        };
      })
    );

    res.json({ success: true, chats: chatsWithUnread });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch chats" });
  }
};

export const createChat = async (req: Request, res: Response) => {
  try {
    const { otherUserName } = req.body;
    const currentUserId = req?.auth?._id;
    const otherUserId = await User.findOne({ username: otherUserName })
      .select("_id")
      .lean();

    if (!otherUserId) {
      return res.status(404).json({ message: "User not found" });
    }

    if (otherUserId.toString() === currentUserId.toString()) {
      return res
        .status(400)
        .json({ success: false, error: "Cannot chat with yourself" });
    }

    let chat = await Chat.findOne({
      type: "direct",
      participants: { $all: [currentUserId, otherUserId], $size: 2 },
    }).populate("participants", "username avatar displayName ");

    if (!chat) {
      console.log(
        "Creating new chat between",
        currentUserId,
        "and",
        otherUserId
      );
      chat = await Chat.create({
        type: "direct",
        participants: [currentUserId, otherUserId],
      });

      chat = await Chat.findById(chat._id).populate(
        "participants",
        "username avatar displayName "
      );
    }

    res.json({ success: true, chat });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to create/get chat" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Verify user is participant
    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.auth._id,
    });

    if (!chat) {
      return res.status(404).json({ success: false, error: "Chat not found" });
    }

    const messages = await Message.find({ chatId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("senderId", "username avatar displayName ");

    const total = await Message.countDocuments({ chatId });

    res.json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
};

export const handleChatDetails = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.auth._id,
    })
      .populate("participants", "username avatar displayName ")
      .populate("lastMessage");

    if (!chat) {
      return res.status(404).json({ success: false, error: "Chat not found" });
    }

    const unreadCount = await Message.countDocuments({
      chatId: chat._id,
      senderId: { $ne: req.auth._id },
      readAt: null,
    });

    res.json({
      success: true,
      chat: {
        ...chat.toObject(),
        unreadCount,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch chat" });
  }
};

export const deleteChat = async (req: Request, res: Response) => {
  try {
    const { chatId } = req.params;

    const chat = await Chat.findOne({
      _id: chatId,
      participants: req.auth._id,
    });

    if (!chat) {
      return res.status(404).json({ success: false, error: "Chat not found" });
    }

    await Message.deleteMany({ chatId });
    await Chat.findByIdAndDelete(chatId);

    res.json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete chat" });
  }
};

// router.get('/chats/:chatId/search', authenticateToken, async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const { query } = req.query;

//     const chat = await Chat.findOne({
//       _id: chatId,
//       participants: req.auth.id,
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

// export const findUserId = async (req: Request, res: Response) => {
//   try {
//     const { username } = req.body;

//     const user = await User.findOne({ username }).select(
//       "_id username avatar displayName"
//     );

//     if (!user) {
//       return res.json({ success: false, message: "User not found" });
//     }

//     return res.status(200).json({ success: true, user });
//   } catch (err) {
//     return res
//       .status(500)
//       .json({ success: false, error: "Failed to search user" });
//   }
// };
const escapeRegex = (text: string) =>
  text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const findUserId = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;

    if (!username || username.trim().length === 0) {
      return res.json({ success: false, message: "Search query is required" });
    }

    const safeUsername = escapeRegex(username.trim());

    const users = await User.find({
      username: { $regex: `^${safeUsername}`, $options: "i" },
      _id: { $ne: req.auth._id },
    })
      .select("_id username avatar displayName")
      .limit(10)
      .lean();

    if (!users.length) {
      return res.json({ success: false, message: "No users found" });
    }

    return res.status(200).json({
      success: true,
      users,
      count: users.length,
    });
  } catch (err) {
    console.error("Search user error:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to search user" });
  }
};
