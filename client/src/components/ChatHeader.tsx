import { X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const ChatHeader = () => {
  const { currentChat, setCurrentChat } = useChatStore();
  const { authUser } = useAuthStore();

  if (!currentChat) return null;

  const otherUser = currentChat.participants.find(
    (p) => p._id !== authUser?._id
  );

  return (
    <div className="p-3 border-b border-base-300 bg-base-100">
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-3">
          <div className="avatar">
            <div className="size-10 rounded-full">
              <img
                src={otherUser?.avatar || "/avatar.png"}
                alt={otherUser?.displayName || "User"}
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold">
              {otherUser?.displayName || otherUser?.username}
            </h3>
            <p className="text-sm text-base-content/60">
              {currentChat.isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        <button
          className="btn btn-sm btn-ghost"
          onClick={() => setCurrentChat(null)}
        >
          <X />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
