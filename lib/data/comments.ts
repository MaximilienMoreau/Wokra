import { prisma } from "@/lib/prisma";

const AUTHOR_SELECT = { id: true, handle: true, name: true, image: true } as const;

export function getCommentById(id: string) {
  return prisma.comment.findUnique({ where: { id } });
}

export function getCommentsForPost(postId: string) {
  return prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: { author: { select: AUTHOR_SELECT } },
  });
}

export function createComment(postId: string, authorId: string, body: string) {
  return prisma.comment.create({
    data: { postId, authorId, body },
    include: { author: { select: AUTHOR_SELECT } },
  });
}

export function deleteComment(id: string) {
  return prisma.comment.delete({ where: { id } });
}
