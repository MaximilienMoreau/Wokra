import { prisma } from "@/lib/prisma";
import { Prisma, ArtifactType } from "@prisma/client";

export type ArtifactSearchResult = {
  id: string;
  type: ArtifactType;
  title: string;
  description: string;
  url: string;
  stack: string[];
  verified: boolean;
  handle: string;
  name: string | null;
  image: string | null;
};

export async function searchArtifacts(params: {
  query?: string;
  type?: ArtifactType;
  skill?: string;
  limit?: number;
}) {
  const { query, type, skill, limit = 30 } = params;

  const rows = await prisma.$queryRaw<ArtifactSearchResult[]>`
    SELECT a.id, a.type, a.title, a.description, a.url, a.stack, a.verified,
           u.handle, u.name, u.image
    FROM "Artifact" a
    JOIN "User" u ON u.id = a."userId"
    WHERE u.handle IS NOT NULL
      ${query ? Prisma.sql`AND a."searchVector" @@ plainto_tsquery('simple', ${query})` : Prisma.empty}
      ${type ? Prisma.sql`AND a.type = ${type}::"ArtifactType"` : Prisma.empty}
      ${skill ? Prisma.sql`AND EXISTS (SELECT 1 FROM unnest(a.stack) tag WHERE tag ILIKE ${`%${skill}%`})` : Prisma.empty}
    ORDER BY a."createdAt" DESC
    LIMIT ${limit}
  `;

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    title: row.title,
    description: row.description,
    url: row.url,
    stack: row.stack,
    verified: row.verified,
    verificationToken: null as string | null,
    user: { handle: row.handle, name: row.name, image: row.image },
  }));
}

export type UserSearchResult = {
  id: string;
  handle: string;
  name: string | null;
  bio: string | null;
  image: string | null;
};

export async function searchUsers(params: { query?: string; skill?: string; limit?: number }) {
  const { query, skill, limit = 30 } = params;

  // No DISTINCT needed: Skill.slug is unique and UserSkill's PK is (userId, skillId),
  // so the join can match at most one row per user for an exact slug filter.
  return prisma.$queryRaw<UserSearchResult[]>`
    SELECT u.id, u.handle, u.name, u.bio, u.image
    FROM "User" u
    ${skill ? Prisma.sql`JOIN "UserSkill" us ON us."userId" = u.id JOIN "Skill" s ON s.id = us."skillId"` : Prisma.empty}
    WHERE u.handle IS NOT NULL
      ${query ? Prisma.sql`AND u."searchVector" @@ plainto_tsquery('simple', ${query})` : Prisma.empty}
      ${skill ? Prisma.sql`AND s.slug = ${skill}` : Prisma.empty}
    ORDER BY u."createdAt" DESC
    LIMIT ${limit}
  `;
}
