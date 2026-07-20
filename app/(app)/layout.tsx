import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { getNotificationsForUser, getUnreadNotificationCount } from "@/lib/data/notifications";
import { Button, buttonVariants } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/notification-bell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  const [notifications, unreadCount] = session?.user
    ? await Promise.all([
        getNotificationsForUser(session.user.id, 5),
        getUnreadNotificationCount(session.user.id),
      ])
    : [[], 0];

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/sign-in" });
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/feed" className="text-sm font-semibold">
            Wokra
          </Link>

          {session?.user && (
            <nav className="flex flex-1 items-center gap-4 text-sm">
              <Link href="/feed" className="hover:underline">
                Feed
              </Link>
              <Link href="/search" className="hover:underline">
                Recherche
              </Link>
              <Link href="/messages" className="hover:underline">
                Messages
              </Link>
              {session.user.handle && (
                <Link href={`/profile/${session.user.handle}`} className="hover:underline">
                  Profil
                </Link>
              )}
            </nav>
          )}

          <div className="flex items-center gap-2">
            {session?.user ? (
              <>
                <NotificationBell notifications={notifications} unreadCount={unreadCount} />
                <form action={handleSignOut}>
                  <Button type="submit" variant="outline" size="sm">
                    Se déconnecter
                  </Button>
                </form>
              </>
            ) : (
              <Link href="/sign-in" className={buttonVariants({ variant: "outline", size: "sm" })}>
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
