import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      organization: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (data) =>
        set({
          user: data.user || get().user,
          organization: data.organization || get().organization,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          isAuthenticated: true,
        }),

      setTokens: (accessToken, refreshToken) =>
        set({
          accessToken,
          refreshToken,
        }),

      logout: () =>
        set({
          user: null,
          organization: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),

      updateOrganization: (org) => set({ organization: org }),
      isSuperAdmin: () => get().user?.role === "super_admin",
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        organization: state.organization,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
