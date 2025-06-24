import {useEffect } from "react"
import { Navbar } from "./components/Navbar"
import { Outlet } from "react-router-dom"
import { useAuthStore } from "./store/useAuthStore"



function App() {
  const {checkAuth,authUser} = useAuthStore()

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  console.log(authUser);
  return (
    <div>
      <Navbar />
      <Outlet context={authUser} />
    </div>
  )
}



export default App
