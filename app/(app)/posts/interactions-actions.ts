"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { isPostLiked, likePost, unlikePost } from "@/lib/data/likes";
import { getPostById } from "@/lib/data/posts";
import { createComment, deleteComment, getCommentById } from "@/lib/data/comments";
import { createNotification } from "@/lib/data/notifications";

export type ActionState = { error?: string } | undefined;

const commentSchema = z.object({
  body: z
    .string()
    .min(1, "Le commentaire ne peut pas être vide.")
    .max(1000, "1000 caractères maximum."),
});

// Unlike the rest of the app's actions (which redirect after a mutation), these
// revalidate the calling page in place so a like/comment toggle feels instant
// instead of forcing a full navigation.

export async function toggleLikeAction(postId: string, pathname: string): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const post = await getPostById(postId);
  if (!post) return;

  const alreadyLiked = await isPostLiked(session.user.id, postId);
  if (alreadyLiked) {
    await unlikePost(session.user.id, postId);
  } else {
    await likePost(session.user.id, postId);
    await createNotification({
      recipientId: post.authorId,
      actorId: session.user.id,
      type: "POST_LIKE",
      postId,
    });
  }

  revalidatePath(pathname);
}

export async function createCommentAction(
  postId: string,
  pathname: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const post = await getPostById(postId);
  if (!post) {
    return { error: "Post introuvable." };
  }

  const parsed = commentSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  await createComment(postId, session.user.id, parsed.data.body);
  await createNotification({
    recipientId: post.authorId,
    actorId: session.user.id,
    type: "POST_COMMENT",
    postId,
  });

  revalidatePath(pathname);
}

export async function deleteCommentAction(commentId: string, pathname: string): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const comment = await getCommentById(commentId);
  if (!comment) return;

  const post = await getPostById(comment.postId);
  const canDelete = comment.authorId === session.user.id || post?.authorId === session.user.id;

  if (canDelete) {
    await deleteComment(commentId);
  }

  revalidatePath(pathname);
}
