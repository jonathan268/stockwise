import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCookieStore = create(
  persist(
    (set, get) => ({
      consent: null,
      preferences: {
        required: true,
        analytics: false,
        preferences: false,
      },

      acceptAll: () => {
        const prefs = { required: true, analytics: true, preferences: true };
        set({ consent: "all", preferences: prefs });
        applyConsent(prefs);
      },

      acceptSelected: (preferences) => {
        const prefs = { ...get().preferences, ...preferences };
        set({ consent: "custom", preferences: prefs });
        applyConsent(prefs);
      },

      refuseAll: () => {
        const prefs = { required: true, analytics: false, preferences: false };
        set({ consent: "necessary", preferences: prefs });
        applyConsent(prefs);
      },

      updatePreferences: (preferences) => {
        set({ preferences: { ...get().preferences, ...preferences } });
      },

      openModal: () => set({ modalOpen: true }),
      closeModal: () => set({ modalOpen: false }),
      modalOpen: false,

      showBanner: () => !get().consent,
    }),
    {
      name: "stockwise-cookie-consent",
      onRehydrateStorage: () => (state) => {
        if (state?.consent && state?.preferences) {
          applyConsent(state.preferences);
        }
      },
    },
  ),
);

function applyConsent(preferences) {
  if (typeof window === "undefined") return;
  window.__cookieConsent = preferences;

  if (preferences.analytics) {
    loadAnalytics();
  } else {
    unloadAnalytics();
  }
}

function loadAnalytics() {
  if (window.__gaLoaded) return;
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId) return;

  window.__gaLoaded = true;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", measurementId, { anonymize_ip: true });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.setAttribute("data-cookie-consent", "analytics");
  document.head.appendChild(script);
}

function unloadAnalytics() {
  if (!window.__gaLoaded) return;
  window.__gaLoaded = false;
  document.querySelectorAll('script[data-cookie-consent="analytics"]').forEach((s) => s.remove());
  delete window.gtag;
  delete window.dataLayer;
}
