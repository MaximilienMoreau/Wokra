import type { BrowserContext } from "@playwright/test";

/** Injects an Auth.js database-session cookie directly, skipping real sign-in. */
export async function signInAs(context: BrowserContext, sessionToken: string) {
  await context.addCookies([
    {
      name: "authjs.session-token",
      value: sessionToken,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}
