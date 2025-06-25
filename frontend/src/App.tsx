
import Navbar from "./components/Navbar"
import { Outlet } from "react-router-dom"

import { Toaster } from "react-hot-toast"


function App() {
  return (
    <div>
      <Navbar />
      <Outlet  />
      <Toaster />
    </div>
  )
}



export default App
