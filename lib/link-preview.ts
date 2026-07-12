import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

const FETCH_TIMEOUT_MS = 5000;
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;

export type LinkPreview = {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
};

// Blocks loopback, private, and link-local ranges (incl. the cloud metadata IP
// 169.254.169.254) so a user-supplied URL can't be used to make the server
// fetch internal services (SSRF).
function isPrivateAddress(address: string): boolean {
  const version = isIP(address);
  if (version === 4) {
    const [a, b] = address.split(".").map(Number);
    return (
      a === 127 ||
      a === 10 ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 169 && b === 254) ||
      a === 0
    );
  }
  if (version === 6) {
    const normalized = address.toLowerCase();
    return (
      normalized === "::1" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80")
    );
  }
  return true;
}

async function assertPublicHttpUrl(rawUrl: string): Promise<URL> {
  const url = new URL(rawUrl);
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("URL non supportée.");
  }

  const hostname = url.hostname;
  if (hostname === "localhost") {
    throw new Error("URL non autorisée.");
  }

  const directIpVersion = isIP(hostname);
  if (directIpVersion !== 0) {
    if (isPrivateAddress(hostname)) throw new Error("URL non autorisée.");
    return url;
  }

  const resolved = await lookup(hostname, { all: true });
  if (resolved.some((entry) => isPrivateAddress(entry.address))) {
    throw new Error("URL non autorisée.");
  }

  return url;
}

function extractMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function extractTitleTag(html: string): string | null {
  return html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1]?.trim() ?? null;
}

/** Best-effort Open Graph preview for a user-supplied link. Returns null on any failure. */
export async function fetchLinkPreview(rawUrl: string): Promise<LinkPreview | null> {
  try {
    const url = await assertPublicHttpUrl(rawUrl);

    const response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
      headers: { Accept: "text/html" },
    });
    if (!response.ok) return null;

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) return null;

    const reader = response.body?.getReader();
    if (!reader) return null;

    let received = 0;
    let html = "";
    const decoder = new TextDecoder();
    while (received < MAX_RESPONSE_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      html += decoder.decode(value, { stream: true });
    }
    reader.cancel().catch(() => {});

    const title = extractMeta(html, "og:title") ?? extractTitleTag(html);
    const description = extractMeta(html, "og:description");
    const imageUrl = extractMeta(html, "og:image");

    if (!title && !description && !imageUrl) return null;

    return { title, description, imageUrl };
  } catch {
    return null;
  }
}
