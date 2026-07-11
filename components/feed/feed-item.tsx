import Image from "next/image";
import Link from "next/link";
import type { ArtifactType } from "@prisma/client";
import { ArtifactCard } from "@/components/profile/artifact-card";

export function FeedItem({
  artifact,
}: {
  artifact: {
    id: string;
    type: ArtifactType;
    title: string;
    description: string;
    url: string;
    stack: string[];
    verified: boolean;
    verificationToken: string | null;
    user: { handle: string | null; name: string | null; image: string | null };
  };
}) {
  const { user } = artifact;
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
      <ArtifactCard artifact={artifact} isOwner={false} />
    </div>
  );
}
