import { prisma } from "@/lib/prisma";

const COMBINING_MARK_RANGE = { start: 0x0300, end: 0x036f };

function stripDiacritics(input: string): string {
  return Array.from(input.normalize("NFD"))
    .filter((char) => {
      const code = char.codePointAt(0) ?? 0;
      return code < COMBINING_MARK_RANGE.start || code > COMBINING_MARK_RANGE.end;
    })
    .join("");
}

export function slugifyHandle(input: string): string {
  const slug = stripDiacritics(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);

  return slug || "user";
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
