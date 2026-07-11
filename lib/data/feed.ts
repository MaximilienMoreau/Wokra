import { prisma } from "@/lib/prisma";
import { getFollowedUserIds } from "@/lib/data/follows";

const AUTHOR_SELECT = { id: true, handle: true, name: true, image: true } as const;

export async function getFollowedFeed(userId: string, limit = 20) {
  const followedIds = await getFollowedUserIds(userId);
  if (followedIds.length === 0) return [];

  return prisma.artifact.findMany({
    where: { userId: { in: followedIds } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: AUTHOR_SELECT } },
  });
}

/** Recent artifacts from people the user doesn't follow yet, matched by shared interests. */
export async function getDiscoveryFeed(userId: string, limit = 20) {
  const [followedIds, interests] = await Promise.all([
    getFollowedUserIds(userId),
    prisma.interest.findMany({ where: { userId }, select: { skillId: true } }),
  ]);

  const interestSkillIds = interests.map((interest) => interest.skillId);
  if (interestSkillIds.length === 0) return [];

  return prisma.artifact.findMany({
    where: {
      userId: { notIn: [...followedIds, userId] },
      user: { skills: { some: { skillId: { in: interestSkillIds } } } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: AUTHOR_SELECT } },
  });
}
