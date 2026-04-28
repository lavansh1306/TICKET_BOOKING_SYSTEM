import { create } from "zustand";

import { User } from "@/types";

interface UserState {
  user: User | null;
  isAuthed: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthed: false,
  setUser: (user) => set({ user, isAuthed: true }),
  clearUser: () => set({ user: null, isAuthed: false }),
}));
