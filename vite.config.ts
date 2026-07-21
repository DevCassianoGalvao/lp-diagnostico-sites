import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/lp/",
  plugins: [
    react(),
    {
      name: "lead-api-dev-route",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/lp/api/leads.php" && req.method === "POST") {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ ok: true, delivered: true, messageId: "local-preview" }));
            return;
          }
          next();
        });
      }
    }
  ],
  server: {
    port: 5173
  }
});
