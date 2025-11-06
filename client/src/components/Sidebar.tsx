// import { useEffect } from "react";
// import { useChatStore } from "../store/useChatStore";
// import { useAuthStore } from "../store/useAuthStore";
// import SidebarSkeleton from "./SidebarSkeleton";
// import { MessageCircle, Users, Search, LogOut } from "lucide-react";

// const Sidebar = () => {
//   const { chats, currentChat, setCurrentChat, fetchChats, isLoading } = useChatStore();
//   const { authUser, onlineUsers, logout } = useAuthStore();

//   useEffect(() => {
//     fetchChats();
//   }, [fetchChats]);

//   if (isLoading) return <SidebarSkeleton />;

//   const otherUser = (chat: any) =>
//     chat.participants.find((p: any) => p._id !== authUser?._id);

//   return (
//     <aside className="h-full w-20 lg:w-80 border-r border-base-300 flex flex-col bg-base-200">
//       {/* Header */}
//       <div className="border-b border-base-300 p-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <MessageCircle className="size-6 text-primary" />
//             <span className="font-bold text-lg hidden lg:block">Chats</span>
//           </div>
//           <button
//             onClick={logout}
//             className="btn btn-ghost btn-sm text-error tooltip tooltip-left"
//             data-tip="Logout"
//           >
//             <LogOut className="size-5" />
//           </button>
//         </div>

//         {/* Search Bar - Desktop */}
//         <div className="mt-3 hidden lg:block">
//           <label className="input input-sm input-bordered flex items-center gap-2">
//             <Search className="size-4 opacity-70" />
//             <input type="text" placeholder="Search chats..." className="grow" />
//           </label>
//         </div>
//       </div>

//       {/* Chat List */}
//       <div className="overflow-y-auto flex-1 py-2">
//         {chats.length === 0 ? (
//           <div className="text-center text-zinc-500 py-8">
//             <Users className="size-12 mx-auto mb-2 opacity-50" />
//             <p>No chats yet</p>
//           </div>
//         ) : (
//           chats.map((chat) => {
//             const user = otherUser(chat);
//             const isOnline = onlineUsers.includes(user?._id);
//             const lastMsg = chat.lastMessage;
//             const time = lastMsg
//               ? new Date(lastMsg.createdAt).toLocaleTimeString([], {
//                   hour: "2-digit",
//                   minute: "2-digit",
//                 })
//               : "";

//             return (
//               <button
//                 key={chat._id}
//                 onClick={() => setCurrentChat(chat)}
//                 className={`
//                   w-full p-3 flex items-center gap-3 hover:bg-base-300 transition-all
//                   ${currentChat?._id === chat._id ? "bg-base-300 ring-1 ring-base-300" : ""}
//                 `}
//               >
//                 {/* Avatar */}
//                 <div className="relative">
//                   <img
//                     src={user?.avatar || "/avatar.png"}
//                     alt={user?.displayName}
//                     className="size-12 rounded-full object-cover ring-2 ring-base-200"
//                   />
//                   {isOnline && (
//                     <span className="absolute bottom-0 right-0 size-3 bg-success rounded-full ring-2 ring-base-200" />
//                   )}
//                 </div>

//                 {/* Info - Desktop */}
//                 <div className="hidden lg:block flex-1 text-left min-w-0">
//                   <div className="flex justify-between items-start">
//                     <p className="font-medium truncate">{user?.displayName || "Unknown"}</p>
//                     <span className="text-xs text-zinc-500">{time}</span>
//                   </div>
//                   <div className="flex justify-between items-center mt-1">
//                     <p className="text-sm text-zinc-400 truncate">
//                       {lastMsg ? (
//                         <>
//                           {lastMsg.senderId === authUser?._id && "You: "}
//                           {lastMsg.content}
//                         </>
//                       ) : (
//                         "No messages yet"
//                       )}
//                     </p>
//                     {chat.unreadCount > 0 && (
//                       <span className="badge badge-primary badge-sm">
//                         {chat.unreadCount}
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {/* Mobile Badge */}
//                 {chat.unreadCount > 0 && (
//                   <div className="lg:hidden">
//                     <span className="badge badge-primary badge-xs">{chat.unreadCount}</span>
//                   </div>
//                 )}
//               </button>
//             );
//           })
//         )}
//       </div>

//       {/* Mobile Search */}
//       <div className="lg:hidden border-t border-base-300 p-2">
//         <label className="input input-xs input-bordered flex items-center gap-2">
//           <Search className="size-4 opacity-70" />
//           <input type="text" placeholder="Search..." className="grow" />
//         </label>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;



const Sidebar= () => {
  return (
    <div>
      <h2>Sidebar</h2>
    </div>
  );
};

export default Sidebar;