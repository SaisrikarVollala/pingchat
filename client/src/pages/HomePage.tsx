import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";

const HomePage = () => {
  const { currentChat } = useChatStore();

  return (
    <div className="h-screen flex bg-base-200 ">
      <Sidebar />
      {!currentChat ? <NoChatSelected /> : <ChatContainer />}
    </div>
  );
};

export default HomePage;
