import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { createReadStream, existsSync } from "node:fs";
import { resolve } from "node:path";
const downloads = {
  name: "dream-downloads",
  configureServer(server) {
    server.middlewares.use("/downloads/", (req, res, next) => {
      const name = req.url?.split("?")[0]?.replace(/^\//, "");
      if (!["dream-chromium.zip", "dream-firefox.zip"].includes(name))
        return next();
      const path = resolve("artifacts", name);
      if (!existsSync(path)) {
        res.statusCode = 404;
        res.end("Run npm run build to create extension packages.");
        return;
      }
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
      createReadStream(path).pipe(res);
    });
  },
};
export default defineConfig({
  plugins: [react(), downloads],
  base: "./",
  server: { host: "0.0.0.0", allowedHosts: true },
  build: { outDir: "dist/chromium" },
});
