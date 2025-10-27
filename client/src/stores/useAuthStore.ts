// // store/useUserStore.ts
// import { create } from "zustand";
// import type  { TUser } from "../assets/userTypes";

// interface UserStore {
//   user: TUser | null;
//   setUser: (user: TUser) => void;
//   clearUser: () => void;
// }

// export const useUserStore = create<UserStore>((set) => ({
//   user: null,
//   setUser: (user) => set({ user }),
//   clearUser: () => set({ user: null }),
// }));

import { create } from "zustand";
import axiosInstance from "../lib/axios.config";
import 
import type { TformData, TAuth ,TLoginFormData} from "../lib/validation";
import toast from "react-hot-toast";


type TAuthStore = {
    authUser:   null| TAuth;
    isSigningUp: boolean;
    isLoggingIn: boolean;
    isUpdatingProfile: boolean;
    isCheckingAuth: boolean;
    socket:null;
    checkAuth: () => Promise<void>;
    signUp: (data: TformData) => Promise<void>;
    logout: () => Promise<void>;
    login: (data: TLoginFormData) => Promise<void>;
    updateProfile: (data:string) => Promise<void>;
    connectSocket:()=>void;
    disConnectSocket:()=>void;
};

export const useAuthStore = create<TAuthStore>()((set,get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    socket:null,

    checkAuth:async() => {
        try {
            const response = await axiosInstance.get('/auth/check');
            const userInfo = AuthShape.parse(response.data);
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
            const userInfo = AuthShape.parse(response.data);
            set({ authUser: userInfo });
            toast.success("Account created successfully!");
            get().connectSocket();

        } catch (error) {
            toast.error("Failed to create account. Please try again.");
            console.error("Error during sign up:", error);
        } finally {
            set({ isSigningUp: false });
        }
    },
    logout: async () => {
        try {
            await axiosInstance.post("/auth/logout");;
            set({authUser:null});
            toast.success('Logged Out ');
            get().disConnectSocket();
        } catch (error) {
            toast.error("failed to logout");
            console.log(error);
        }
    },
    login: async (data: TLoginFormData) => {
        try {
            set({ isLoggingIn: true });
            const response = await axiosInstance.post('/auth/login', data);
            const userInfo = AuthShape.parse(response.data);
            set({ authUser: userInfo });
            toast.success("Logged in successfully!");
            get().connectSocket()
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
            set({authUser:res.data as TAuth});
            toast.success("Profile updated succesfully");
        } catch (error) {
            console.log(error);
        }finally{
            set({isUpdatingProfile:false})
        }
    },
    connectSocket:()=>{
      
    },
    disConnectSocket:()=>{

    }

}))
  
  