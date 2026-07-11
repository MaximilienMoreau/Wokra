import { test, expect } from "@playwright/test";
import { createSignedInUser, deleteTestUser } from "./helpers/db";
import { signInAs } from "./helpers/auth";

// octocat/Hello-World is a real, stable, public GitHub fixture repo — using it
// lets us exercise the real GitHub verification API call instead of mocking
// it. Requires network access to api.github.com; a CI environment without
// egress would need to mock lib/verification/github.ts instead.
const GITHUB_OWNER_ID = "583231";
const ARTIFACT_TITLE = "E2E Hello World";

test("author creates and verifies an artifact; a follower sees it in their feed", async ({
  browser,
}) => {
  const { user: author, sessionToken: authorToken } = await createSignedInUser({
    handle: "e2e-author",
    githubAccountId: GITHUB_OWNER_ID,
  });
  const { sessionToken: followerToken } = await createSignedInUser({
    handle: "e2e-follower",
  });

  const authorContext = await browser.newContext();
  await signInAs(authorContext, authorToken);
  const authorPage = await authorContext.newPage();

  // Create the artifact.
  await authorPage.goto("/profile/artifacts/new");
  await authorPage.getByLabel("Titre").fill(ARTIFACT_TITLE);
  await authorPage
    .getByLabel("Description")
    .fill("Repo created by the Playwright e2e suite to prove the full flow works.");
  await authorPage.getByLabel("URL").fill("https://github.com/octocat/Hello-World");
  await authorPage.getByLabel("Stack").fill("TypeScript");
  await authorPage.getByRole("button", { name: "Ajouter" }).click();

  await expect(authorPage).toHaveURL(`/profile/${author.handle}`);
  await expect(authorPage.getByRole("heading", { name: ARTIFACT_TITLE })).toBeVisible();

  // Verify it via the real GitHub API.
  await authorPage.getByRole("button", { name: "Vérifier via GitHub" }).click();
  await expect(authorPage.getByText("Vérifié")).toBeVisible();

  // A different user follows the author, then sees the artifact in their feed.
  const followerContext = await browser.newContext();
  await signInAs(followerContext, followerToken);
  const followerPage = await followerContext.newPage();

  await followerPage.goto(`/profile/${author.handle}`);
  await followerPage.getByRole("button", { name: "Suivre" }).click();
  await expect(followerPage.getByRole("button", { name: "Ne plus suivre" })).toBeVisible();

  await followerPage.goto("/feed");
  await expect(followerPage.getByRole("heading", { name: ARTIFACT_TITLE })).toBeVisible();
  await expect(followerPage.getByText("Vérifié")).toBeVisible();

  await authorContext.close();
  await followerContext.close();
  await deleteTestUser("e2e-author");
  await deleteTestUser("e2e-follower");
});
