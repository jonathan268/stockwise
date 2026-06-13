import { create } from "zustand";

let toastId = 0;

export const useToastStore = create((set, get) => ({
  toasts: [],

  add: (message, type = "info", duration = 4000) => {
    const id = ++toastId;
    set((state) => ({
      toasts: [...state.toasts, { id, message, type, duration }],
    }));
    if (duration > 0) {
      setTimeout(() => get().remove(id), duration);
    }
    return id;
  },

  remove: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  success: (message, duration) => get().add(message, "success", duration),
  error: (message, duration) => get().add(message, "error", duration),
  info: (message, duration) => get().add(message, "info", duration),
  warning: (message, duration) => get().add(message, "warning", duration),
}));
