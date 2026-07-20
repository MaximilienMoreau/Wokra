import { test, expect } from "@playwright/test";
import { createSignedInUser, deleteTestUser } from "./helpers/db";
import { signInAs } from "./helpers/auth";

const POST_BODY = "E2E test post — sharing a quick update.";
const COMMENT_BODY = "Bien joué !";

test("author publishes a post; a follower likes and comments; the author sees notifications", async ({
  browser,
}) => {
  // Generous overall budget: several steps navigate to routes Next dev may not have compiled yet.
  test.setTimeout(60000);

  const { user: author, sessionToken: authorToken } = await createSignedInUser({
    handle: "e2e-post-author",
  });
  const { sessionToken: followerToken } = await createSignedInUser({
    handle: "e2e-post-follower",
  });

  const authorContext = await browser.newContext();
  await signInAs(authorContext, authorToken);
  const authorPage = await authorContext.newPage();

  // Author publishes a plain text post.
  await authorPage.goto("/posts/new");
  await authorPage.getByLabel("Ton message").fill(POST_BODY);
  await authorPage.getByRole("button", { name: "Publier" }).click();

  // Generous timeout: this redirect can land on a route Next dev hasn't compiled yet.
  // The id-specific pattern (vs. plain /posts\/.+/) avoids matching /posts/new itself.
  await expect(authorPage).toHaveURL(/\/posts\/[a-zA-Z0-9]{20,}$/, { timeout: 15000 });
  await expect(authorPage.getByText(POST_BODY)).toBeVisible();

  // A follower follows the author, then sees the post in their feed.
  const followerContext = await browser.newContext();
  await signInAs(followerContext, followerToken);
  const followerPage = await followerContext.newPage();

  await followerPage.goto(`/profile/${author.handle}`);
  await followerPage.getByRole("button", { name: "Suivre" }).click();
  await expect(followerPage.getByRole("button", { name: "Ne plus suivre" })).toBeVisible({
    timeout: 15000,
  });

  await followerPage.goto("/feed");
  const postArticle = followerPage.locator("article", { hasText: POST_BODY });
  await expect(postArticle).toBeVisible({ timeout: 15000 });

  // The follower likes the post.
  await postArticle.getByRole("button", { name: "Aimer" }).click();
  await expect(postArticle.getByRole("button", { name: "Ne plus aimer" })).toBeVisible();

  // The follower comments on the post.
  await postArticle.getByText("Commenter").click();
  await postArticle.getByLabel("Commentaire").fill(COMMENT_BODY);
  await postArticle.getByRole("button", { name: "Envoyer" }).click();
  await expect(postArticle.getByText(COMMENT_BODY)).toBeVisible();

  // The author sees both events in their notifications.
  await authorPage.goto("/notifications");
  await expect(authorPage.getByText("a aimé votre post.")).toBeVisible();
  await expect(authorPage.getByText("a commenté votre post.")).toBeVisible();

  await authorContext.close();
  await followerContext.close();
  await deleteTestUser("e2e-post-author");
  await deleteTestUser("e2e-post-follower");
});
