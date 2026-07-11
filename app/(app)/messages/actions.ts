"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { getUserByHandle } from "@/lib/data/users";
import { sendMessage } from "@/lib/data/messages";
import { isAllowed } from "@/lib/rate-limit";

const MESSAGE_LIMIT = { count: 30, windowMs: 60_000 };

const bodySchema = z.string().trim().min(1, "Le message est vide.").max(4000, "Trop long.");

export async function sendMessageAction(receiverHandle: string, formData: FormData): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const receiver = await getUserByHandle(receiverHandle);
  if (!receiver || receiver.id === session.user.id) {
    redirect("/messages");
  }

  const parsed = bodySchema.safeParse(formData.get("body"));
  if (!parsed.success) {
    redirect(`/messages/${receiverHandle}`);
  }

  if (!isAllowed(`message:${session.user.id}`, MESSAGE_LIMIT.count, MESSAGE_LIMIT.windowMs)) {
    redirect(`/messages/${receiverHandle}?error=rate-limited`);
  }

  await sendMessage(session.user.id, receiver.id, parsed.data);
  redirect(`/messages/${receiverHandle}`);
}
