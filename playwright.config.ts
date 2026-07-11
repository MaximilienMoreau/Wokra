import { defineConfig, devices } from "@playwright/test";

const TEST_DATABASE_URL = "postgresql://proof:proof@localhost:5432/proof_test";
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: "list",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: `http://localhost:${PORT}/sign-in`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      DATABASE_URL: TEST_DATABASE_URL,
      AUTH_SECRET: "e2e-test-secret-do-not-use-in-production",
      AUTH_GITHUB_ID: "",
      AUTH_GITHUB_SECRET: "",
      RESEND_API_KEY: "",
      EMAIL_FROM: "PROOF <onboarding@proof.dev>",
    },
  },
});

export { TEST_DATABASE_URL };
