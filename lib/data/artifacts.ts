import { prisma } from "@/lib/prisma";
import type { ArtifactType } from "@prisma/client";

export function getArtifactById(id: string) {
  return prisma.artifact.findUnique({ where: { id } });
}

export type ArtifactInput = {
  type: ArtifactType;
  title: string;
  description: string;
  url: string;
  stack: string[];
};

export function createArtifact(userId: string, data: ArtifactInput) {
  return prisma.artifact.create({ data: { ...data, userId } });
}

export function updateArtifact(id: string, data: ArtifactInput) {
  return prisma.artifact.update({ where: { id }, data });
}

export function deleteArtifact(id: string) {
  return prisma.artifact.delete({ where: { id } });
}
