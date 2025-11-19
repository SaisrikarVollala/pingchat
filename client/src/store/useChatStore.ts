import { create } from "zustand";
import { toast } from "react-hot-toast";
import axiosInstance from "../lib/axios.config";
import { useAuthStore } from "./useAuthStore";
import type { user } from "../lib/auth.validation";

export interface lastMessageType {
  content: string;
  createdAt: string;
  senderId: string;
  readAt: string | null;
  deliveredAt: string | null;
}

type AckResponse<T> =
  | { success: false; error: string }
  | { success: true; message: T };

type MsgMeta = { senderId: string; chatId: string; messageId: string };

export interface Chat {
  _id: string;
  participants: user[];
  lastMessage: lastMessageType | null;
  updatedAt: string;
  unreadCount: number;
  isOnline?: boolean;
}

export interface Message {
  _id: string;
  chatId: string;
  content: string;
  senderId: string;
  createdAt: string;
  deliveredAt: string | null;
  readAt: string | null;
}

export interface TChatStore {
  chats: Chat[];
  messages: Record<string, Message[]>;
  currentChat: Chat | null;
  isLoading: boolean;
  socketInitialized: boolean;

  setCurrentChat: (chat: Chat | null) => void;
  fetchChats: () => Promise<void>;
  fetchMessages: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, content: string) => void;
  markAsRead: (chatId: string, otherUserId: string) => void;
  deleteChat: (chatId: string) => Promise<void>;
  initSocket: () => void;
  cleanupSocket: () => void;
  reset: () => void;
}

