import HomePage from "./pages/HomePage";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProfilePage from "./pages/ProfilePage";
import VerifyOtp from "./pages/VerifyOtp";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";


const App = () => {
  const { authUser, checkAuth, isCheckingAuth, connectSocket, disconnectSocket,isAuthenticated} = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  
  useEffect(() => {
    if(authUser) connectSocket();
    else disconnectSocket();
  }, [authUser]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div>
      <Routes>
        <Route path="/" element={isAuthenticated? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/register" element={!isAuthenticated? <Register /> : <Navigate to="/" />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/verify-Otp" element={!isAuthenticated ? <VerifyOtp /> : <Navigate to="/" />} />
        <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
