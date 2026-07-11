import { prisma } from "@/lib/prisma";

export function getUserByHandle(handle: string) {
  return prisma.user.findUnique({
    where: { handle },
    include: {
      skills: { include: { skill: true } },
      interests: { include: { skill: true } },
      artifacts: { orderBy: { createdAt: "desc" } },
    },
  });
}

export async function isHandleTaken(handle: string, excludingUserId?: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { handle }, select: { id: true } });
  return Boolean(user && user.id !== excludingUserId);
}

export function setUserHandle(userId: string, handle: string) {
  return prisma.user.update({ where: { id: userId }, data: { handle } });
}

export function updateUserBio(userId: string, bio: string | null) {
  return prisma.user.update({ where: { id: userId }, data: { bio } });
}