export const useChatStore = create<TChatStore>((set, get) => ({
  chats: [],
  messages: {},
  currentChat: null,
  isLoading: false,
  socketInitialized: false,

  setCurrentChat: (chat) => set({ currentChat: chat }),

  fetchChats: async () => {
    set({ isLoading: true });
    try {
      const { data } = await axiosInstance.get("/chats");
      if (!data.success) throw new Error(data.error);

      const chats: Chat[] = data.chats.sort(
        (a: Chat, b: Chat) => +new Date(b.updatedAt) - +new Date(a.updatedAt)
      );

      set({ chats });
    } catch {
      toast.error("Failed to load chats");
    } finally {
      set({ isLoading: false });
    }
  },

  fetchMessages: async (chatId: string) => {
    set({ isLoading: true });
    try {
      const { data } = await axiosInstance.get(`/chats/${chatId}/messages`);
      if (!data.success) throw new Error(data.error);

      const sorted = [...data.messages].sort(
        (a: Message, b: Message) =>
          +new Date(a.createdAt) - +new Date(b.createdAt)
      );

      set((s) => ({
        messages: { ...s.messages, [chatId]: sorted },
      }));

      const myId = useAuthStore.getState().authUser?._id;
      const chat = get().chats.find((c) => c._id === chatId);

      const otherUsers =
        chat?.participants.filter((u) => u._id !== myId).map((u) => u._id) ||
        [];

      otherUsers.forEach((id) => get().markAsRead(chatId, id));
    } catch {
      toast.error("Failed to load messages");
    } finally {
      set({ isLoading: false });
    }
  },

  sendMessage: (chatId: string, content: string) => {
    const socket = useAuthStore.getState().socket;
    if (!socket?.connected) return toast.error("Not connected");

    const userId = useAuthStore.getState().authUser?._id;
    if (!userId) return toast.error("User not authenticated");

    const { currentChat } = get();
    if (!currentChat) return toast.error("No chat selected");

    if (currentChat._id !== chatId) return;

    const trimmed = content.trim();
    if (!trimmed) return;

    const tempId = `temp-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;

    const optimisticMessage: Message = {
      _id: tempId,
      chatId,
      content: trimmed,
      senderId: userId,
      createdAt: new Date().toISOString(),
      deliveredAt: null,
      readAt: null,
    };

    set((s) => ({
      messages: {
        ...s.messages,
        [chatId]: [...(s.messages[chatId] || []), optimisticMessage],
      },
      chats: s.chats
        .map((c) =>
          c._id === chatId
            ? {
                ...c,
                lastMessage: optimisticMessage,
                updatedAt: optimisticMessage.createdAt,
              }
            : c
        )
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    }));

    socket.emit(
      "message:send",
      { chatId, senderId: userId, content: trimmed },
      (response: AckResponse<Message>) => {
        if (!response.success) {
          toast.error(response.error || "Failed to send message");

          set((s) => ({
            messages: {
              ...s.messages,
              [chatId]: s.messages[chatId].filter((m) => m._id !== tempId),
            },
          }));

          return;
        }

        const serverMessage = response.message;

        set((s) => ({
          messages: {
            ...s.messages,
            [chatId]: s.messages[chatId].map((m) =>
              m._id === tempId ? serverMessage : m
            ),
          },
          chats: s.chats
            .map((c) =>
              c._id === chatId
                ? {
                    ...c,
                    lastMessage: serverMessage,
                    updatedAt: serverMessage.createdAt,
                  }
                : c
            )
            .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
        }));
      }
    );
  },

  markAsRead: (chatId: string, otherUserId: string) => {
    const socket = useAuthStore.getState().socket;

    if (socket?.connected) {
      socket.emit("chat:read", { chatId, otherUserId });
    }

    set((s) => ({
      messages: {
        ...s.messages,
        [chatId]: (s.messages[chatId] || []).map((m) =>
          m.senderId === otherUserId
            ? { ...m, readAt: new Date().toISOString() }
            : m
        ),
      },
      chats: s.chats.map((c) =>
        c._id === chatId ? { ...c, unreadCount: 0 } : c
      ),
    }));
  },

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

  initSocket: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Remove old listeners before adding new ones
    get().cleanupSocket();

    socket.on("message:received", (msg: Message) => {
      const { currentChat } = get();
      const isCurrentChat = currentChat?._id === msg.chatId;

      set((s) => ({
        messages: {
          ...s.messages,
          [msg.chatId]: [...(s.messages[msg.chatId] || []), msg],
        },
        chats: s.chats
          .map((c) =>
            c._id === msg.chatId
              ? {
                  ...c,
                  lastMessage: msg,
                  updatedAt: msg.createdAt,
                  unreadCount: isCurrentChat
                    ? c.unreadCount
                    : c.unreadCount + 1,
                }
              : c
          )
          .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
      }));

      const meta: MsgMeta = {
        messageId: msg._id,
        senderId: msg.senderId,
        chatId: msg.chatId,
      };
      socket.emit("message:receivedSuccess", meta);

      if (isCurrentChat) {
        get().markAsRead(msg.chatId, msg.senderId);
      }
    });

    socket.on(
      "message:delivered",
      ({ messageId, chatId }: { messageId: string; chatId: string }) => {
        set((s) => ({
          messages: {
            ...s.messages,
            [chatId]: (s.messages[chatId] || []).map((m) =>
              m._id === messageId
                ? { ...m, deliveredAt: new Date().toISOString() }
                : m
            ),
          },
        }));
      }
    );

    socket.on("chat:messageRead", ({ chatId }) => {
      set((s) => ({
        messages: {
          ...s.messages,
          [chatId]: (s.messages[chatId] || []).map((m) => ({
            ...m,
            readAt: new Date().toISOString(),
          })),
        },
        chats: s.chats.map((c) =>
          c._id === chatId ? { ...c, unreadCount: 0 } : c
        ),
      }));
    });

    socket.on("user:online", (userId: string) => {
      set((s) => ({
        chats: s.chats.map((c) =>
          c.participants.some((p) => p._id === userId)
            ? { ...c, isOnline: true }
            : c
        ),
      }));
    });

    socket.on("user:offline", (userId: string) => {
      set((s) => ({
        chats: s.chats.map((c) =>
          c.participants.some((p) => p._id === userId)
            ? { ...c, isOnline: false }
            : c
        ),
      }));
    });

    set({ socketInitialized: true });
  },

  cleanupSocket: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("message:received");
    socket.off("message:delivered");
    socket.off("chat:messageRead");
    socket.off("user:online");
    socket.off("user:offline");
  },

  reset: () => {
    get().cleanupSocket();
    set({
      chats: [],
      messages: {},
      currentChat: null,
      isLoading: false,
      socketInitialized: false,
    });
  },
}));
