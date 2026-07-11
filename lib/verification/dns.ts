import { resolveTxt } from "node:dns/promises";
import { randomBytes } from "node:crypto";

const CHALLENGE_SUBDOMAIN = "_proof-verify";

/** Extracts the hostname to challenge from a product URL, or null if invalid. */
export function parseProductHostname(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function buildChallengeHostname(hostname: string): string {
  return `${CHALLENGE_SUBDOMAIN}.${hostname}`;
}

export function generateVerificationToken(): string {
  return randomBytes(16).toString("hex");
}

/** True if any TXT record at the challenge subdomain contains `token`. */
export function txtRecordsContainToken(records: string[][], token: string): boolean {
  return records.some((chunks) => chunks.join("").trim() === token);
}

export async function verifyDnsTxtToken(hostname: string, token: string): Promise<boolean> {
  try {
    const records = await resolveTxt(buildChallengeHostname(hostname));
    return txtRecordsContainToken(records, token);
  } catch {
    return false;
  }
}
