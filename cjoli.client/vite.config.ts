import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vitest/config";
import plugin from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [plugin()],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    silent: false,
    globals: true,
    coverage: {
      enabled: false,
      provider: "istanbul",
      all: true,
    },
  },
  build: {
    sourcemap: true,
  },
});
