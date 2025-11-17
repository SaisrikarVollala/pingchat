import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useSearchStore } from "../store/useSearchStore";
import avatar from "../assets/images/avatar.png"
import SearchContainer from "./SearchContainer";

import { Search, LogOut, User, X,MessagesSquare } from "lucide-react";
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

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const getOtherUser = (chat: Chat) =>
    chat.participants.find((p: user) => p._id !== authUser?._id);

  if (isLoading) return <SidebarSkeleton />;

  return (
    <aside className="w-[340px] bg-base-100 border-r border-base-300 flex flex-col">

      <div className="h-14 flex items-center justify-between px-4 border-b border-base-300">
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <img
              src={authUser?.avatar || avatar}
              alt="Profile"
              className="w-8 h-8 rounded-full object-cover"
            />
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
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-base-200 transition"
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
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-base-200 transition text-error"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <MessagesSquare className="w-6"></MessagesSquare>
          <span className="font-medium text-base">Chats</span>
        </div>

        <div className="w-6"></div>
      </div>

      {/* SEARCH BAR */}
      <div className="p-3">
        <div className="relative flex items-center">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />

          <input
            type="text"
            placeholder="Search username..."
            className="w-full pl-12 pr-10 py-2 bg-base-200 rounded-full focus:outline-none"
            onFocus={enterSearchMode}
            onKeyDown={(e) => {
              if (e.key === "Enter") searchUser(e.currentTarget.value.trim());
            }}
          />

          {searchMode && (
            <button
              onClick={exitSearchMode}
              className="absolute right-3 p-1 hover:bg-base-300 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* CHATS OR SEARCH RESULTS */}
      <div className="flex-1 overflow-y-auto">
        {searchMode ? (
          <SearchContainer />
        ) : chats.length === 0 ? (
          <div className="text-center text-base-content/60 py-4">
            No chats available
          </div>
        ) : (
          chats.map((chat) => {
            const other = getOtherUser(chat);
            const isActive = currentChat?._id === chat._id;

            return (
              <button
                key={chat._id}
                onClick={() => setCurrentChat(chat)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-base-200 transition ${
                  isActive ? "bg-primary/10" : ""
                }`}
              >
                <div className="relative">
                  <img
                    src={other?.avatar || avatar}
                    className="w-12 h-12 rounded-full border border-base-300 object-cover"
                  />
                  {chat.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full ring-2 ring-base-100"></span>
                  )}
                </div>

                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate">
                      {other?.displayName || other?.username}
                    </h3>

                    {chat.lastMessage?.createdAt && (
                      <span className="text-xs opacity-50">
                        {new Date(
                          chat.lastMessage.createdAt
                        ).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm opacity-70 truncate">
                      {chat.lastMessage?.content || "No messages yet"}
                    </p>

                    {chat.unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
