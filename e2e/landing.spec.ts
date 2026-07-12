import { test, expect } from "@playwright/test";
import { createSignedInUser, deleteTestUser } from "./helpers/db";
import { signInAs } from "./helpers/auth";

test("logged-out visitor sees the public landing page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: /Montre ton travail/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Créer mon profil" }).first()).toHaveAttribute(
    "href",
    "/sign-in",
  );
});

test("signed-in user hitting / is redirected straight to /feed", async ({ page, context }) => {
  const { sessionToken } = await createSignedInUser({ handle: "e2e-landing" });
  await signInAs(context, sessionToken);

  await page.goto("/");
  await expect(page).toHaveURL("/feed");

  await deleteTestUser("e2e-landing");
});
