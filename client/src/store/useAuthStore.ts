import { create } from "zustand";
import axiosInstance from "../lib/axios.config";
import { toast } from "react-hot-toast";
import { io, Socket } from "socket.io-client";
import { useChatStore } from "./useChatStore";
import type { TLoginForm, TRegisterForm, TAuth } from "../lib/auth.validation";

interface AuthStore {
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
  logout: () => Promise<void>;
  updateProfile: (data: {
    displayName?: string;
    avatar?: string;
  }) => Promise<boolean>;
  connectSocket: () => void;
  disconnectSocket: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
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
      const { data } = await axiosInstance.get("/auth/check");
      if (data.success && data.authPayload) {
        set({ authUser: data.authPayload, isAuthenticated: true });
      } else {
        set({ authUser: null, isAuthenticated: false });
      }
    } catch {
      set({ authUser: null, isAuthenticated: false });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signUp: async (data) => {
    set({ isSigningUp: true });
    try {
      const { data: res } = await axiosInstance.post("/auth/register", data);
      if (res.success) {
        toast.success(res.message || "Registration successful!");
        await get().checkAuth();
        return true;
      }
      toast.error(res.message || "Failed");
      return false;
    } catch (err) {
      toast.error("Sign up failed");
      console.error(err);
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const { data: res } = await axiosInstance.post("/auth/login", data);
      if (res.success) {
        toast.success("Logged in!");
        await get().checkAuth();
      } else {
        toast.error(res.message || "Login failed");
      }
    } catch (err) {
      toast.error("Login failed");
      console.error(err);
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
      toast.success("Logged out");
    } catch {
      toast.error("Logout failed");
    }
  },

  updateProfile: async (data: { displayName?: string; avatar?: string }) => {
    set({ isUpdatingProfile: true });

    try {
      const res = await axiosInstance.put("/user/profile", data);

      if (res.data.success) {
        set({
          authUser: {
            ...get().authUser!,
            ...res.data.user,
          },
        });

        toast.success(res.data.message || "Profile updated successfully!");
        return true;
      } else {
        toast.error(res.data.error || "Failed to update profile");
        return false;
      }
    } catch (err) {
      toast.error("Failed to update profile");
      console.error("Update profile error:", err);
      return false;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser, socket, isConnected } = get();
    if (!authUser || (socket?.connected && isConnected)) return;

    const newSocket = io(
      import.meta.env.VITE_API_URL || "http://localhost:5000",
      {
        withCredentials: true,
        transports: ["websocket", "polling"],
      }
    );

    newSocket.on("connect", () => {
      set({ socket: newSocket, isConnected: true });
      useChatStore.getState().initSocket();
    });

    newSocket.on("disconnect", () => set({ isConnected: false }));

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    socket?.disconnect();
    set({ socket: null, isConnected: false });
  },
}));
