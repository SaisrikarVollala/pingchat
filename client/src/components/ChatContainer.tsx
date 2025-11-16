import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { formatMessageTime } from "../lib/formatMessageTime";

const ChatContainer = () => {
  const { currentChat, messages, fetchMessages, isLoading } = useChatStore();
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
    <div className="flex-1 flex flex-col bg-base-200 h-full">
      <ChatHeader />

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {chatMessages.map((msg) => {
          const isMe = msg.senderId === authUser?._id;

          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  isMe ? "bg-primary text-white" : "bg-base-100"
                }`}
              >
                <p className="text-sm break-words">{msg.content}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="text-xs opacity-70">
                    {formatMessageTime(msg.createdAt)}
                  </span>
                  {isMe && (
                    <span className="text-xs opacity-70">
                      {msg.readAt ? "✓✓" : msg.deliveredAt ? "✓✓" : "✓"}
                    </span>
                  )}
                </div>
              </div>
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
