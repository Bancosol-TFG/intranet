import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const API_PROXY_TARGET = process.env.VITE_API_PROXY_TARGET ?? "http://localhost:8080";
const APP_ROOT = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  root: APP_ROOT,
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    outDir: "dist",
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
