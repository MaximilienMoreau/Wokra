import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getFollowedFeed, getDiscoveryFeed, type FeedEntry } from "@/lib/data/feed";
import { buttonVariants } from "@/components/ui/button";
import { FeedItem } from "@/components/feed/feed-item";

function entryKey(entry: FeedEntry) {
  return entry.kind === "artifact" ? `artifact-${entry.artifact.id}` : `post-${entry.post.id}`;
}

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const [followedFeed, discoveryFeed] = await Promise.all([
    getFollowedFeed(session.user.id),
    getDiscoveryFeed(session.user.id),
  ]);

  return (
    <main id="main-content" className="mx-auto max-w-2xl space-y-10 px-4 py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            Salut, {session.user.name ?? session.user.handle}
          </h1>
          <Link
            href={`/profile/${session.user.handle}`}
            className="text-muted-foreground text-sm hover:underline"
          >
            @{session.user.handle}
          </Link>
        </div>
        <Link href="/posts/new" className={buttonVariants({ variant: "default", size: "sm" })}>
          Partager une mise à jour
        </Link>
      </div>

      <section className="space-y-4">
        <h2 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          Suivis
        </h2>
        {followedFeed.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Tu ne suis personne pour l&apos;instant. Découvre des profils ci-dessous.
          </p>
        ) : (
          <div className="space-y-6">
            {followedFeed.map((entry) => (
              <FeedItem
                key={entryKey(entry)}
                entry={entry}
                viewerId={session.user.id}
                pathname="/feed"
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          Découverte
        </h2>
        {discoveryFeed.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {"Ajoute des centres d'intérêt à "}
            <Link href="/profile/edit" className="underline">
              ton profil
            </Link>
            {" pour voir du contenu pertinent ici."}
          </p>
        ) : (
          <div className="space-y-6">
            {discoveryFeed.map((entry) => (
              <FeedItem
                key={entryKey(entry)}
                entry={entry}
                viewerId={session.user.id}
                pathname="/feed"
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
