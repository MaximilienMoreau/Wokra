import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

const ACTOR_SELECT = { id: true, handle: true, name: true, image: true } as const;

export type NotificationInput = {
  recipientId: string;
  actorId: string;
  type: NotificationType;
  postId?: string | null;
};

/** No-op when the actor is the recipient (e.g. liking your own post never notifies). */
export function createNotification(data: NotificationInput) {
  if (data.recipientId === data.actorId) return Promise.resolve(null);
  return prisma.notification.create({ data });
}

export function getNotificationsForUser(userId: string, limit = 20) {
  return prisma.notification.findMany({
    where: { recipientId: userId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: { select: ACTOR_SELECT },
      post: { select: { id: true } },
    },
  });
}

export function getUnreadNotificationCount(userId: string) {
  return prisma.notification.count({ where: { recipientId: userId, readAt: null } });
}

export function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { recipientId: userId, readAt: null },
    data: { readAt: new Date() },
  });
}
