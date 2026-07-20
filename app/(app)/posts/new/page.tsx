import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getArtifactById } from "@/lib/data/artifacts";
import { isImageUploadEnabled } from "@/lib/storage";
import { PostForm } from "@/components/posts/post-form";
import { ArtifactCard } from "@/components/profile/artifact-card";
import { Label } from "@/components/ui/label";

export default async function NewPostPage({
  searchParams,
}: {
  searchParams: Promise<{ artifactId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const { artifactId } = await searchParams;
  const sharedArtifact = artifactId ? await getArtifactById(artifactId) : null;

  return (
    <main id="main-content" className="mx-auto max-w-lg space-y-8 px-4 py-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">
          {sharedArtifact ? "Partager cet artefact" : "Partager une mise à jour"}
        </h1>
        <p className="text-muted-foreground text-sm">
          Visible par tes followers et dans la découverte.
        </p>
      </div>

      <PostForm
        imageUploadEnabled={isImageUploadEnabled()}
        sharedArtifactPreview={
          sharedArtifact && (
            <div className="space-y-1.5">
              <Label>Artefact partagé</Label>
              <input type="hidden" name="sharedArtifactId" value={sharedArtifact.id} />
              <ArtifactCard artifact={sharedArtifact} isOwner={false} hideShare />
            </div>
          )
        }
      />
    </main>
  );
}
