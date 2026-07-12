import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import path from "path"
import { fileURLToPath } from "url"
import { seoSitemapPlugin } from "./scripts/seoSitemapPlugin.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  // Expose SEO vars to the build-time sitemap/OG plugin (runs in Node, not import.meta.env).
  if (env.VITE_SITE_URL) process.env.VITE_SITE_URL = env.VITE_SITE_URL
  if (env.VITE_OG_IMAGE_PATH) process.env.VITE_OG_IMAGE_PATH = env.VITE_OG_IMAGE_PATH

  return {
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/ws": {
        target: "http://localhost:8080",
        changeOrigin: true,
        ws: true,
      },
    },
  },
  plugins: [react(), tailwindcss(), seoSitemapPlugin()],
  define: {
    global: "globalThis",
    __APP_BUILD__: JSON.stringify(process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "dev"),
  },
  optimizeDeps: {
    esbuildOptions: {
      define: { global: 'globalThis' },
      plugins: [NodeGlobalsPolyfillPlugin({ buffer: true, process: true })],
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined
          if (id.includes("/@stomp/stompjs/") || id.includes("/sockjs-client/")) return "vendor-ws"
          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/react-router") || id.includes("/scheduler/")) return "vendor-react"
          if (id.includes("/@radix-ui/")) return "vendor-radix"
          if (id.includes("/framer-motion/") || id.includes("/motion-dom/") || id.includes("/motion-utils/")) return "vendor-motion"
          if (id.includes("/date-fns/")) return "vendor-date"
          if (id.includes("/lucide-react/")) return "vendor-icons"
          return undefined
        },
      },
    },
  },
  }
})
