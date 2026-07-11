import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <h1 className="text-2xl font-semibold">Page introuvable</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        Ce profil, cet artefact ou cette page n&apos;existe pas — ou plus.
      </p>
      <Link href="/feed" className={buttonVariants({ variant: "default" })}>
        Retour au feed
      </Link>
    </main>
  );
}
