import { create } from "zustand";
import axiosInstance from "../lib/axios.config";
import { userShapeWithOutPassword } from "../validation";
import type { TformData, TUserWithOutPassword } from "../validation";
import toast from "react-hot-toast";
import type { TLoginFormData } from "../validation";
type TuserAuthStore = {
    authUser:   null| TUserWithOutPassword;
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;
    checkAuth: () => Promise<void>;
    signUp: (data: TformData) => Promise<void>;
    logout: () => Promise<void>;
    login: (data: TLoginFormData) => Promise<void>;
    updateProfile: (data:string) => Promise<void>;
};

export const useAuthStore = create<TuserAuthStore>()((set) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,

    checkAuth:async() => {
        try {
            const response = await axiosInstance.get('/auth/check');
            const userInfo = userShapeWithOutPassword.parse(response.data);
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
            const userInfo = userShapeWithOutPassword.parse(response.data);
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
            const userInfo = userShapeWithOutPassword.parse(response.data);
            set({ authUser: userInfo });
            toast.success("Logged in successfully!");
        } catch (error) {
            toast.error("Failed to log in. Please check your credentials.");
            console.error("Error during login:", error);
        } finally {
            set({ isLoggingIn: false });
        }
    },
    updateProfile: async (data:string) => {
        set({ isUpdatingProfile: true });
        try {
            const res= await axiosInstance.put('/auth/update-profile',{profilePic:data});
            set({authUser:res.data as TUserWithOutPassword});
            toast.success("Profile updated succesfully");
        } catch (error) {
            console.log(error);
        }finally{
            set({isUpdatingProfile:false})
        }
    }
}))
  