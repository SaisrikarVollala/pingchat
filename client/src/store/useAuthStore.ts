import { create } from "zustand";
import axiosInstance from "../lib/axios.config";
import { toast } from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import { useChatStore } from "./useChatStore";
import { z } from "zod";
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
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      const body = res.data;
      if (!body.success) throw new Error(body.error || "Not authenticated");

      const parsed = CheckAuthResponseSchema.parse(body.authPayload);
      set({ authUser: parsed, isAuthenticated: true });
    } catch (err) {
      const message =
        err instanceof z.ZodError
          ? "Invalid server response"
          : err instanceof AxiosError
            ? err.response?.data?.error || "Auth failed"
            : err instanceof Error
              ? err.message
              : "Authentication failed";
      console.log(message)
      set({ authUser: null, isAuthenticated: false });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/register", data);
      const body = res.data;

      if (!body.success) throw new Error(body.error || "Sign up failed");

      toast.success(body.message || "OTP sent to your email");
      return true;
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error || "Sign up failed"
          : err instanceof Error
            ? err.message
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

      if (!body.success) throw new Error(body.error || "Invalid OTP");

      toast.success(body.message || "Email verified!");
      await get().checkAuth();
      return true;
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error || "Verification failed"
          : err instanceof Error
            ? err.message
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

      if (!body.success) throw new Error(body.error || "Login failed");

      toast.success(body.message || "Logged in successfully");
      await get().checkAuth();
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error || "Login failed"
          : err instanceof Error
            ? err.message
            : "Login failed";

      toast.error(message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      const res = await axiosInstance.post("/auth/logout");
      const body = res.data;

      if (!body.success) throw new Error(body.error);

      toast.success(body.message || "Logged out");
      set({ authUser: null, isAuthenticated: false });
      get().disconnectSocket();
      useChatStore.getState().reset();
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error || "Logout failed"
          : err instanceof Error
            ? err.message
            : "Logout failed";

      toast.error(message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/user/profile", data);
      const body = res.data;

      if (!body.success) throw new Error(body.error || "Update failed");

      set({ authUser: body.user });
      toast.success(body.message || "Profile updated");
      return true;
    } catch (err) {
      const message =
        err instanceof AxiosError
          ? err.response?.data?.error || "Update failed"
          : err instanceof Error
            ? err.message
            : "Update failed";

      toast.error(message);
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { socket, authUser } = get();

    if (socket?.connected || !authUser) return;

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
      console.log("Socket connected:", newSocket.id);
      set({ socket: newSocket, isConnected: true });
      useChatStore.getState().initSocket();
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      set({ isConnected: false });
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      set({ isConnected: false });
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("Socket reconnected after", attemptNumber, "attempts");
      set({ isConnected: true });
      useChatStore.getState().initSocket();
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log("Attempting to reconnect:", attemptNumber);
    });

    newSocket.on("reconnect_error", (error) => {
      console.error("Reconnection error:", error);
    });

    newSocket.on("reconnect_failed", () => {
      console.error("Failed to reconnect");
      toast.error("Connection failed. Please refresh.");
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
