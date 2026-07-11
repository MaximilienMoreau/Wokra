import Link from "next/link";
import { ArtifactType } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { deleteArtifactAction } from "@/app/(app)/profile/actions";
import {
  verifyGithubRepoAction,
  startDnsVerificationAction,
  confirmDnsVerificationAction,
} from "@/app/(app)/profile/verify-actions";
import { parseProductHostname, buildChallengeHostname } from "@/lib/verification/dns";

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
    verificationToken: string | null;
  };
  isOwner: boolean;
}) {
  const deleteWithId = deleteArtifactAction.bind(null, artifact.id);
  const verifyGithubWithId = verifyGithubRepoAction.bind(null, artifact.id);
  const startDnsWithId = startDnsVerificationAction.bind(null, artifact.id);
  const confirmDnsWithId = confirmDnsVerificationAction.bind(null, artifact.id);

  const hostname =
    artifact.type === ArtifactType.PRODUCT ? parseProductHostname(artifact.url) : null;

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
        <div className="flex flex-wrap gap-2 pt-1">
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

          {!artifact.verified && artifact.type === ArtifactType.REPO && (
            <form action={verifyGithubWithId}>
              <Button type="submit" variant="outline" size="sm">
                Vérifier via GitHub
              </Button>
            </form>
          )}

          {!artifact.verified &&
            artifact.type === ArtifactType.PRODUCT &&
            !artifact.verificationToken && (
              <form action={startDnsWithId}>
                <Button type="submit" variant="outline" size="sm">
                  Vérifier via DNS
                </Button>
              </form>
            )}
        </div>
      )}

      {isOwner && !artifact.verified && artifact.verificationToken && hostname && (
        <div className="space-y-2 rounded-md border border-dashed p-3 text-sm">
          <p>
            Ajoute cet enregistrement <strong>TXT</strong> chez ton fournisseur DNS, puis reviens
            vérifier :
          </p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 font-mono text-xs">
            <dt className="text-muted-foreground">Hôte</dt>
            <dd className="break-all">{buildChallengeHostname(hostname)}</dd>
            <dt className="text-muted-foreground">Valeur</dt>
            <dd className="break-all">{artifact.verificationToken}</dd>
          </dl>
          <p className="text-muted-foreground text-xs">
            La propagation DNS peut prendre quelques minutes.
          </p>
          <form action={confirmDnsWithId}>
            <Button type="submit" variant="outline" size="sm">
              J&apos;ai ajouté l&apos;enregistrement, vérifier
            </Button>
          </form>
        </div>
      )}
    </article>
  );
}
