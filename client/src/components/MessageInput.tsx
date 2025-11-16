import { useState } from "react";
import { useChatStore } from "../store/useChatStore";

const MessageInput = () => {
  const { currentChat, sendMessage } = useChatStore();
  const [content, setContent] = useState("");

  if (!currentChat) return null;

  const handleSend = () => {
    if (!content.trim()) return;

    sendMessage(currentChat._id, content);
    setContent("");
  };

  return (
    <div className="bg-base-100 border-t border-base-300 p-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={content}
          placeholder="Message"
          className="flex-1 px-4 py-3 bg-base-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button
          onClick={handleSend}
          className="px-4 py-3 bg-primary hover:bg-primary/90 rounded-lg flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!content.trim()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-white"
          >
            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
