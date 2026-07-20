import Image from "next/image";
import Link from "next/link";
import type { NotificationType } from "@prisma/client";

const MESSAGES: Record<NotificationType, string> = {
  FOLLOW: "vous suit.",
  POST_LIKE: "a aimé votre post.",
  POST_COMMENT: "a commenté votre post.",
};

export function NotificationItem({
  notification,
}: {
  notification: {
    id: string;
    type: NotificationType;
    readAt: Date | null;
    actor: { handle: string | null; name: string | null; image: string | null };
    post: { id: string } | null;
  };
}) {
  const { actor } = notification;
  if (!actor.handle) return null;

  const href = notification.post ? `/posts/${notification.post.id}` : `/profile/${actor.handle}`;
  const actorName = actor.name ?? `@${actor.handle}`;

  return (
    <Link
      href={href}
      className="hover:bg-accent flex items-center gap-2.5 rounded-md px-1.5 py-2 text-sm"
    >
      {actor.image ? (
        <Image src={actor.image} alt="" width={28} height={28} className="rounded-full" />
      ) : (
        <span className="bg-muted size-7 shrink-0 rounded-full" />
      )}
      <span className="flex-1">
        <span className="font-medium">{actorName}</span> {MESSAGES[notification.type]}
      </span>
      {!notification.readAt && <span className="bg-primary size-2 shrink-0 rounded-full" />}
    </Link>
  );
}
