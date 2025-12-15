import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/skeletons/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { currentChat } = useChatStore();

  return (
    <div className="h-screen flex bg-base-200 overflow-hidden">
      {/* Sidebar - Hidden on mobile when chat is selected */}
      <div
        className={`${currentChat ? "hidden md:flex" : "flex"} w-full md:w-auto`}
      >
        <Sidebar />
      </div>

      {/* Chat Container - Hidden on mobile when no chat selected */}
      <div className={`${currentChat ? "flex" : "hidden md:flex"} flex-1`}>
        {!currentChat ? <NoChatSelected /> : <ChatContainer />}
      </div>
    </div>
  );
};

export default HomePage;
