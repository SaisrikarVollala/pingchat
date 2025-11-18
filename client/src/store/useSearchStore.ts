import { create } from "zustand";
import axiosInstance from "../lib/axios.config";
import type { user } from "../lib/auth.validation";
import { useChatStore } from "./useChatStore";

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
    } catch {
      set({
        searchResult: { notFound: true },
        searchLoading: false,
      });
    }
  },

  // WHEN USER CLICKS FOUND USER CARD
  createChatWithUser: async (username) => {
    try {
      const { data } = await axiosInstance.post("/chat/User", {
        otherUserName: username,
      });

      if (!data.success) return;

      const chatStore = useChatStore.getState();
      const newChat = data.chat;

      // Check if chat already exists
      const existingChatIndex = chatStore.chats.findIndex(
        (c) => c._id === newChat._id
      );

      if (existingChatIndex === -1) {
        // New chat - add to the top of the list
        chatStore.chats.unshift(newChat);
      } else {
        // Existing chat - just update it
        chatStore.chats[existingChatIndex] = newChat;
      }

      // Set as current chat and fetch messages
      chatStore.setCurrentChat(newChat);
      chatStore.fetchMessages(newChat._id);

      // Close search sidebar
      set({
        searchMode: false,
        searchResult: null,
      });
    } catch (err) {
      console.error(err);
    }
  },
}));
