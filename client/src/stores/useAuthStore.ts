import { create } from "zustand";
import axiosInstance from "../lib/axios.config";
import { toast } from "react-hot-toast";
import type { TRegisterForm, TLoginForm } from "../lib/auth.validation";

type TAuth = {
  username: string;
  displayName: string;
  id: string;
  profile: string;
};

type TAuthStore = {
  authUser: null | TAuth;
  isSigningUp: boolean;
  isLoggingIn: boolean;
  isCheckingAuth: boolean;
  socket: null;
  checkAuth: () => Promise<void>;
  signUp: (data: TRegisterForm) => Promise<boolean>;
  logout: () => Promise<void>;
  login: (data: TLoginForm) => Promise<void>;
  connectSocket: () => void;
  disConnectSocket: () => void;
verifyOtp: (email: string, otp: string) => Promise<boolean>;
};

export const useAuthStore = create<TAuthStore>()((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isCheckingAuth: true,
  socket: null,

  checkAuth: async () => {
    console.log("[AUTH] Checking auth...");
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
    } catch (err) {
      console.log("[AUTH] checkAuth failed:", err);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (data) => {
    set({ isSigningUp: true });
    try {
      await axiosInstance.post("/auth/register", data);
      return true;
      toast.success("Account created");
    //   get().connectSocket();
    } catch (err) {
      console.log("[AUTH] SignUp error:", err);
      toast.error("Sign up failed");
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    try {
      const response = await axiosInstance.post("/auth/verify-otp", {
        email,
        otp
      });
      await get().checkAuth();
      
      toast.success(response.data.message || "Email verified successfully!");
      return true;
    } catch (err) {
      console.error("[AUTH] Verify OTP error:", err);
      toast.error("OTP verification failed");
      return false;
    }
  },

  login: async (data) => {
    console.log("[AUTH] Login attempt:", data);
    set({ isLoggingIn: true });
    try {
      await axiosInstance.post("/auth/login", data);
      await get().checkAuth();
      toast.success("Logged in");
    //   get().connectSocket();
    } catch (err) {
      console.log("[AUTH] Login error:", err);
      toast.error("Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    console.log("[AUTH] Logout attempt...");
    try {
      await axiosInstance.post("/auth/logout");
      console.log("[AUTH] Logout success");
      set({ authUser: null });
      get().disConnectSocket();
      toast.success("Logged out");
    } catch (err) {
      console.log("[AUTH] Logout error:", err);
      toast.error("Logout failed");
    }
  },

  connectSocket: () => {
    console.log("[SOCKET] connectSocket called (no implementation yet)");
  },

  disConnectSocket: () => {
    console.log("[SOCKET] disConnectSocket called (no implementation yet)");
  },
}));
