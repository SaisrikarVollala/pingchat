// src/stores/useAuthStore.ts
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
  socket: Socket | null;
  isConnected: boolean;

  checkAuth: () => Promise<void>;
  login: (data: TLoginForm) => Promise<void>;
  signUp: (data: TRegisterForm) => Promise<boolean>;
  verifyOtp: (email: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useAuthStore = create<TAuthStore>()((set, get) => ({
  authUser: null,
  isAuthenticated: false,
  isCheckingAuth: true,
  isLoggingIn: false,
  isSigningUp: false,
  socket: null,
  isConnected: false,

  // Check if user is logged in
  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await axiosInstance.get("/auth/check");
      const body = res.data;

      if (!body.success) throw new Error(body.error || "Not authenticated");

      const parsed = CheckAuthResponseSchema.parse(body.authPayload);
      set({ authUser: parsed, isAuthenticated: true });
      get().connectSocket(); // Connect socket after auth
    } catch (err) {
      const message =
        err instanceof z.ZodError
          ? "Invalid server response"
          : err instanceof AxiosError
          ? err.response?.data?.error || "Auth failed"
          : err instanceof Error
          ? err.message
          : "Authentication failed";

      toast.error(message);
      set({ authUser: null, isAuthenticated: false });
      get().disconnectSocket();
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // Sign up
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

  // Verify OTP
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

  // Login
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

  // Logout
  logout: async () => {
    try {
      const res = await axiosInstance.post("/auth/logout");
      const body = res.data;

      if (!body.success) throw new Error(body.error || "Logout failed");

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

  // Connect WebSocket (cookies sent automatically)
  connectSocket: () => {
    const { socket, authUser } = get();
    if (socket?.connected || !authUser) return;

    const newSocket = io(import.meta.env.VITE_API_URL, {
      transports: ["websocket"],
      withCredentials: true, // Critical: sends httpOnly cookie
    });

    newSocket.on("connect", () => {
      set({ socket: newSocket, isConnected: true });
      useChatStore.getState().initSocket(); // Initialize chat listeners
    });

    newSocket.on("disconnect", () => set({ isConnected: false }));

    newSocket.on("connect_error", (err: Error) => {
      toast.error(err.message || "Connection failed");
    });

    set({ socket: newSocket });
  },

  // Disconnect socket
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) socket.disconnect();
    set({ socket: null, isConnected: false });
  },
}));