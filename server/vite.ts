import express, { type Express } from "express";
import type { Server } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function setupVite(app: Express, server: Server) {
  const { createServer } = await import("vite");
  
  const vite = await createServer({
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "spa",
    root: path.resolve(__dirname, "..", "client"),
  });

  app.use(vite.middlewares);
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "..", "dist", "public");
  
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory at ${distPath}. Did you run 'npm run build'?`
    );
  }

  app.use(express.static(distPath));
  
  // SPA fallback
  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
