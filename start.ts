import path from "path";
import express from "express";
import { app, PORT } from "./server";
import { config } from "./src/server/config";

async function start() {
  if (config.NODE_ENV !== "production") {
    // Dynamic import decouples Vite SSR and development tooling from test runners
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CareerForge AI Server running securely on http://0.0.0.0:${PORT} [${config.NODE_ENV}]`);
  });
}

start().catch((err) => {
  console.error("Failed to start CareerForge server:", err);
  process.exit(1);
});
