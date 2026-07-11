"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="fr">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="text-2xl font-semibold">Quelque chose s&apos;est mal passé</h1>
        <p className="max-w-sm text-sm text-neutral-600">
          Une erreur inattendue est survenue. Recharge la page pour réessayer.
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-neutral-800"
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
