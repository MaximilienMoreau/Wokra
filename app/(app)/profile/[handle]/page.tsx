import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserByHandle } from "@/lib/data/users";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ArtifactCard } from "@/components/profile/artifact-card";

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ verifyError?: string }>;
}) {
  const { handle } = await params;
  const [user, session, { verifyError }] = await Promise.all([
    getUserByHandle(handle),
    auth(),
    searchParams,
  ]);

  if (!user) {
    notFound();
  }

  const isOwner = session?.user?.id === user.id;

  return (
    <main className="mx-auto max-w-2xl space-y-8 px-4 py-12">
      {verifyError && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {verifyError}
        </p>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">{user.name}</h1>
          <p className="text-muted-foreground text-sm">@{user.handle}</p>
          {user.bio && <p className="text-sm leading-relaxed">{user.bio}</p>}
          {user.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {user.skills.map(({ skill }) => (
                <Badge key={skill.id} variant="secondary">
                  {skill.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {isOwner && (
          <div className="flex shrink-0 flex-col gap-2">
            <Link
              href="/profile/edit"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Modifier le profil
            </Link>
            <Link
              href="/profile/artifacts/new"
              className={buttonVariants({ variant: "default", size: "sm" })}
            >
              Ajouter un artefact
            </Link>
          </div>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
          Artefacts
        </h2>
        {user.artifacts.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            {isOwner
              ? "Ajoute ton premier artefact pour montrer ce que tu as fait."
              : "Aucun artefact pour l'instant."}
          </p>
        ) : (
          <div className="space-y-4">
            {user.artifacts.map((artifact) => (
              <ArtifactCard key={artifact.id} artifact={artifact} isOwner={isOwner} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
