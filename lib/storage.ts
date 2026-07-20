import { put } from "@vercel/blob";
import { env } from "@/lib/env";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function isImageUploadEnabled(): boolean {
  return Boolean(env.BLOB_READ_WRITE_TOKEN);
}

export async function uploadPostImage(file: File): Promise<string> {
  if (!env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Upload d'image indisponible pour le moment.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Le fichier doit être une image.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("Image trop volumineuse (5 Mo maximum).");
  }

  const blob = await put(`posts/${crypto.randomUUID()}-${file.name}`, file, {
    access: "public",
    token: env.BLOB_READ_WRITE_TOKEN,
  });

  return blob.url;
}
