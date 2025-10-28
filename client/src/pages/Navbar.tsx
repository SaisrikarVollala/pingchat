import { useAuthStore } from "../stores/useAuthStore";

export default function Navbar() {
  const { logout, authUser } = useAuthStore();

  return (
    <nav className="bg-base-200 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">PingChat</h1>
        
        <div className="flex items-center gap-4">
          <span>{authUser?.displayName}</span>
          <button 
            onClick={logout}
            className="btn btn-ghost btn-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}