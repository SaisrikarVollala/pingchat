import { create } from "zustand";
import axiosInstance from "../lib/axios.config";
import { toast } from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import { useChatStore } from "./useChatStore";
import type { TLoginForm, TRegisterForm, TAuth } from "../lib/auth.validation";
import { CheckAuthResponseSchema } from "../lib/auth.validation";
import { AxiosError } from "axios";

interface TAuthStore {
  authUser: TAuth | null;
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  isLoggingIn: boolean;
  isSigningUp: boolean;
  isUpdatingProfile: boolean;
  socket: Socket | null;
  isConnected: boolean;

  checkAuth: () => Promise<void>;
  login: (data: TLoginForm) => Promise<void>;
  signUp: (data: TRegisterForm) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: {
    displayName?: string;
    avatar?: string;
  }) => Promise<boolean>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useAuthStore = create<TAuthStore>()((set, get) => ({
  authUser: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  isLoggingIn: false,
  isSigningUp: false,
  isUpdatingProfile: false,
  socket: null,
  isConnected: false,

  checkAuth: async () => {
    const { isAuthenticated, isCheckingAuth } = get();
    if (isAuthenticated || isCheckingAuth) return;

    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      const body = res.data;

      if (!body.success) {
        set({ authUser: null, isAuthenticated: false });
        return;
      }

      const parsed = CheckAuthResponseSchema.parse(body.authPayload);
      set({ authUser: parsed, isAuthenticated: true });
    } catch (err) {
      set({ authUser: null, isAuthenticated: false });
      console.error("Auth check failed:", err);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);
      const body = res.data;

      if (!body.success) {
        toast.error(body.error || "Sign up failed");
        return false;
      }

      toast.success(body.message || "OTP sent to your email");
      return true;
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error || "Sign up failed"
          : "Sign up failed";

      toast.error(message);
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  verifyOtp: async (email, otp) => {
    try {
      const res = await axiosInstance.post("/auth/verifyOtp", { email, otp });
      const body = res.data;

      if (!body.success) {
        toast.error(body.error || "Invalid OTP");
        return false;
      }

      toast.success(body.message || "Email verified!");

      set({ isCheckingAuth: false, isAuthenticated: true });
      await get().checkAuth();
      return true;
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error || "Verification failed"
          : "Verification failed";

      toast.error(message);
      return false;
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      const body = res.data;

      if (!body.success) {
        toast.error(body.error || "Login failed");
        return;
      }

      toast.success(body.message || "Logged in successfully");

      set({ isCheckingAuth: false, isAuthenticated: true });
      await get().checkAuth();
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error || "Login failed"
          : "Login failed";

      toast.error(message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");

      set({ authUser: null, isAuthenticated: false });
      get().disconnectSocket();
      useChatStore.getState().reset();

      toast.success("Logged out successfully");
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error || "Logout failed"
          : "Logout failed";

      toast.error(message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/user/profile", data);
      const body = res.data;

      if (!body.success) {
        toast.error(body.error || "Update failed");
        return false;
      }

      set({ authUser: body.user });
      toast.success(body.message || "Profile updated");
      return true;
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error || "Update failed"
          : "Update failed";

      toast.error(message);
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { socket, authUser, isConnected } = get();

    if ((socket?.connected && isConnected) || !authUser) return;

    const newSocket = io(
      import.meta.env.VITE_API_URL || "http://localhost:5000",
      {
        transports: ["websocket", "polling"],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      }
    );

    newSocket.on("connect", () => {
      set({ socket: newSocket, isConnected: true });
      useChatStore.getState().initSocket();
    });

    newSocket.on("disconnect", () => {
      set({ isConnected: false });
    });

    newSocket.on("connect_error", () => {
      set({ isConnected: false });
    });

    newSocket.on("reconnect", () => {
      set({ isConnected: true });
      useChatStore.getState().initSocket();
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (!socket) return;

    socket.removeAllListeners();
    socket.disconnect();
    set({ socket: null, isConnected: false });
  },
}));
