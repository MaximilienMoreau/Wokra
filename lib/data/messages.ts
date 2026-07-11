import { prisma } from "@/lib/prisma";

export type ConversationSummary = {
  partner: { id: string; handle: string; name: string; image: string | null };
  lastMessage: { body: string; createdAt: Date; senderId: string };
  unreadCount: number;
};

/** One row per person the user has exchanged messages with, most recent first. */
export async function getConversations(userId: string): Promise<ConversationSummary[]> {
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, handle: true, name: true, image: true } },
      receiver: { select: { id: true, handle: true, name: true, image: true } },
    },
  });

  const conversations = new Map<string, ConversationSummary>();

  for (const message of messages) {
    const partner = message.senderId === userId ? message.receiver : message.sender;
    if (!partner.handle) continue;

    const existing = conversations.get(partner.id);
    if (!existing) {
      conversations.set(partner.id, {
        partner: {
          id: partner.id,
          handle: partner.handle,
          name: partner.name,
          image: partner.image,
        },
        lastMessage: {
          body: message.body,
          createdAt: message.createdAt,
          senderId: message.senderId,
        },
        unreadCount: 0,
      });
    }

    if (message.receiverId === userId && message.readAt === null) {
      conversations.get(partner.id)!.unreadCount += 1;
    }
  }

  return [...conversations.values()];
}

export function getConversationMessages(userId: string, otherUserId: string) {
  return prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });
}

export function sendMessage(senderId: string, receiverId: string, body: string) {
  return prisma.message.create({ data: { senderId, receiverId, body } });
}

export function markConversationRead(userId: string, otherUserId: string) {
  return prisma.message.updateMany({
    where: { senderId: otherUserId, receiverId: userId, readAt: null },
    data: { readAt: new Date() },
  });
}
