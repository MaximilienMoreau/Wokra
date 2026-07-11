"use server";

import { redirect } from "next/navigation";
import { ArtifactType, VerificationMethod } from "@prisma/client";
import { auth } from "@/lib/auth";
import {
  getArtifactById,
  setArtifactVerificationToken,
  markArtifactVerified,
} from "@/lib/data/artifacts";
import { getGithubAccountId } from "@/lib/data/users";
import { verifyGithubRepoOwnership } from "@/lib/verification/github";
import {
  parseProductHostname,
  generateVerificationToken,
  verifyDnsTxtToken,
} from "@/lib/verification/dns";

async function requireOwnedArtifact(artifactId: string) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const artifact = await getArtifactById(artifactId);
  if (!artifact || artifact.userId !== session.user.id) {
    redirect("/feed");
  }

  return { session, artifact };
}

function redirectToProfile(handle: string, error?: string): never {
  const url = error
    ? `/profile/${handle}?verifyError=${encodeURIComponent(error)}`
    : `/profile/${handle}`;
  redirect(url);
}

export async function verifyGithubRepoAction(artifactId: string): Promise<void> {
  const { session, artifact } = await requireOwnedArtifact(artifactId);
  const handle = session.user.handle!;

  if (artifact.type !== ArtifactType.REPO) {
    redirectToProfile(handle, "Seuls les artefacts de type Repo se vérifient via GitHub.");
  }

  const githubAccountId = await getGithubAccountId(session.user.id);
  if (!githubAccountId) {
    redirectToProfile(handle, "Connecte-toi avec GitHub pour vérifier ce repo.");
  }

  const ok = await verifyGithubRepoOwnership(artifact.url, githubAccountId);
  if (!ok) {
    redirectToProfile(
      handle,
      "Impossible de confirmer que ce repo t'appartient (repo introuvable, privé, ou appartenant à quelqu'un d'autre).",
    );
  }

  await markArtifactVerified(artifactId, VerificationMethod.GITHUB_REPO);
  redirectToProfile(handle);
}

export async function startDnsVerificationAction(artifactId: string): Promise<void> {
  const { session, artifact } = await requireOwnedArtifact(artifactId);
  const handle = session.user.handle!;

  if (artifact.type !== ArtifactType.PRODUCT) {
    redirectToProfile(handle, "Seuls les artefacts de type Produit se vérifient via DNS.");
  }

  const hostname = parseProductHostname(artifact.url);
  if (!hostname) {
    redirectToProfile(handle, "URL invalide.");
  }

  await setArtifactVerificationToken(artifactId, generateVerificationToken());
  redirectToProfile(handle);
}

export async function confirmDnsVerificationAction(artifactId: string): Promise<void> {
  const { session, artifact } = await requireOwnedArtifact(artifactId);
  const handle = session.user.handle!;

  const hostname = parseProductHostname(artifact.url);
  if (!hostname || !artifact.verificationToken) {
    redirectToProfile(
      handle,
      "Lance d'abord la vérification pour obtenir un enregistrement à ajouter.",
    );
  }

  const ok = await verifyDnsTxtToken(hostname, artifact.verificationToken);
  if (!ok) {
    redirectToProfile(
      handle,
      "Enregistrement DNS introuvable. La propagation peut prendre quelques minutes — réessaie.",
    );
  }

  await markArtifactVerified(artifactId, VerificationMethod.DNS_TXT);
  redirectToProfile(handle);
}
