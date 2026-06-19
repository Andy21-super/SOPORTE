import { create } from "zustand";
import type { User } from "../interfaces";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  setSession: (input: { accessToken: string; refreshToken: string; user: User }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  user: localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null,
  setSession: ({ accessToken, refreshToken, user }) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token: accessToken, refreshToken, user });
  },
  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    set({ token: null, refreshToken: null, user: null });
  }
}));
