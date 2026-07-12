"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createPost, deletePost, getPostById } from "@/lib/data/posts";
import { getArtifactById } from "@/lib/data/artifacts";
import { uploadPostImage } from "@/lib/storage";
import { fetchLinkPreview } from "@/lib/link-preview";

export type ActionState = { error?: string } | undefined;

const postSchema = z.object({
  body: z.string().min(1, "Le post ne peut pas être vide.").max(3000, "3000 caractères maximum."),
  link: z.union([z.url("URL invalide."), z.literal("")]).optional(),
  sharedArtifactId: z.string().optional(),
});

export async function createPostAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const parsed = postSchema.safeParse({
    body: formData.get("body"),
    link: formData.get("link") || undefined,
    sharedArtifactId: formData.get("sharedArtifactId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const { body, link, sharedArtifactId } = parsed.data;
  const image = formData.get("image");
  const hasImage = image instanceof File && image.size > 0;

  if ([hasImage, Boolean(link), Boolean(sharedArtifactId)].filter(Boolean).length > 1) {
    return { error: "Choisis une seule pièce jointe : image, lien ou artefact partagé." };
  }

  if (sharedArtifactId) {
    const artifact = await getArtifactById(sharedArtifactId);
    if (!artifact) {
      return { error: "Artefact introuvable." };
    }
  }

  let imageUrl: string | null = null;
  if (hasImage) {
    try {
      imageUrl = await uploadPostImage(image as File);
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Échec de l'upload de l'image." };
    }
  }

  const preview = link ? await fetchLinkPreview(link) : null;

  const post = await createPost(session.user.id, {
    body,
    imageUrl,
    linkUrl: link || null,
    linkTitle: preview?.title ?? null,
    linkDescription: preview?.description ?? null,
    linkImageUrl: preview?.imageUrl ?? null,
    sharedArtifactId: sharedArtifactId || null,
  });

  // The feed never shows the viewer's own content (same as artifacts), so land on
  // the post's own page — the only place the author can see it right after posting.
  redirect(`/posts/${post.id}`);
}

export async function deletePostAction(postId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const post = await getPostById(postId);
  if (post && post.authorId === session.user.id) {
    await deletePost(postId);
  }

  redirect("/feed");
}
