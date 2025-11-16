import { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageBubble from "./MessageBubble";

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
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2">
        {chatMessages.map((msg) => {
          const isMe = msg.senderId === authUser?._id;

          return (
            <MessageBubble
              key={msg._id}
              content={msg.content}
              createdAt={msg.createdAt}
              isMe={isMe}
              readAt={msg.readAt}
              deliveredAt={msg.deliveredAt}
            />
          );
        })}

        <div ref={bottomRef} />
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
