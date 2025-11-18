import { useEffect, useState, useCallback, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useSearchStore } from "../store/useSearchStore";
import SearchContainer from "./SearchContainer";
import ChatListItem from "./ChatListItem ";
import { Search, X } from "lucide-react";
import type { Chat } from "../store/useChatStore";
import type { user } from "../lib/auth.validation";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Link } from "react-router-dom";
import avatar from "../assets/images/avatar.png";

const Sidebar = () => {
  const { chats, fetchChats, currentChat, setCurrentChat, isLoading } =
    useChatStore();

  const { authUser } = useAuthStore();
  const { searchMode, enterSearchMode, exitSearchMode, searchUser } =
    useSearchStore();

  const [searchInput, setSearchInput] = useState("");
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch once on mount
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

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        const value = searchInput.trim();
        if (value) {
          searchUser(value);
        }
      }
    },
    [searchInput, searchUser]
  );

  const handleExitSearch = useCallback(() => {
    exitSearchMode();
    setSearchInput("");
  }, [exitSearchMode]);

  if (isLoading && chats.length === 0) return <SidebarSkeleton />;

  return (
    <aside className="w-[340px] bg-base-100 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 flex items-center gap-3 flex-shrink-0">
        {/* Profile Avatar Redirect */}
        <Link to="/profile" className="hover:opacity-80 transition">
          <img
            src={authUser?.avatar || avatar}
            alt={authUser?.displayName || "User"}
            className="w-8 h-8 rounded-full object-cover cursor-pointer"
          />
        </Link>

        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />

          <input
            type="text"
            placeholder="Search username..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-base-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            onFocus={enterSearchMode}
            onKeyDown={handleSearchKeyDown}
          />

          {searchMode && (
            <button
              onClick={handleExitSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 hover:bg-base-300 rounded-full transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto min-h-0">
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
              <ChatListItem
                key={chat._id}
                chat={chat}
                isActive={isActive}
                otherUser={other}
                onClick={() => setCurrentChat(chat)}
              />
            );
          })
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
