import Image from "next/image";
import Link from "next/link";
import type { FeedEntry } from "@/lib/data/feed";
import { ArtifactCard } from "@/components/profile/artifact-card";
import { PostCard } from "@/components/posts/post-card";

export function FeedItem({
  entry,
  viewerId,
  pathname,
}: {
  entry: FeedEntry;
  viewerId: string;
  pathname: string;
}) {
  const user = entry.kind === "artifact" ? entry.artifact.user : entry.post.author;
  if (!user.handle) return null;

  return (
    <div className="space-y-2">
      <Link href={`/profile/${user.handle}`} className="flex items-center gap-2 text-sm">
        {user.image ? (
          <Image src={user.image} alt="" width={24} height={24} className="rounded-full" />
        ) : (
          <span className="bg-muted size-6 rounded-full" />
        )}
        <span className="font-medium">{user.name ?? `@${user.handle}`}</span>
        <span className="text-muted-foreground">@{user.handle}</span>
      </Link>
      {entry.kind === "artifact" ? (
        <ArtifactCard artifact={entry.artifact} isOwner={false} />
      ) : (
        <PostCard
          post={entry.post}
          viewerId={viewerId}
          pathname={pathname}
          isOwner={entry.post.authorId === viewerId}
        />
      )}
    </div>
  );
}
