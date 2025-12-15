import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, X, MessageSquare } from "lucide-react";

import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useSearchStore } from "../store/useSearchStore";

import SearchContainer from "./SearchContainer";
import ChatListItem from "./ChatListItem ";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

import type { Chat } from "../store/useChatStore";
import type { user } from "../lib/auth.validation";

import avatar from "../assets/images/avatar.png";

const Sidebar = () => {
  const { chats, fetchChats, currentChat, setCurrentChat, isLoading } =
    useChatStore();

  const { authUser } = useAuthStore();
  const { searchMode, enterSearchMode, exitSearchMode, searchUser } =
    useSearchStore();

  const [searchInput, setSearchInput] = useState("");
  const hasFetchedRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchChats();
      hasFetchedRef.current = true;
    }
  }, [fetchChats]);

  const getOtherUser = useCallback(
    (chat: Chat) =>
      chat.participants.find((p: user) => p._id !== authUser?._id),
    [authUser?._id]
  );

  useEffect(() => {
    if (!searchMode) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const trimmed = searchInput.trim();

    if (!trimmed) {
      searchUser("");
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      searchUser(trimmed);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchInput, searchMode, searchUser]);

  const handleExitSearch = useCallback(() => {
    exitSearchMode();
    setSearchInput("");
  }, [exitSearchMode]);

  if (isLoading && chats.length === 0) return <SidebarSkeleton />;

  return (
    <aside className="w-full md:w-[340px] bg-base-100 border-r border-base-300 flex flex-col h-screen">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-base-300">
        {/* Profile Avatar */}
        <Link to="/profile">
          <img
            src={authUser?.avatar || avatar}
            alt={authUser?.displayName || "User"}
            className="w-8 h-8 rounded-full object-cover"
          />
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>

          <span className="text-sm font-semibold tracking-wide">PINGCHAT</span>
        </div>

        {/* Spacer */}
        <div className="w-9" />
      </div>

      {/* Search Bar */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />

          <input
            type="text"
            placeholder="Search username..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onFocus={enterSearchMode}
            className="
              w-full
              h-9
              pl-9 pr-8
              bg-base-200
              rounded-md
              text-sm
              focus:outline-none
              focus:ring-2 focus:ring-primary/30
            "
          />

          {searchMode && (
            <button
              onClick={handleExitSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-2xl hover:bg-base-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto py-2">
        {searchMode ? (
          <SearchContainer />
        ) : chats.length === 0 ? (
          <div className="text-center text-base-content/60 py-4 px-4">
            No chats available
          </div>
        ) : (
          chats.map((chat) => {
            const other = getOtherUser(chat);
            const isActive = currentChat?._id === chat._id;

            return (
              <div key={chat._id} className="px-1">
                <ChatListItem
                  chat={chat}
                  isActive={isActive}
                  otherUser={other}
                  onClick={() => setCurrentChat(chat)}
                />
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
