import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

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
          <p className="text-muted-foreground text-sm">@{session.user.handle}</p>
        </div>
        <form action={handleSignOut}>
          <Button type="submit" variant="outline">
            Se déconnecter
          </Button>
        </form>
      </div>
      <p className="text-muted-foreground text-sm">
        Le feed (artefacts des profils suivis + découverte par tags) arrive au milestone 6.
      </p>
    </main>
  );
}
