import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set) => ({
      theme: "light",
      toggleTheme: () => {
        set((state) => {
          const next = state.theme === "light" ? "dark" : "light";
          document.documentElement.setAttribute("data-theme", next);
          return { theme: next };
        });
      },
      setTheme: (theme) => {
        document.documentElement.setAttribute("data-theme", theme);
        set({ theme });
      },
    }),
    {
      name: "stockwise-theme",
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.setAttribute("data-theme", state.theme);
        }
      },
    },
  ),
);
