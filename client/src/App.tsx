import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Home, Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/useAuthStore";
import Register from "./pages/Register";
import VerifyOtp  from "./pages/VerifyOtp";
import Login from "./pages/Login";
// import Chat from "./pages/Chat";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Navbar   from "./pages/Navbar";
import ProfilePage from "./pages/UserProfile";


// // Protected Route Component
// const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
//   const { authUser, isCheckingAuth } = useAuthStore();

//   if (isCheckingAuth) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <Loader className="size-10 animate-spin" />
//       </div>
//     );
//   }

//   if (!authUser) {
//     return <Navigate to="/login" replace />;
//   }

//   return <>{children}</>;
// };

function App() {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Show loading state while checking initial auth
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Show Navbar only for authenticated routes */}
      {authUser && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route
          path="/register"
          element={!authUser ? <Register /> : <Navigate to="/" replace />}
        />
        <Route
          path="/verify-otp"
          element={!authUser ? <VerifyOtp /> : <Navigate to="/" replace />}
        />
        <Route
          path="/login"
          element={!authUser ? <Login /> : <Navigate to="/" replace />}
        />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {/* <Chat /> */}
              <Home />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
          },
        }}
      />
    </>
  );
}

export default App;
