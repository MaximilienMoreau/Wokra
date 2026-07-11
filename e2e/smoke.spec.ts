import { test, expect } from "@playwright/test";
import { createSignedInUser, deleteTestUser } from "./helpers/db";
import { signInAs } from "./helpers/auth";

test("signed-in fixture user can load the feed", async ({ page, context }) => {
  const { user, sessionToken } = await createSignedInUser({ handle: "e2e-smoke" });
  await signInAs(context, sessionToken);

  await page.goto("/feed");
  await expect(page.getByRole("heading", { name: `Salut, ${user.name}` })).toBeVisible();

  await deleteTestUser("e2e-smoke");
});
