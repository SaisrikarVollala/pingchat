import { useChatStore } from "../store/useChatStore";
import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import Navbar from "../components/Navbar";

const HomePage = () => {
  const { currentChat } = useChatStore();

  return (
    <div className="h-screen bg-base-200 flex flex-col"> 
        <Navbar />
      {/* Full-height container with rounded chat box */}
      <div className="flex-1 flex p-4 overflow-hidden">
        <div className="bg-base-100 rounded-2xl shadow-xl w-full h-full overflow-hidden flex">
          <Sidebar />
          {!currentChat ? <NoChatSelected /> : <ChatContainer />}
        </div>
      </div>

    </div>
  );
};

export default HomePage;
