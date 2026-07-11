import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ArtifactForm } from "@/components/profile/artifact-form";
import { createArtifactAction } from "@/app/(app)/profile/actions";

export default async function NewArtifactPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  return (
    <main id="main-content" className="mx-auto max-w-lg space-y-8 px-4 py-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Ajouter un artefact</h1>
        <p className="text-muted-foreground text-sm">
          Un repo, un produit en ligne, une étude de cas ou une contribution. La vérification arrive
          après.
        </p>
      </div>

      <ArtifactForm action={createArtifactAction} submitLabel="Ajouter" />
    </main>
  );
}
