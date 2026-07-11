import Link from "next/link";
import { ArtifactType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { deleteArtifactAction } from "@/app/(app)/profile/actions";

const TYPE_LABELS: Record<ArtifactType, string> = {
  REPO: "Repo",
  PRODUCT: "Produit live",
  CASE_STUDY: "Étude de cas",
  CONTRIBUTION: "Contribution",
};

export function ArtifactCard({
  artifact,
  isOwner,
}: {
  artifact: {
    id: string;
    type: ArtifactType;
    title: string;
    description: string;
    url: string;
    stack: string[];
    verified: boolean;
  };
  isOwner: boolean;
}) {
  const deleteWithId = deleteArtifactAction.bind(null, artifact.id);

  return (
    <article className="space-y-3 rounded-lg border p-5">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{TYPE_LABELS[artifact.type]}</Badge>
          {artifact.verified && <Badge>Vérifié</Badge>}
        </div>
        <h3 className="text-lg font-medium">
          <a
            href={artifact.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {artifact.title}
          </a>
        </h3>
      </div>

      <p className="text-muted-foreground text-sm">{artifact.description}</p>

      {artifact.stack.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {artifact.stack.map((tech) => (
            <Badge key={tech} variant="outline">
              {tech}
            </Badge>
          ))}
        </div>
      )}

      {isOwner && (
        <div className="flex gap-2 pt-1">
          <Link
            href={`/profile/artifacts/${artifact.id}/edit`}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Modifier
          </Link>
          <form action={deleteWithId}>
            <Button type="submit" variant="outline" size="sm">
              Supprimer
            </Button>
          </form>
        </div>
      )}
    </article>
  );
}
