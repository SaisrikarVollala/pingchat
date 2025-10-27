import { Loader } from "lucide-react"
import Navbar from "./components/Navbar"
import { Outlet } from "react-router-dom"
import { useAuthStore } from "./stores/useAuthStore"
import { Toaster } from "react-hot-toast"
import { useEffect } from "react"


function App() {
  const { isCheckingAuth,checkAuth,authUser } = useAuthStore();

  useEffect(()=>{
    checkAuth();
  },[checkAuth])

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  
  return (
    <div >
      <Navbar />
      <Outlet  />
      <Toaster />
    </div>
  )
}



export default App
