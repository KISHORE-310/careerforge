import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    sourcemap: false, // keep bundle size small and source private in production
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Pin vendor code so app deploys don't bust the browser cache for
        // libraries that rarely change (React, Recharts, router).
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          charts: ["recharts"],
        },
      },
    },
  },
});