import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageBubble from "./MessageBubble";

const ChatContainer = () => {
  const { currentChat, messages, fetchMessages, isLoading } = useChatStore();
  const { authUser } = useAuthStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentChat?._id) return;

    fetchMessages(currentChat._id);
  }, [currentChat?._id, fetchMessages]);

  useEffect(() => {
    // Scroll to bottom instantly without animation when messages change
    if (messagesEndRef.current && messages[currentChat?._id || ""]) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [messages[currentChat?._id || ""], currentChat?._id]);

  if (!currentChat)
    return (
      <div className="flex-1 flex items-center justify-center text-base-content/60">
        Select a chat to start messaging
      </div>
    );

  const chatMessages = messages[currentChat._id] || [];

  return (
    <div className="flex-1 flex flex-col bg-base-200 h-screen overflow-hidden">
      <ChatHeader />

      {/* Show skeleton while loading, messages once loaded */}
      {isLoading && chatMessages.length === 0 ? (
        <MessageSkeleton />
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-0">
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
          <div ref={messagesEndRef} />
        </div>
      )}

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
