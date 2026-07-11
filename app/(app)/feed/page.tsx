import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Button, buttonVariants } from "@/components/ui/button";

export default async function FeedPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/sign-in" });
  }

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Salut, {session.user.name}</h1>
          <Link
            href={`/profile/${session.user.handle}`}
            className="text-muted-foreground text-sm hover:underline"
          >
            @{session.user.handle}
          </Link>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/profile/${session.user.handle}`}
            className={buttonVariants({ variant: "outline" })}
          >
            Mon profil
          </Link>
          <form action={handleSignOut}>
            <Button type="submit" variant="outline">
              Se déconnecter
            </Button>
          </form>
        </div>
      </div>
      <p className="text-muted-foreground text-sm">
        Le feed (artefacts des profils suivis + découverte par tags) arrive au milestone 6.
      </p>
    </main>
  );
}
