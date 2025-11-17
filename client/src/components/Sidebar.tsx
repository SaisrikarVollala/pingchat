import { useEffect, useState, useCallback } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useSearchStore } from "../store/useSearchStore";
import SearchContainer from "./SearchContainer";
import ChatListItem from "./ChatListItem ";
import { Search, LogOut, User, X, MessagesSquare, Menu } from "lucide-react";
import type { Chat } from "../store/useChatStore";
import type { user } from "../lib/auth.validation";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const { chats, fetchChats, currentChat, setCurrentChat, isLoading } =
    useChatStore();

  const { authUser, logout } = useAuthStore();
  const { searchMode, enterSearchMode, exitSearchMode, searchUser } =
    useSearchStore();

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    fetchChats();
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

  if (isLoading) return <SidebarSkeleton />;

  return (
    <aside className="w-[340px] bg-base-100 border-r border-base-300 flex flex-col h-screen">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-base-300 flex-shrink-0">
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 hover:opacity-80 transition p-2"
            aria-label="Profile menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />

              <div className="absolute top-12 left-0 w-48 bg-base-100 rounded-lg shadow-lg border border-base-300 z-50">
                <Link
                  to="/profile"
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-base-200 transition rounded-t-lg"
                  onClick={() => setShowProfileMenu(false)}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    logout();
                  }}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-base-200 transition text-error rounded-b-lg"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <MessagesSquare className="w-6 h-6" />
          <span className="font-medium text-base">Chats</span>
        </div>

        <div className="w-10" />
      </div>

      {/* Search Bar */}
      <div className="p-3 flex-shrink-0">
        <div className="relative flex items-center">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />

          <input
            type="text"
            placeholder="Search username..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-12 pr-10 py-2.5 bg-base-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
            onFocus={enterSearchMode}
            onKeyDown={handleSearchKeyDown}
          />

          {searchMode && (
            <button
              onClick={handleExitSearch}
              className="absolute right-3 p-1 hover:bg-base-300 rounded-full transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chat List or Search Results */}
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
