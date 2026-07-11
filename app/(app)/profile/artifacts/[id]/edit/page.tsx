import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getArtifactById } from "@/lib/data/artifacts";
import { ArtifactForm } from "@/components/profile/artifact-form";
import { updateArtifactAction } from "@/app/(app)/profile/actions";

export default async function EditArtifactPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const artifact = await getArtifactById(id);
  if (!artifact || artifact.userId !== session.user.id) {
    notFound();
  }

  const action = updateArtifactAction.bind(null, artifact.id);

  return (
    <main className="mx-auto max-w-lg space-y-8 px-4 py-12">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Modifier l&apos;artefact</h1>
      </div>

      <ArtifactForm
        action={action}
        submitLabel="Enregistrer"
        defaultValues={{
          type: artifact.type,
          title: artifact.title,
          description: artifact.description,
          url: artifact.url,
          stack: artifact.stack.join(", "),
        }}
      />
    </main>
  );
}
