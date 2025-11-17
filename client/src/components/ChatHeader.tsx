import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import avatar from "../assets/images/avatar.png";

const ChatHeader = () => {
  const { currentChat, setCurrentChat } = useChatStore();
  const { authUser } = useAuthStore();

  if (!currentChat) return null;

  const otherUser = currentChat.participants.find(
    (p) => p._id !== authUser?._id
  );

  return (
    <div className="h-14 bg-base-100 border-b border-base-300 flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={otherUser?.avatar || avatar}
            alt={otherUser?.displayName || "User"}
            className="w-10 h-10 rounded-full object-cover"
          />
          {currentChat.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-base-100"></div>
          )}
        </div>
        <div>
          <h2 className="font-semibold text-sm">
            {otherUser?.displayName || otherUser?.username}
          </h2>
          <p className="text-xs text-base-content/60">
            {currentChat.isOnline ? "online" : "offline"}
          </p>
        </div>
      </div>

      <button
        onClick={() => setCurrentChat(null)}
        className="p-2 hover:bg-base-200 rounded-full transition"
        aria-label="Close chat"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

export default ChatHeader;
