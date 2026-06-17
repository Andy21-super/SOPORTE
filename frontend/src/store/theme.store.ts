import { create } from "zustand";

interface ThemeState {
  mode: "light" | "dark";
  toggleMode: () => void;
  setMode: (mode: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  mode: (localStorage.getItem("theme_mode") as "light" | "dark") || "light",
  toggleMode: () => {
    set((state) => {
      const newMode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem("theme_mode", newMode);
      return { mode: newMode };
    });
  },
  setMode: (mode) => {
    localStorage.setItem("theme_mode", mode);
    set({ mode });
  }
}));
