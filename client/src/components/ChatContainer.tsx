import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/formatMessageTime";

const ChatContainer = () => {
  const {
    currentChat,
    messages,
    fetchMessages,
    isLoading,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentChat?._id) return;
    fetchMessages(currentChat._id);
  }, [currentChat?._id]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages[currentChat?._id || ""]]);

  if (!currentChat)
    return (
      <div className="flex-1 flex items-center justify-center text-base-content/60">
        Select a chat to start messaging
      </div>
    );

  const chatMessages = messages[currentChat._id] || [];

  if (isLoading)
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );

  return (
    <div className="flex-1 flex flex-col bg-base-100 h-full">

      <ChatHeader />

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {chatMessages.map((msg) => {
          const isMe = msg.senderId === authUser?._id;

          return (
            <div
              key={msg._id}
              className={`chat ${isMe ? "chat-end" : "chat-start"}`}
            >
              {/* Avatar */}
              <div className="chat-image avatar">
                <div className="size-10 rounded-full border">
                  <img
                    src={
                      isMe
                        ? authUser?.avatar || "/avatar.png"
                        : currentChat.participants.find(
                            (p) => p._id !== authUser?._id
                          )?.avatar || "/avatar.png"
                    }
                    alt=""
                  />
                </div>
              </div>

              {/* Time */}
              <div className="chat-header opacity-70 text-xs mb-1">
                {formatMessageTime(msg.createdAt)}
              </div>

              {/* Message bubble */}
              <div className="chat-bubble bg-primary/20 text-base-content">
                {msg.content}
              </div>

              {/* Sent / Delivered / Seen */}
              {isMe && (
                <div className="text-[10px] opacity-60 mt-1">
                  {msg.readAt
                    ? "Seen"
                    : msg.deliveredAt
                    ? "Delivered"
                    : "Sent"}
                </div>
              )}
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
