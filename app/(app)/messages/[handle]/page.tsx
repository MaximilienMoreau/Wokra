import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserByHandle } from "@/lib/data/users";
import { getConversationMessages, markConversationRead } from "@/lib/data/messages";
import { sendMessageAction } from "@/app/(app)/messages/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ERROR_MESSAGES: Record<string, string> = {
  "rate-limited": "Trop de messages envoyés d'un coup — attends une minute et réessaie.",
};

export default async function ConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const { handle } = await params;
  const { error } = await searchParams;

  const partner = await getUserByHandle(handle);
  if (!partner) {
    notFound();
  }
  if (partner.id === session.user.id) {
    redirect("/messages");
  }

  await markConversationRead(session.user.id, partner.id);
  const messages = await getConversationMessages(session.user.id, partner.id);
  const send = sendMessageAction.bind(null, handle);

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-12">
      <div className="space-y-1">
        <Link href="/messages" className="text-muted-foreground text-sm hover:underline">
          &larr; Messages
        </Link>
        <h1 className="text-xl font-semibold">
          <Link href={`/profile/${partner.handle}`} className="hover:underline">
            {partner.name}
          </Link>
        </h1>
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {ERROR_MESSAGES[error] ?? "Une erreur est survenue."}
        </p>
      )}

      <div className="space-y-3">
        {messages.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Aucun message avec {partner.name} pour l&apos;instant.
          </p>
        ) : (
          messages.map((message) => {
            const isMine = message.senderId === session.user.id;
            return (
              <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-lg px-3 py-2 text-sm ${
                    isMine ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.body}</p>
                  <p
                    className={`mt-1 text-xs ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}
                  >
                    {new Intl.DateTimeFormat("fr-FR", {
                      timeStyle: "short",
                      dateStyle: "short",
                    }).format(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form action={send} className="flex gap-2">
        <Textarea
          name="body"
          placeholder={`Écrire à ${partner.name}...`}
          required
          rows={2}
          className="flex-1"
        />
        <Button type="submit" className="self-end">
          Envoyer
        </Button>
      </form>
    </main>
  );
}
