import { prisma } from "@/lib/prisma";

export async function isPostLiked(userId: string, postId: string): Promise<boolean> {
  const like = await prisma.like.findUnique({
    where: { userId_postId: { userId, postId } },
    select: { userId: true },
  });
  return like !== null;
}

export function likePost(userId: string, postId: string) {
  return prisma.like.create({ data: { userId, postId } });
}

export function unlikePost(userId: string, postId: string) {
  return prisma.like.delete({ where: { userId_postId: { userId, postId } } });
}
