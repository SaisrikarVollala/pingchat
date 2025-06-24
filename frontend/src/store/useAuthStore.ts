import { create } from "zustand";
import axiosInstance from "../lib/axios.config";
import { userShape } from "../validation";
type TuserAuthStore = {
    authUser:   null| typeof userShape._type;
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;
    checkAuth: () => Promise<void>;
    signUp: () => Promise<void>;
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
            set({ authUser: null, isCheckingAuth: false });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signUp: async ()=>{}
}))
  