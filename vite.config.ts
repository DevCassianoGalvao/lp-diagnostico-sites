import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "portfolio-image-dev-route",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/api/leads" && req.method === "POST") {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true, messageId: "local-preview" }));
            return;
          }
          const match = req.url?.match(/^\/portfolio-image\/([a-z0-9-]+)(?:\?.*)?$/);
          if (match) req.url = `/assets/portfolio/${match[1]}.webp`;
          next();
        });
      }
    }
  ],
  server: {
    port: 5173
  }
});
