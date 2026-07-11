import { ArtifactType } from "@prisma/client";
import { searchArtifacts, searchUsers } from "@/lib/data/search";
import { FeedItem } from "@/components/feed/feed-item";
import { ProfileResult } from "@/components/search/profile-result";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const TYPE_LABELS: Record<ArtifactType, string> = {
  REPO: "Repo",
  PRODUCT: "Produit live",
  CASE_STUDY: "Étude de cas",
  CONTRIBUTION: "Contribution",
};

function isArtifactType(value: string | undefined): value is ArtifactType {
  return value != null && value in TYPE_LABELS;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; skill?: string }>;
}) {
  const { q, type, skill } = await searchParams;
  const validType = isArtifactType(type) ? type : undefined;
  const hasFilters = Boolean(q || validType || skill);

  const [users, artifacts] = hasFilters
    ? await Promise.all([
        searchUsers({ query: q, skill }),
        searchArtifacts({ query: q, type: validType, skill }),
      ])
    : [[], []];

  return (
    <main id="main-content" className="mx-auto max-w-2xl space-y-8 px-4 py-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Recherche</h1>
        <p className="text-muted-foreground text-sm">
          Profils et artefacts, ouverts à tous — pas besoin de compte pour chercher.
        </p>
      </div>

      {/* Native GET form: works without JS, produces a shareable/bookmarkable URL. */}
      <form method="get" className="flex flex-wrap gap-2">
        <Label htmlFor="q" className="sr-only">
          Mot-clé
        </Label>
        <Input
          id="q"
          type="search"
          name="q"
          defaultValue={q}
          placeholder="React, Rust, PostgreSQL..."
          className="min-w-48 flex-1"
        />
        <Label htmlFor="skill" className="sr-only">
          Compétence exacte
        </Label>
        <Input
          id="skill"
          type="text"
          name="skill"
          defaultValue={skill}
          placeholder="Compétence (ex: react)"
          className="w-48"
        />
        <Label htmlFor="type" className="sr-only">
          Type d&apos;artefact
        </Label>
        <select
          id="type"
          name="type"
          defaultValue={validType ?? ""}
          className="border-input h-8 rounded-lg border bg-transparent px-2.5 text-sm"
        >
          <option value="">Tous les types</option>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <Button type="submit">Chercher</Button>
      </form>

      {!hasFilters ? (
        <p className="text-muted-foreground text-sm">
          Lance une recherche par mot-clé, compétence, ou type d&apos;artefact.
        </p>
      ) : (
        <>
          <section className="space-y-4">
            <h2 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              Profils
            </h2>
            {users.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun profil trouvé.</p>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <ProfileResult key={user.id} user={user} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
              Artefacts
            </h2>
            {artifacts.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun artefact trouvé.</p>
            ) : (
              <div className="space-y-6">
                {artifacts.map((artifact) => (
                  <FeedItem key={artifact.id} artifact={artifact} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
