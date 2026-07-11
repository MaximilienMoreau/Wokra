import { execSync } from "node:child_process";
import { TEST_DATABASE_URL } from "../playwright.config";

/**
 * Applies pending migrations to the dedicated e2e database (proof_test) before
 * any test runs. Never touches the dev database (proof) — separate DB, separate
 * URL, no shared state with `npm run dev`.
 */
export default function globalSetup() {
  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: "inherit",
  });
}
