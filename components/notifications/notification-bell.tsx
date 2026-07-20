"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import type { NotificationType } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { buttonVariants } from "@/components/ui/button";
import { NotificationItem } from "@/components/notifications/notification-item";

export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: {
    id: string;
    type: NotificationType;
    createdAt: Date;
    readAt: Date | null;
    actor: { handle: string | null; name: string | null; image: string | null };
    post: { id: string } | null;
  }[];
  unreadCount: number;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={buttonVariants({ variant: "ghost", size: "icon" })}
        aria-label="Notifications"
      >
        <span className="relative inline-flex">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground absolute -top-1.5 -right-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full px-0.5 text-[10px] leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="text-muted-foreground px-1.5 py-3 text-center text-sm">
            Rien pour l&apos;instant.
          </p>
        ) : (
          <div className="max-h-80 space-y-0.5 overflow-y-auto">
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        )}
        <DropdownMenuSeparator />
        <Link
          href="/notifications"
          className="hover:bg-accent block rounded-md px-1.5 py-1.5 text-center text-sm"
        >
          Voir tout
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
