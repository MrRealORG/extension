import { defineConfig } from "@playwright/test";
import { launchOptions } from "./scripts/browser-runtime.mjs";
export default defineConfig({
  testDir: "./tests/browser",
  fullyParallel: false,
  workers: 1,
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:5173",
    viewport: { width: 1440, height: 1050 },
    headless: true,
    launchOptions,
    screenshot: "only-on-failure",
  },
  reporter: [["list"]],
  webServer: {
    command: "npm run dev -- --port 5173",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: true,
  },
});
