"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { ArtifactType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { updateUserBio } from "@/lib/data/users";
import { setUserSkills, setUserInterests, parseSkillNames } from "@/lib/data/skills";
import {
  createArtifact,
  updateArtifact,
  deleteArtifact,
  getArtifactById,
} from "@/lib/data/artifacts";

export type ActionState = { error?: string } | undefined;

const profileSchema = z.object({
  bio: z.string().max(280, "280 caractères maximum.").optional(),
  skills: z.string().max(500, "500 caractères maximum.").optional(),
  interests: z.string().max(500, "500 caractères maximum.").optional(),
});

export async function updateProfileAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const parsed = profileSchema.safeParse({
    bio: formData.get("bio"),
    skills: formData.get("skills"),
    interests: formData.get("interests"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  await updateUserBio(session.user.id, parsed.data.bio || null);
  await setUserSkills(session.user.id, parseSkillNames(parsed.data.skills ?? ""));
  await setUserInterests(session.user.id, parseSkillNames(parsed.data.interests ?? ""));

  redirect(`/profile/${session.user.handle}`);
}

const artifactSchema = z.object({
  type: z.enum(ArtifactType),
  title: z.string().min(3, "3 caractères minimum.").max(120, "120 caractères maximum."),
  description: z.string().min(10, "10 caractères minimum.").max(2000, "2000 caractères maximum."),
  url: z.url("URL invalide."),
  stack: z.string().max(300, "300 caractères maximum.").optional(),
});

function parseArtifactForm(formData: FormData) {
  return artifactSchema.safeParse({
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description"),
    url: formData.get("url"),
    stack: formData.get("stack"),
  });
}

export async function createArtifactAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const parsed = parseArtifactForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  await createArtifact(session.user.id, {
    type: parsed.data.type,
    title: parsed.data.title,
    description: parsed.data.description,
    url: parsed.data.url,
    stack: parseSkillNames(parsed.data.stack ?? ""),
  });

  redirect(`/profile/${session.user.handle}`);
}

export async function updateArtifactAction(
  artifactId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const artifact = await getArtifactById(artifactId);
  if (!artifact || artifact.userId !== session.user.id) {
    return { error: "Artefact introuvable." };
  }

  const parsed = parseArtifactForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  await updateArtifact(artifactId, {
    type: parsed.data.type,
    title: parsed.data.title,
    description: parsed.data.description,
    url: parsed.data.url,
    stack: parseSkillNames(parsed.data.stack ?? ""),
  });

  redirect(`/profile/${session.user.handle}`);
}

export async function deleteArtifactAction(artifactId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const artifact = await getArtifactById(artifactId);
  if (artifact && artifact.userId === session.user.id) {
    await deleteArtifact(artifactId);
  }

  redirect(`/profile/${session.user.handle}`);
}
