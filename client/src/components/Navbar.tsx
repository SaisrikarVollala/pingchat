import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();

  return (
    <header
      className="
        bg-base-100 border-b border-base-300 
        w-full h-14 flex items-center z-40 
        px-4
      "
    >
      {/* LEFT — Logo */}
      <Link
        to="/"
        className="flex items-center gap-2.5 hover:opacity-80 transition-all"
      >
        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-primary" />
        </div>
        <h1 className="text-lg font-bold">PingChat</h1>
      </Link>

      {/* RIGHT — Profile + Name + Logout */}
      <div className="ml-auto flex items-center gap-4">
        {authUser && (
          <>
            {/* Profile with name below */}
            <Link
              to="/profile"
              className="flex flex-col items-center justify-center"
            >
              <div className="size-8 rounded-full overflow-hidden border border-base-300">
                <img
                  src={authUser.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-[10px] mt-0.5 leading-none whitespace-nowrap">
                {authUser.displayName}
              </span>
            </Link>

            {/* Logout button */}
            <button
              onClick={logout}
              className="
                flex items-center gap-1 text-sm 
                hover:opacity-70 transition
              "
            >
              <LogOut className="size-5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
