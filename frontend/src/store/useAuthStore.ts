import { create } from "zustand";
import axiosInstance from "../lib/axios.config";
import { userShape } from "../validation";
import type { TformData } from "../validation";
import toast from "react-hot-toast";
import type { TLoginFormData } from "../validation";
type TuserAuthStore = {
    authUser:   null| typeof userShape._type;
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;
    checkAuth: () => Promise<void>;
    signUp: (data: TformData) => Promise<void>;
    logout: () => Promise<void>;
    login: (data: TLoginFormData) => Promise<void>;
};

export const useAuthStore = create<TuserAuthStore>()((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const response = await axiosInstance.get('/auth/check');
            const userInfo = userShape.parse(response.data);
            set({ authUser: userInfo, isCheckingAuth: false });
        } catch (error) {
            console.error("Error checking authentication:", error);
            set({ authUser: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signUp: async (data: TformData) => {
        try {
            const response = await axiosInstance.post('/auth/signup', data);
            const userInfo = userShape.parse(response.data);
            set({ authUser: userInfo });
            toast.success("Account created successfully!");

        } catch (error) {
            toast.error("Failed to create account. Please try again.");
            console.error("Error during sign up:", error);
        } finally {
            set({ isSigningUp: false });
        }
    },
    logout: async () => {},
    login: async (data: TLoginFormData) => {
        try {
            set({ isLoggingIn: true });
            const response = await axiosInstance.post('/auth/login', data);
            const userInfo = userShape.parse(response.data);
            set({ authUser: userInfo });
            toast.success("Logged in successfully!");
        } catch (error) {
            toast.error("Failed to log in. Please check your credentials.");
            console.error("Error during login:", error);
        } finally {
            set({ isLoggingIn: false });
        }
    }
}))
  