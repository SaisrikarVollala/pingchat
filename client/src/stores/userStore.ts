// store/useUserStore.ts
import { create } from "zustand";
import type  { TUser } from "../assets/userTypes";

interface UserStore {
  user: TUser | null;
  setUser: (user: TUser) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
