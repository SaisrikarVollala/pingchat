import { create } from "zustand";
import axiosInstance from "../lib/axios.config";
import type { user } from "../lib/auth.validation";
import { useChatStore } from "./useChatStore";
import { toast } from "react-hot-toast";

interface SearchResult {
  users: user[]; 
  notFound: boolean;
}

interface SearchState {
  searchMode: boolean;
  searchLoading: boolean;
  searchResult: SearchResult | null;

  enterSearchMode: () => void;
  exitSearchMode: () => void;
  searchUser: (username: string) => Promise<void>;
  createChatWithUser: (username: string) => Promise<void>;
}

export const useSearchStore = create<SearchState>((set) => ({
  searchMode: false,
  searchLoading: false,
  searchResult: null,

  enterSearchMode: () => {
    set({
      searchMode: true,
      searchResult: null,
    });
  },

  exitSearchMode: () => {
    set({
      searchMode: false,
      searchResult: null,
    });
  },

  searchUser: async (username) => {
    if (!username || username.trim().length === 0) {
      set({ searchResult: null });
      return;
    }

    set({ searchLoading: true });

    try {
      const { data } = await axiosInstance.post("/users/search", {
        username: username.trim(),
      });

      if (!data.success || !data.users || data.users.length === 0) {
        set({
          searchResult: { users: [], notFound: true },
          searchLoading: false,
        });
        return;
      }

      set({
        searchResult: { users: data.users, notFound: false },
        searchLoading: false,
      });
    } catch (error) {
      console.error("Search error:", error);
      set({
        searchResult: { users: [], notFound: true },
        searchLoading: false,
      });
    }
  },

  createChatWithUser: async (username) => {
    try {
      const { data } = await axiosInstance.post("/chat/User", {
        otherUserName: username,
      });

      if (!data.success) {
        toast.error("Failed to create chat");
        return;
      }

      const newChat = data.chat;

      const chatStore = useChatStore.getState();
      const existingChatIndex = chatStore.chats.findIndex(
        (c) => c._id === newChat._id
      );

      if (existingChatIndex === -1) {
        useChatStore.setState((state) => ({
          chats: [
            { ...newChat, unreadCount: 0, isOnline: false },
            ...state.chats,
          ],
        }));
      }

      chatStore.setCurrentChat(newChat);
      await chatStore.fetchMessages(newChat._id);

      set({
        searchMode: false,
        searchResult: null,
      });

      toast.success("Chat opened");
    } catch (err) {
      console.error("Create chat error:", err);
      toast.error("Failed to open chat");
    }
  },
}));
