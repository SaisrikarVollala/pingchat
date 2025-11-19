import { create } from "zustand";
import axiosInstance from "../lib/axios.config";
import type { user } from "../lib/auth.validation";
import { useChatStore } from "./useChatStore";
import { toast } from "react-hot-toast";

interface SearchResult {
  user?: user;
  notFound: boolean;
}

interface SearchState {
  searchMode: boolean; // Search sidebar active
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

  // ON CLICK SEARCH BAR
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

  // SEARCH USER
  searchUser: async (username) => {
    set({ searchLoading: true });

    try {
      const { data } = await axiosInstance.post("/chat/searchUser", {
        username,
      });

      console.log("Search response:", data); // Debug log

      if (!data.success) {
        set({
          searchResult: { notFound: true },
          searchLoading: false,
        });
        return;
      }

      set({
        searchResult: { user: data.user, notFound: false },
        searchLoading: false,
      });
    } catch (error) {
      console.error("Search error:", error); // Debug log
      set({
        searchResult: { notFound: true },
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

      // Update chats store
      const chatStore = useChatStore.getState();
      const existingChatIndex = chatStore.chats.findIndex(
        (c) => c._id === newChat._id
      );

      if (existingChatIndex === -1) {
        // New chat - add to the beginning with proper initialization
        useChatStore.setState((state) => ({
          chats: [
            { ...newChat, unreadCount: 0, isOnline: false },
            ...state.chats,
          ],
        }));
      }

      // Set as current chat and fetch messages
      chatStore.setCurrentChat(newChat);
      await chatStore.fetchMessages(newChat._id);

      // Close search sidebar
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
