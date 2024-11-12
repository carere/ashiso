import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  ssr: false,
  server: {
    compatibilityDate: "2024-11-12",
    preset: "vercel",
  },
  vite: {
    optimizeDeps: { exclude: ["sqlocal"] },
    worker: { format: "es" },
    build: { target: "esnext" },
    plugins: [
      {
        name: "configure-response-headers",
        configureServer: (server) => {
          server.middlewares.use((_req, res, next) => {
            res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            next();
          });
        },
      },
    ],
  },
});
