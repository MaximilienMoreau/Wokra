import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getNotificationsForUser } from "@/lib/data/notifications";
import { NotificationItem } from "@/components/notifications/notification-item";
import { Button } from "@/components/ui/button";
import { markAllNotificationsReadAction } from "@/app/(app)/notifications/actions";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }

  const notifications = await getNotificationsForUser(session.user.id, 50);

  return (
    <main id="main-content" className="mx-auto max-w-lg space-y-6 px-4 py-12">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Notifications</h1>
        <form action={markAllNotificationsReadAction}>
          <Button type="submit" variant="outline" size="sm">
            Tout marquer comme lu
          </Button>
        </form>
      </div>

      {notifications.length === 0 ? (
        <p className="text-muted-foreground text-sm">Rien pour l&apos;instant.</p>
      ) : (
        <div className="space-y-1">
          {notifications.map((notification) => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>
      )}
    </main>
  );
}
