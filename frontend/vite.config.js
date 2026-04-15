import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite"; // Plugin officiel pour v4

export default defineConfig({
  plugins: [
    tailwindcss(), // Doit impérativement être placé avant react()
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-cache",
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: ({ url }) => url.pathname.startsWith("/api/v1/"),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
      manifest: {
        name: "StockWise",
        short_name: "StockWise",
        description: "Gestion de stock intelligente pour PME africaines",
        theme_color: "#570df8",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
      },
    }),
  ],
  server: {
    proxy: {
      "/api": { target: "http://localhost:5000", changeOrigin: true },
      "/socket.io": { target: "http://localhost:5000", ws: true },
    },
  },
});