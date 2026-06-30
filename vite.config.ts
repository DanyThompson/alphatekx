import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";
import path from "path";

export default defineConfig({
  root: ".",
  base: "/",
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: "named",
        namedExport: "ReactComponent",
      },
    }),
  ],
  resolve: {
    alias: {
      "@/": path.resolve(__dirname, "./src"),
    },
    // Ensure a single React instance across all packages (e.g. @sentry/react).
    // Without this, @sentry/react can resolve its own React copy, causing
    // "Cannot read properties of null (reading 'useState')" during HMR.
    dedupe: ["react", "react-dom"],
  },
});
