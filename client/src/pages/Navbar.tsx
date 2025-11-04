import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";
import avatar from "../public/avatar.png";


export default function Navbar() {
  const { authUser } = useAuthStore();
  const navigate = useNavigate();

  return (
    <nav className="bg-base-200 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate("/")}>
          PingChat
        </h1>

        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{authUser?.displayName}</span>
          <div
            className="w-10 h-10 rounded-full overflow-hidden cursor-pointer border-2 border-base-300 hover:scale-105 transition-transform"
            onClick={() => navigate("/Profile")}
          >
           <img
  src={authUser?.avatar || avatar}
  alt="Profile"
  className="size-10 rounded-full object-cover"
/>

          </div>
        </div>
      </div>
    </nav>
  );
}
