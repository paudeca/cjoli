import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["lib"],
      tsconfigPath: "./tsconfig.app.json",
    }),
  ],
  resolve: {
    alias: {
      "@": resolve("lib"),
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, "lib/main.ts"),
      formats: ["es"],
    },
    copyPublicDir: false,
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "axios",
        "dayjs",
        "i18next",
        "i18next-http-backend",
        "i18next-browser-languagedetector",
        "react-i18next",
        "react-use-websocket",
        "universal-cookie",
      ],
    },
  },
});
