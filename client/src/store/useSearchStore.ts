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
        searchResult: { user: data.user,notFound:false },
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

      // Append to chat store (no duplicates)
      const exists = chatStore.chats.some((c) => c._id === newChat._id);
      if (!exists) chatStore.chats.unshift(newChat);

      chatStore.setCurrentChat(newChat);
      chatStore.fetchMessages(newChat._id);

      // close search sidebar
      set({
        searchMode: false,
        searchResult: null,
      });
    } catch (err) {
      console.error(err);
    }
  },
}));
