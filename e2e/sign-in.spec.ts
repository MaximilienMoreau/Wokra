import { test, expect } from "@playwright/test";

// Real GitHub OAuth and real email delivery aren't drivable in an automated
// test (no test GitHub account, no email inbox to read). This instead proves
// the actual code path our own logic controls: the magic-link Server Action
// validates the email, calls signIn("resend", ...), and Auth.js redirects to
// its confirmation page — without needing RESEND_API_KEY (dev fallback logs
// the link instead of sending it, see lib/auth.ts).
test.describe("sign-in", () => {
  test("renders the sign-in form", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("heading", { name: "Se connecter à Wokra" })).toBeVisible();
    await expect(page.getByLabel("Adresse email")).toBeVisible();
  });

  test("submitting the magic-link form redirects to the check-your-email confirmation", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await page.getByLabel("Adresse email").fill("e2e-magic-link@example.com");
    await page.getByRole("button", { name: "Recevoir un lien de connexion" }).click();

    await expect(page).toHaveURL(/\/api\/auth\/verify-request/);
    await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  });
});
