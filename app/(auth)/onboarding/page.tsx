import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { RESERVED_HANDLES } from "@/lib/handle";
import { isHandleTaken, setUserHandle } from "@/lib/data/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const handleSchema = z
  .string()
  .min(3, "3 caractères minimum.")
  .max(30, "30 caractères maximum.")
  .regex(/^[a-z0-9-]+$/, "Lettres minuscules, chiffres et tirets uniquement.")
  .refine((handle) => !RESERVED_HANDLES.has(handle), "Ce handle est réservé.");

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Format invalide : lettres minuscules, chiffres et tirets uniquement (3-30 caractères).",
  taken: "Ce handle est déjà pris.",
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }
  if (session.user.handle) {
    redirect("/feed");
  }

  const { error } = await searchParams;

  async function setHandle(formData: FormData) {
    "use server";
    const currentSession = await auth();
    if (!currentSession?.user) {
      redirect("/sign-in");
    }

    const parsed = handleSchema.safeParse(formData.get("handle"));
    if (!parsed.success) {
      redirect("/onboarding?error=invalid");
    }

    if (await isHandleTaken(parsed.data, currentSession.user.id)) {
      redirect("/onboarding?error=taken");
    }

    await setUserHandle(currentSession.user.id, parsed.data);
    redirect("/feed");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Choisis ton handle</h1>
          <p className="text-muted-foreground text-sm">
            C&apos;est l&apos;identifiant de ton profil public. Tu pourras le changer plus tard.
          </p>
        </div>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {ERROR_MESSAGES[error] ?? "Une erreur est survenue."}
          </p>
        )}

        <form action={setHandle} className="space-y-3">
          <Input
            type="text"
            name="handle"
            placeholder="ton-handle"
            pattern="[a-z0-9-]+"
            minLength={3}
            maxLength={30}
            required
          />
          <Button type="submit" className="w-full">
            Continuer
          </Button>
        </form>
      </div>
    </main>
  );
}
