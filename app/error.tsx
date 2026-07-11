"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <h1 className="text-2xl font-semibold">Quelque chose s&apos;est mal passé</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        Une erreur inattendue est survenue. Tu peux réessayer, ou revenir au feed.
      </p>
      <div className="flex gap-2">
        <Button onClick={reset} variant="default">
          Réessayer
        </Button>
        <Link href="/feed" className={buttonVariants({ variant: "outline" })}>
          Retour au feed
        </Link>
      </div>
    </main>
  );
}
