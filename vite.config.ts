import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from "plugin-inspect-react-code"

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("three") || id.includes("@react-three")) {
              return "vendor-three";
            }
            if (id.includes("framer-motion") || id.includes("gsap") || id.includes("lenis")) {
              return "vendor-animation";
            }
          }
        },
      },
    },
  },
});
