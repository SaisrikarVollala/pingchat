import { useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Send } from "lucide-react";

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
    <div className="bg-base-100 border-t border-base-300 px-4 py-3">
      <div className="flex items-center gap-2">
        <textarea
          value={content}
          placeholder="Message"
          className="flex-1 px-4 py-2.5 bg-base-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button
          onClick={handleSend}
          className={`p-2.5 rounded-full transition-all ${
            content.trim()
              ? "bg-primary hover:bg-primary/90 text-primary-content"
              : "bg-base-300 text-base-content/40 cursor-not-allowed"
          }`}
          disabled={!content.trim()}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
