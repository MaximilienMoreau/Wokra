import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { randomUUID } from "node:crypto";
import { TEST_DATABASE_URL } from "../../playwright.config";

const adapter = new PrismaPg(TEST_DATABASE_URL);
export const testDb = new PrismaClient({ adapter });

/**
 * Creates a signed-in-and-onboarded user (bypasses real GitHub OAuth / magic
 * link — neither is drivable in an automated test without real credentials
 * or an email inbox) and returns the session cookie value to inject into a
 * browser context.
 */
export async function createSignedInUser(options: {
  handle: string;
  name?: string;
  githubAccountId?: string;
}) {
  await testDb.user.deleteMany({ where: { handle: options.handle } });

  const user = await testDb.user.create({
    data: {
      handle: options.handle,
      name: options.name ?? options.handle,
      email: `${options.handle}@e2e.test`,
      emailVerified: new Date(),
      accounts: options.githubAccountId
        ? {
            create: {
              type: "oauth",
              provider: "github",
              providerAccountId: options.githubAccountId,
            },
          }
        : undefined,
    },
  });

  const sessionToken = randomUUID();
  await testDb.session.create({
    data: { sessionToken, userId: user.id, expires: new Date(Date.now() + 1000 * 60 * 60) },
  });

  return { user, sessionToken };
}

export async function deleteTestUser(handle: string) {
  await testDb.user.deleteMany({ where: { handle } });
}
