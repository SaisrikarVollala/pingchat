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
    <div className="p-3 border-t border-base-300 bg-base-100">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={content}
          placeholder="Type a message..."
          className="input input-bordered w-full"
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />

        <button onClick={handleSend} className="btn btn-primary">
          Send
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
