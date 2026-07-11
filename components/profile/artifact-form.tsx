"use client";

import { useActionState } from "react";
import { ArtifactType } from "@prisma/client";
import type { ActionState } from "@/app/(app)/profile/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ErrorBanner } from "@/components/ui/error-banner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TYPE_LABELS: Record<ArtifactType, string> = {
  REPO: "Repo",
  PRODUCT: "Produit live",
  CASE_STUDY: "Étude de cas",
  CONTRIBUTION: "Contribution",
};

export function ArtifactForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    type: ArtifactType;
    title: string;
    description: string;
    url: string;
    stack: string;
  };
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error && <ErrorBanner>{state.error}</ErrorBanner>}

      <div className="space-y-1.5">
        <Label htmlFor="type">Type</Label>
        <Select name="type" defaultValue={defaultValues?.type ?? ArtifactType.REPO}>
          <SelectTrigger id="type" className="w-full">
            <SelectValue>{(value: ArtifactType) => TYPE_LABELS[value]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Object.values(ArtifactType).map((type) => (
              <SelectItem key={type} value={type}>
                {TYPE_LABELS[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Titre</Label>
        <Input
          id="title"
          name="title"
          defaultValue={defaultValues?.title}
          required
          maxLength={120}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaultValues?.description}
          required
          rows={5}
          maxLength={2000}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          name="url"
          type="url"
          defaultValue={defaultValues?.url}
          required
          placeholder="https://github.com/..."
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="stack">Stack</Label>
        <Input
          id="stack"
          name="stack"
          defaultValue={defaultValues?.stack}
          placeholder="TypeScript, Next.js, PostgreSQL"
        />
        <p className="text-muted-foreground text-xs">Séparée par des virgules.</p>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement..." : submitLabel}
      </Button>
    </form>
  );
}
