import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { z } from "zod";
import { signIn } from "@/lib/auth";
import { env } from "@/lib/env";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ERROR_MESSAGES: Record<string, string> = {
  "invalid-email": "Adresse email invalide.",
  default: "Impossible de vous connecter. Réessaie.",
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  const { callbackUrl, error } = await searchParams;
  const redirectTo = callbackUrl ?? "/feed";
  const githubEnabled = Boolean(env.AUTH_GITHUB_ID);

  async function signInWithGithub() {
    "use server";
    await signIn("github", { redirectTo });
  }

  async function signInWithEmail(formData: FormData) {
    "use server";
    const parsed = z.email().safeParse(formData.get("email"));
    if (!parsed.success) {
      redirect(`/sign-in?error=invalid-email`);
    }

    try {
      await signIn("resend", { email: parsed.data, redirectTo });
    } catch (signInError) {
      if (signInError instanceof AuthError) {
        redirect(`/sign-in?error=${signInError.type}`);
      }
      throw signInError;
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-semibold">Se connecter à PROOF</h1>
          <p className="text-muted-foreground text-sm">
            Ton profil parle pour toi. Pas de mot de passe.
          </p>
        </div>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {ERROR_MESSAGES[error] ?? ERROR_MESSAGES.default}
          </p>
        )}

        {githubEnabled && (
          <form action={signInWithGithub}>
            <Button type="submit" className="w-full" variant="default">
              Continuer avec GitHub
            </Button>
          </form>
        )}

        {githubEnabled && (
          <div className="text-muted-foreground flex items-center gap-3 text-xs">
            <span className="bg-border h-px flex-1" />
            ou
            <span className="bg-border h-px flex-1" />
          </div>
        )}

        <form action={signInWithEmail} className="space-y-3">
          <Input type="email" name="email" placeholder="ton@email.com" required />
          <Button type="submit" className="w-full" variant="outline">
            Recevoir un lien de connexion
          </Button>
        </form>
      </div>
    </main>
  );
}
