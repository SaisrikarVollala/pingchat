import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Search, LogOut, User } from "lucide-react";
import type { Chat } from "../store/useChatStore";
import type { user } from "../lib/auth.validation";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const { chats, fetchChats, currentChat, setCurrentChat, isLoading } =
    useChatStore();
  const { authUser, logout } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const getOtherUser = (chat: Chat) =>
    chat.participants.find((p: user) => p._id !== authUser?._id);

  if (isLoading) return <SidebarSkeleton />;

  return (
    <aside className="w-[340px] bg-base-100 border-r border-base-300 flex flex-col">
      {/* HEADER */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-base-300">
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 hover:opacity-80 transition"
          >
            <img
              src={authUser?.avatar || "/avatar.png"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover"
            />
          </button>

          {/* Profile Dropdown */}
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

        <h1 className="text-xl font-semibold">PingChat</h1>
        <div className="w-10"></div>
      </div>

      {/* SEARCH BAR */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40" />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-10 pr-4 py-2 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 && (
          <div className="text-center text-base-content/60 py-4">
            No chats available
          </div>
        )}

        {chats.map((chat) => {
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
              {/* AVATAR */}
              <div className="relative">
                <img
                  src={other?.avatar || "/avatar.png"}
                  className="w-12 h-12 rounded-full border border-base-300 object-cover"
                  alt={other?.displayName || "User"}
                />

                {/* ONLINE DOT */}
                {chat.isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100" />
                )}
              </div>

              {/* TEXT */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold truncate">
                    {other?.displayName || other?.username || "User"}
                  </h3>
                  <span className="text-xs text-base-content/60">
                    {chat.lastMessage?.createdAt
                      ? new Date(chat.lastMessage.createdAt).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "numeric",
                            minute: "2-digit",
                          }
                        )
                      : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-base-content/60 truncate">
                    {chat.lastMessage?.content || "No messages yet"}
                  </p>
                  {/* UNREAD BADGE */}
                  {chat.unreadCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full flex-shrink-0">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
