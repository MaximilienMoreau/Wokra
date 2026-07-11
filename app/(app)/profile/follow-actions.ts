"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { isFollowing, followUser, unfollowUser } from "@/lib/data/follows";

export async function followAction(targetUserId: string, targetHandle: string): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  if (session.user.id !== targetUserId && !(await isFollowing(session.user.id, targetUserId))) {
    await followUser(session.user.id, targetUserId);
  }

  redirect(`/profile/${targetHandle}`);
}

export async function unfollowAction(targetUserId: string, targetHandle: string): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  if (await isFollowing(session.user.id, targetUserId)) {
    await unfollowUser(session.user.id, targetUserId);
  }

  redirect(`/profile/${targetHandle}`);
}
