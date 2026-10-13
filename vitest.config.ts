import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    globals: true,
    // Some tests read files from disk rather than importing them, so
    // `vitest --changed` cannot trace them: a change to any of these runs
    // every test. The first two entries are Vitest's defaults.
    forceRerunTriggers: [
      "**/package.json/**",
      "**/{vitest,vite}.config.*/**",
      "**/package-lock.json",
      "**/public/**",
      "**/vercel.json",
      "**/index.html",
      "**/src/styles/**",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
