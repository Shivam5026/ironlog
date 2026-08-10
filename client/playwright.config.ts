import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  fullyParallel: false, // scenarios share the DB; keep serial per worker
  workers: 1,
  retries: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "npm run dev",
      url: "http://localhost:5173",
      reuseExistingServer: true,
      timeout: 120_000,
      cwd: ".",
    },
    {
      command: "npm run dev",
      url: "http://localhost:5000/api/auth/get-session",
      reuseExistingServer: true,
      timeout: 120_000,
      cwd: "../server",
    },
  ],
});
