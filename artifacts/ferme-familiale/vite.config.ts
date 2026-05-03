import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// PORT et BASE_PATH sont fournis par Replit en dev/preview.
// Hors Replit : valeurs par défaut sensées (sert /, sur le port Vite par défaut).
const port = Number(process.env.PORT ?? 5173);
const basePath = process.env.BASE_PATH ?? "/";

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env.PORT}"`);
}

// URL du backend API en dev (proxifié par Vite vers /api).
// En production, le backend Express sert ce frontend depuis le même origin.
const apiTarget = process.env.VITE_API_URL ?? "http://localhost:3000";

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    // En mode standalone (hors Replit), proxifier /api vers le backend Express local.
    // Sur Replit, le proxy global /api passe par l'artifact API Server, donc cet
    // hôte de proxy ne sera jamais joint et n'a pas d'impact.
    proxy: {
      "/api": {
        target: apiTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
