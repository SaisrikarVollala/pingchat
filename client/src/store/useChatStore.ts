// src/stores/useChatStore.ts
import { create } from "zustand";
import { toast } from "react-hot-toast";
import axiosInstance from "../lib/axios.config";
import { useAuthStore } from "./useAuthStore";
import type { user } from "../lib/auth.validation";

interface lastMessageType {
  content: string;
  createdAt: string;
  senderId: string;
  readAt: string | null;
  deliveredAt: string | null;
}

interface Chat {
  _id: string;
  participants: user[];
  lastMessage: lastMessageType | null;
  updatedAt: string;
  unreadCount?: number;
  isOnline?: boolean;
}

interface Message {
  _id: string;
  chatId: string;
  content: string;
  senderId: string;
  createdAt: string;
  deliveredAt: string | null;
  readAt: string | null;
}

interface TChatStore {
  chats: Chat[];
  messages: Record<string, Message[]>;
  currentChat: Chat | null;
  isLoading: boolean;
  typing: Record<string, boolean>;

  setCurrentChat: (chat: Chat) => void;
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => void;
  startTyping: (chatId: string) => void;
  stopTyping: (chatId: string) => void;
  markAsRead: (chatId: string) => void;
  deleteChat: (chatId: string) => Promise<void>;
  initSocket: () => void;
  reset: () => void;
}

