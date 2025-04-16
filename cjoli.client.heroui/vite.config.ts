import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  resolve: {
    /*alias: {
      "react-dom": path.resolve(__dirname, "node_modules/react-dom/profiling"),
      "scheduler/tracing": path.resolve(
        __dirname,
        "node_modules/scheduler/tracing-profiling"
      ),
    },*/
  },
});
