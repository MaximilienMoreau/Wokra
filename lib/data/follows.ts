import { prisma } from "@/lib/prisma";

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const follow = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId, followingId } },
    select: { followerId: true },
  });
  return follow !== null;
}

export function followUser(followerId: string, followingId: string) {
  return prisma.follow.create({ data: { followerId, followingId } });
}

export function unfollowUser(followerId: string, followingId: string) {
  return prisma.follow.delete({
    where: { followerId_followingId: { followerId, followingId } },
  });
}

export async function getFollowedUserIds(userId: string): Promise<string[]> {
  const follows = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });
  return follows.map((f) => f.followingId);
}
