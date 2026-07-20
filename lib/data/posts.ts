import { prisma } from "@/lib/prisma";
import { getFollowedUserIds } from "@/lib/data/follows";

const AUTHOR_SELECT = { id: true, handle: true, name: true, image: true } as const;

const SHARED_ARTIFACT_SELECT = {
  id: true,
  type: true,
  title: true,
  description: true,
  url: true,
  stack: true,
  verified: true,
  verificationToken: true,
} as const;

function postSelect(viewerId: string) {
  return {
    author: { select: AUTHOR_SELECT },
    sharedArtifact: { select: SHARED_ARTIFACT_SELECT },
    _count: { select: { likes: true, comments: true } },
    likes: { where: { userId: viewerId }, select: { userId: true } },
  } as const;
}

export function getPostById(id: string) {
  return prisma.post.findUnique({ where: { id } });
}

export function getPostWithDetails(id: string, viewerId: string) {
  return prisma.post.findUnique({ where: { id }, include: postSelect(viewerId) });
}

export type PostInput = {
  body: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  linkTitle?: string | null;
  linkDescription?: string | null;
  linkImageUrl?: string | null;
  sharedArtifactId?: string | null;
};

export function createPost(authorId: string, data: PostInput) {
  return prisma.post.create({ data: { ...data, authorId } });
}

export function deletePost(id: string) {
  return prisma.post.delete({ where: { id } });
}

export async function getFollowedPostsFeed(userId: string, viewerId: string, limit = 20) {
  const followedIds = await getFollowedUserIds(userId);
  if (followedIds.length === 0) return [];

  return prisma.post.findMany({
    where: { authorId: { in: followedIds } },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: postSelect(viewerId),
  });
}

/** Recent posts from people the user doesn't follow yet, matched by shared interests. */
export async function getDiscoveryPostsFeed(userId: string, viewerId: string, limit = 20) {
  const [followedIds, interests] = await Promise.all([
    getFollowedUserIds(userId),
    prisma.interest.findMany({ where: { userId }, select: { skillId: true } }),
  ]);

  const interestSkillIds = interests.map((interest) => interest.skillId);
  if (interestSkillIds.length === 0) return [];

  return prisma.post.findMany({
    where: {
      authorId: { notIn: [...followedIds, userId] },
      author: { skills: { some: { skillId: { in: interestSkillIds } } } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: postSelect(viewerId),
  });
}

export type PostWithDetails = Awaited<ReturnType<typeof getFollowedPostsFeed>>[number];
