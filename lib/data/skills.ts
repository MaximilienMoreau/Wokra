import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

/** Splits a free-text field ("React, Next.js, PostgreSQL") into trimmed, deduped names. */
export function parseSkillNames(raw: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const part of raw.split(",")) {
    const name = part.trim();
    if (!name) continue;
    const slug = slugify(name);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    names.push(name);
  }

  return names;
}

/** Finds or creates a Skill row for each name, matched by normalized slug. */
export async function resolveSkills(names: string[]) {
  return Promise.all(
    names.map((name) =>
      prisma.skill.upsert({
        where: { slug: slugify(name) },
        create: { slug: slugify(name), name },
        update: {},
      }),
    ),
  );
}

export async function setUserSkills(userId: string, skillNames: string[]) {
  const skills = await resolveSkills(skillNames);
  await prisma.$transaction([
    prisma.userSkill.deleteMany({ where: { userId } }),
    prisma.userSkill.createMany({
      data: skills.map((skill) => ({ userId, skillId: skill.id })),
      skipDuplicates: true,
    }),
  ]);
}

export async function setUserInterests(userId: string, skillNames: string[]) {
  const skills = await resolveSkills(skillNames);
  await prisma.$transaction([
    prisma.interest.deleteMany({ where: { userId } }),
    prisma.interest.createMany({
      data: skills.map((skill) => ({ userId, skillId: skill.id })),
      skipDuplicates: true,
    }),
  ]);
}
