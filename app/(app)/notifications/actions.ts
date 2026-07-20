"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { markAllNotificationsRead } from "@/lib/data/notifications";

export async function markAllNotificationsReadAction(): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  await markAllNotificationsRead(session.user.id);
  revalidatePath("/notifications");
}
