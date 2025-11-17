import { memo } from "react";
import type { Chat } from "../store/useChatStore";
import type { user } from "../lib/auth.validation";
import avatar from "../assets/images/avatar.png";

interface ChatListItemProps {
  chat: Chat;
  isActive: boolean;
  otherUser: user | undefined;
  onClick: () => void;
}

const ChatListItem = memo(
  ({ chat, isActive, otherUser, onClick }: ChatListItemProps) => {
    return (
      <button
        onClick={onClick}
        className={`w-full p-3 flex items-center gap-3 hover:bg-base-200 transition ${
          isActive ? "bg-primary/10" : ""
        }`}
      >
        <div className="relative flex-shrink-0">
          <img
            src={otherUser?.avatar || avatar}
            alt={otherUser?.displayName || "User"}
            className="w-12 h-12 rounded-full border border-base-300 object-cover"
          />
          {chat.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full ring-2 ring-base-100"></span>
          )}
        </div>

        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold truncate text-sm">
              {otherUser?.displayName || otherUser?.username}
            </h3>

            {chat.lastMessage?.createdAt && (
              <span className="text-xs opacity-50 flex-shrink-0 ml-2">
                {new Date(chat.lastMessage.createdAt).toLocaleTimeString(
                  "en-US",
                  {
                    hour: "numeric",
                    minute: "2-digit",
                  }
                )}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-sm opacity-70 truncate flex-1">
              {chat.lastMessage?.content || "No messages yet"}
            </p>

            {chat.unreadCount > 0 && (
              <span className="flex-shrink-0 px-2 py-0.5 bg-primary text-white text-xs rounded-full min-w-[20px] text-center">
                {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </button>
    );
  }
);

ChatListItem.displayName = "ChatListItem";

export default ChatListItem;
