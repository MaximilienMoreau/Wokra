"use client";

import { useActionState } from "react";
import { createCommentAction, type ActionState } from "@/app/(app)/posts/interactions-actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ErrorBanner } from "@/components/ui/error-banner";

export function CommentForm({ postId, pathname }: { postId: string; pathname: string }) {
  const action = createCommentAction.bind(null, postId, pathname);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-2">
      {state?.error && <ErrorBanner>{state.error}</ErrorBanner>}
      <Textarea
        name="body"
        required
        rows={2}
        maxLength={1000}
        placeholder="Écrire un commentaire..."
        aria-label="Commentaire"
      />
      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Envoi..." : "Envoyer"}
      </Button>
    </form>
  );
}