export const useChatStore = create<TChatStore>((set, get) => ({
  chats: [],
  messages: {},
  currentChat: null,
  isLoading: false,
  typing: {},

  setCurrentChat: (chat) => set({ currentChat: chat }),

  // Fetch all chats
  fetchChats: async () => {
    set({ isLoading: true });
    try {
      const { data } = await axiosInstance.get("/chats");
      if (!data.success) throw new Error(data.error);
      set({ chats: data.chats });
      if (data.chats[0] && !get().currentChat) get().setCurrentChat(data.chats[0]);
    } catch {
      toast.error("Failed to load chats");
    } finally {
      set({ isLoading: false });
    }
  },

  // Fetch messages for a chat
  fetchMessages: async (chatId: string) => {
    set({ isLoading: true });
    try {
      const { data } = await axiosInstance.get(`/chats/${chatId}/messages`);
      if (!data.success) throw new Error(data.error);
      set((s) => ({ messages: { ...s.messages, [chatId]: data.messages } }));
      get().markAsRead(chatId);
    } catch {
      toast.error("Failed to load messages");
    } finally {
      set({ isLoading: false });
    }
  },

  // Send message (optimistic)
  sendMessage: (chatId: string, content: string) => {
    const socket = useAuthStore.getState().socket;
    if (!socket?.connected) return toast.error("Not connected");

    const userId = useAuthStore.getState().authUser?._id;
    if (!userId) {
      return toast.error("User not authenticated");
    }
    const tempId = `temp-${Date.now()}`;

    // Add to UI immediately
    set((s) => ({
      messages: {
        ...s.messages,
        [chatId]: [
          {
            _id: tempId,
            chatId,
            content,
            senderId: userId,
            createdAt: new Date().toISOString(),
            deliveredAt: null,
            readAt: null,
          },
          ...(s.messages[chatId] || []),
        ],
      },
    }));

    socket.emit("message:send", { chatId, content });

    // Wait for server ack
    socket.once("message:sent", (res: { messageId: string; error?: string }) => {
      if (res.error) {
        toast.error(res.error);
        set((s) => ({
          messages: {
            ...s.messages,
            [chatId]: s.messages[chatId].filter((m) => m._id !== tempId),
          },
        }));
      } else {
        set((s) => ({
          messages: {
            ...s.messages,
            [chatId]: s.messages[chatId].map((m) =>
              m._id === tempId ? { ...m, _id: res.messageId } : m
            ),
          },
        }));
      }
    });
  },

  // Mark messages as read
  markAsRead: (chatId: string) => {
    const socket = useAuthStore.getState().socket;
    if (!socket?.connected) return;

    socket.emit("chat:messages:read", { chatId });

    set((s) => ({
      messages: {
        ...s.messages,
        [chatId]: s.messages[chatId]?.map((m) =>
          m.senderId !== useAuthStore.getState().authUser?._id
            ? { ...m, readAt: new Date().toISOString() }
            : m
        ) || [],
      },
      chats: s.chats.map((c) =>
        c._id === chatId ? { ...c, unreadCount: 0 } : c
      ),
    }));
  },

  // Typing
  startTyping: (chatId: string) => {
    const socket = useAuthStore.getState().socket;
    if (!socket?.connected) return;
    socket.emit("start:typing", { chatId });
    set((s) => ({ typing: { ...s.typing, [chatId]: true } }));
  },

  stopTyping: (chatId: string) => {
    const socket = useAuthStore.getState().socket;
    if (!socket?.connected) return;
    socket.emit("end:typing", { chatId });
    set((s) => ({ typing: { ...s.typing, [chatId]: false } }));
  },

  // Delete chat
  deleteChat: async (chatId: string) => {
    try {
      const { data } = await axiosInstance.delete(`/chats/${chatId}`);
      if (!data.success) throw new Error(data.error);
      set((s) => ({
        chats: s.chats.filter((c) => c._id !== chatId),
        messages: { ...s.messages, [chatId]: [] },
        currentChat: s.currentChat?._id === chatId ? null : s.currentChat,
      }));
      toast.success("Chat deleted");
    } catch {
      toast.error("Failed to delete");
    }
  },

  // Initialize socket listeners (called once after login)
  initSocket: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // New message from server
    socket.on("message:received", (msg: Message) => {
      const { currentChat } = get();

      set((s) => ({
        messages: {
          ...s.messages,
          [msg.chatId]: [msg, ...(s.messages[msg.chatId] || [])],
        },
        chats: s.chats
          .map((c) =>
            c._id === msg.chatId
              ? {
                  ...c,
                  lastMessage: msg,
                  updatedAt: msg.createdAt,
                  unreadCount:
                    c._id === currentChat?._id
                      ? c.unreadCount ?? 0
                      : (c.unreadCount ?? 0) + 1,
                }
              : c
          )
          .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
      }));

      // Confirm to server: "I rendered it"
      socket.emit("message:receivedSuccessfully", {
        messageId: msg._id,
        chatId: msg.chatId,
      });
    });

    // Message delivered (double tick)
    socket.on("message:delivered", ({ messageId, chatId }) => {
      set((s) => ({
        messages: {
          ...s.messages,
          [chatId]: s.messages[chatId]?.map((m) =>
            m._id === messageId ? { ...m, deliveredAt: new Date().toISOString() } : m
          ) || [],
        },
      }));
    });

    // Other user read messages (blue double tick)
    socket.on("chat:messages:read", ({ chatId }) => {
      set((s) => ({
        messages: {
          ...s.messages,
          [chatId]: s.messages[chatId]?.map((m) => ({
            ...m,
            readAt:
              m.senderId === useAuthStore.getState().authUser?._id
                ? m.readAt
                : new Date().toISOString(),
          })) || [],
        },
        chats: s.chats.map((c) =>
          c._id === chatId ? { ...c, unreadCount: 0 } : c
        ),
      }));
    });

    // Typing indicator
    socket.on("typing:status", ({ chatId, isTyping }) => {
      set((s) => ({ typing: { ...s.typing, [chatId]: isTyping } }));
    });

    // Online status
    socket.on("user:online", (userId: string) => {
      set((s) => ({
        chats: s.chats.map((c) => {
          const other = c.participants.find(
            (p) => p._id !== useAuthStore.getState().authUser?._id
          );
          return other?._id === userId ? { ...c, isOnline: true } : c;
        }),
      }));
    });

    socket.on("user:offline", (userId: string) => {
      set((s) => ({
        chats: s.chats.map((c) => {
          const other = c.participants.find(
            (p) => p._id !== useAuthStore.getState().authUser?._id
          );
          return other?._id === userId ? { ...c, isOnline: false } : c;
        }),
      }));
    });
  },

  // Reset on logout
  reset: () => set({ chats: [], messages: {}, currentChat: null, typing: {} }),
}));