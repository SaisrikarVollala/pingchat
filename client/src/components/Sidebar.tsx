import { useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { MessageSquare } from "lucide-react";
import type { Chat } from "../store/useChatStore";
import type { user } from "../lib/auth.validation";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";

const Sidebar = () => {
  const { chats, fetchChats, currentChat, setCurrentChat, isLoading } =
    useChatStore();

  const authUser = useAuthStore((s) => s.authUser);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // get the other user in the chat
  const getOtherUser = (chat: Chat) =>
    chat.participants.find((p: user) => p._id !== authUser?._id);

  if (isLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 bg-base-100 shadow-sm flex flex-col">

      {/* HEADER */}
      <div className="px-5 py-4 border-b border-base-300">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-6 text-primary" />
          <span className="font-semibold hidden lg:block">Chats</span>
        </div>
      </div>

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">

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
              className={`
                w-full flex items-center gap-3 p-3 rounded-xl transition-all
                ${isActive
                  ? "bg-primary/10 ring-1 ring-primary/30"
                  : "hover:bg-base-200"
                }
              `}
            >
              {/* AVATAR */}
              <div className="relative mx-auto lg:mx-0">
                <img
                  src={other?.avatar || "/avatar.png"}
                  className="size-12 rounded-full border border-base-300 shadow-sm object-cover"
                />

                {/* ONLINE DOT */}
                {chat.isOnline && (
                  <span className="absolute bottom-0 right-0 size-3 bg-green-500 rounded-full ring-2 ring-base-100" />
                )}
              </div>

              {/* TEXT */}
              <div className="hidden lg:flex flex-col text-left min-w-0">
                <span className="font-medium truncate">
                  {other?.displayName || other?.username || "User"}
                </span>
                <span className="text-sm text-base-content/60 truncate">
                  {chat.lastMessage?.content || "No messages yet"}
                </span>
              </div>

              {/* UNREAD BADGE */}
              {chat.unreadCount > 0 && (
                <span className="badge badge-error badge-sm ml-auto hidden lg:flex">
                  {chat.unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

    </aside>
  );
};

export default Sidebar;
