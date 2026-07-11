import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getConversations } from "@/lib/data/messages";

export default async function MessagesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const conversations = await getConversations(session.user.id);

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-12">
      <h1 className="text-2xl font-semibold">Messages</h1>

      {conversations.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Aucune conversation pour l&apos;instant. Va sur un profil pour envoyer un message.
        </p>
      ) : (
        <div className="divide-y rounded-lg border">
          {conversations.map(({ partner, lastMessage, unreadCount }) => (
            <Link
              key={partner.id}
              href={`/messages/${partner.handle}`}
              className="hover:bg-muted/50 flex items-center gap-3 p-4"
            >
              {partner.image ? (
                <Image src={partner.image} alt="" width={40} height={40} className="rounded-full" />
              ) : (
                <span className="bg-muted size-10 shrink-0 rounded-full" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="truncate font-medium">{partner.name}</p>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(
                      lastMessage.createdAt,
                    )}
                  </span>
                </div>
                <p className="text-muted-foreground truncate text-sm">
                  {lastMessage.senderId === session.user.id ? "Toi : " : ""}
                  {lastMessage.body}
                </p>
              </div>
              {unreadCount > 0 && (
                <span className="bg-primary text-primary-foreground shrink-0 rounded-full px-2 py-0.5 text-xs">
                  {unreadCount}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
