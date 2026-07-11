"use client";

import { useActionState } from "react";
import { updateProfileAction, type ActionState } from "@/app/(app)/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ErrorBanner } from "@/components/ui/error-banner";

export function ProfileForm({
  defaultBio,
  defaultSkills,
  defaultInterests,
}: {
  defaultBio: string;
  defaultSkills: string;
  defaultInterests: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateProfileAction,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && <ErrorBanner>{state.error}</ErrorBanner>}

      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={defaultBio} maxLength={280} rows={4} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="skills">Compétences</Label>
        <Input
          id="skills"
          name="skills"
          defaultValue={defaultSkills}
          placeholder="React, PostgreSQL, Rust"
        />
        <p className="text-muted-foreground text-xs">Séparées par des virgules.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="interests">Centres d&apos;intérêt</Label>
        <Input
          id="interests"
          name="interests"
          defaultValue={defaultInterests}
          placeholder="Machine Learning, DevOps"
        />
        <p className="text-muted-foreground text-xs">
          Pour ton feed de découverte. Séparés par des virgules.
        </p>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
