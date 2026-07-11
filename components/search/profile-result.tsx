import Image from "next/image";
import Link from "next/link";

export function ProfileResult({
  user,
}: {
  user: { handle: string; name: string | null; bio: string | null; image: string | null };
}) {
  return (
    <Link
      href={`/profile/${user.handle}`}
      className="hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-4"
    >
      {user.image ? (
        <Image src={user.image} alt="" width={40} height={40} className="rounded-full" />
      ) : (
        <span className="bg-muted size-10 shrink-0 rounded-full" />
      )}
      <div className="min-w-0">
        <p className="font-medium">{user.name ?? `@${user.handle}`}</p>
        <p className="text-muted-foreground text-sm">@{user.handle}</p>
        {user.bio && <p className="text-muted-foreground mt-1 truncate text-sm">{user.bio}</p>}
      </div>
    </Link>
  );
}
