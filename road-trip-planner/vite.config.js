import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api/ors": {
          target: "https://api.openrouteservice.org",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/ors/, ""),
          headers: { Authorization: env.ORS_API_KEY },
        },
      },
    },
  };
});
