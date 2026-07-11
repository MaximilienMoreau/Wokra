import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

// First path segment after /profile/ that must not be claimable as a handle,
// since it would collide with an app route (e.g. /profile/edit).
export const RESERVED_HANDLES = new Set([
  "edit",
  "artifacts",
  "new",
  "settings",
  "api",
  "sign-in",
  "onboarding",
  "feed",
  "search",
  "messages",
  "user",
]);

export function slugifyHandle(input: string): string {
  const slug = slugify(input, 30);
  return slug && !RESERVED_HANDLES.has(slug) ? slug : "user";
}

export async function generateUniqueHandle(base: string): Promise<string> {
  const slug = slugifyHandle(base);

  let handle = slug;
  let suffix = 0;
  while (await prisma.user.findUnique({ where: { handle }, select: { id: true } })) {
    suffix += 1;
    handle = `${slug}-${suffix}`;
  }

  return handle;
}
