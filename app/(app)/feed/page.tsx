import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { getFollowedFeed, getDiscoveryFeed } from "@/lib/data/feed";
import { Button } from "@/components/ui/button";
import { FeedItem } from "@/components/feed/feed-item";

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const [followedFeed, discoveryFeed] = await Promise.all([
    getFollowedFeed(session.user.id),
    getDiscoveryFeed(session.user.id),
  ]);

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/sign-in" });
  }

  return (
    <main id="main-content" className="mx-auto max-w-2xl space-y-10 px-4 py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Salut, {session.user.name}</h1>
          <Link
            href={`/profile/${session.user.handle}`}
            className="text-muted-foreground text-sm hover:underline"
          >
            @{session.user.handle}
          </Link>
        </div>
        <form action={handleSignOut}>
          <Button type="submit" variant="outline" size="sm" className="self-start">
            Se déconnecter
          </Button>
        </form>
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
            {followedFeed.map((artifact) => (
              <FeedItem key={artifact.id} artifact={artifact} />
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
            {" pour voir des artefacts pertinents ici."}
          </p>
        ) : (
          <div className="space-y-6">
            {discoveryFeed.map((artifact) => (
              <FeedItem key={artifact.id} artifact={artifact} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
