import { prisma } from "@/lib/prisma";
import { getFollowedUserIds } from "@/lib/data/follows";
import { getFollowedPostsFeed, getDiscoveryPostsFeed } from "@/lib/data/posts";

const AUTHOR_SELECT = { id: true, handle: true, name: true, image: true } as const;

export type FeedEntry =
  | { kind: "artifact"; createdAt: Date; artifact: ArtifactFeedItem }
  | { kind: "post"; createdAt: Date; post: PostFeedItem };

type ArtifactFeedItem = Awaited<ReturnType<typeof getFollowedArtifactsFeed>>[number];
type PostFeedItem = Awaited<ReturnType<typeof getFollowedPostsFeed>>[number];

function getFollowedArtifactsFeed(userId: string, limit: number) {
  return getFollowedUserIds(userId).then((followedIds) => {
    if (followedIds.length === 0) return [];
    return prisma.artifact.findMany({
      where: { userId: { in: followedIds } },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: { user: { select: AUTHOR_SELECT } },
    });
  });
}

function getDiscoveryArtifactsFeed(userId: string, limit: number) {
  return Promise.all([
    getFollowedUserIds(userId),
    prisma.interest.findMany({ where: { userId }, select: { skillId: true } }),
  ]).then(([followedIds, interests]) => {
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
  });
}

function mergeByCreatedAt(
  artifacts: ArtifactFeedItem[],
  posts: PostFeedItem[],
  limit: number,
): FeedEntry[] {
  const entries: FeedEntry[] = [
    ...artifacts.map((artifact): FeedEntry => ({
      kind: "artifact",
      createdAt: artifact.createdAt,
      artifact,
    })),
    ...posts.map((post): FeedEntry => ({ kind: "post", createdAt: post.createdAt, post })),
  ];
  entries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return entries.slice(0, limit);
}

export async function getFollowedFeed(userId: string, limit = 20): Promise<FeedEntry[]> {
  const [artifacts, posts] = await Promise.all([
    getFollowedArtifactsFeed(userId, limit),
    getFollowedPostsFeed(userId, userId, limit),
  ]);
  return mergeByCreatedAt(artifacts, posts, limit);
}

/** Recent activity from people the user doesn't follow yet, matched by shared interests. */
export async function getDiscoveryFeed(userId: string, limit = 20): Promise<FeedEntry[]> {
  const [artifacts, posts] = await Promise.all([
    getDiscoveryArtifactsFeed(userId, limit),
    getDiscoveryPostsFeed(userId, userId, limit),
  ]);
  return mergeByCreatedAt(artifacts, posts, limit);
}
