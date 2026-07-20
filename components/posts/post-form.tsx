"use client";

import { useActionState } from "react";
import { createPostAction, type ActionState } from "@/app/(app)/posts/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ErrorBanner } from "@/components/ui/error-banner";

export function PostForm({
  sharedArtifactPreview,
  imageUploadEnabled,
}: {
  // Rendered server-side by the caller (which owns the artifact data) rather than
  // this component fetching/rendering it — ArtifactCard pulls in server-only code
  // (lib/verification/dns.ts uses node:crypto) that can't be part of a client bundle.
  sharedArtifactPreview?: React.ReactNode;
  imageUploadEnabled: boolean;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createPostAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && <ErrorBanner>{state.error}</ErrorBanner>}

      <div className="space-y-1.5">
        <Label htmlFor="body">Ton message</Label>
        <Textarea
          id="body"
          name="body"
          required
          rows={5}
          maxLength={3000}
          placeholder="Partage une mise à jour, un apprentissage, une victoire..."
        />
      </div>

      {sharedArtifactPreview ?? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              name="image"
              type="file"
              accept="image/*"
              disabled={!imageUploadEnabled}
            />
            {!imageUploadEnabled && (
              <p className="text-muted-foreground text-xs">
                Upload d&apos;image indisponible pour le moment.
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="link">Lien</Label>
            <Input id="link" name="link" type="url" placeholder="https://..." />
            <p className="text-muted-foreground text-xs">
              Un aperçu sera généré automatiquement si possible.
            </p>
          </div>
        </>
      )}

      <Button type="submit" disabled={pending}>
        {pending ? "Publication..." : "Publier"}
      </Button>
    </form>
  );
}
