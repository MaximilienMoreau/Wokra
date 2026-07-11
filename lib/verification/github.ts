/** Extracts { owner, repo } from a github.com URL, or null if it isn't one. */
export function parseGithubRepoUrl(url: string): { owner: string; repo: string } | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.hostname !== "github.com" && parsed.hostname !== "www.github.com") {
    return null;
  }

  const [owner, repo] = parsed.pathname.replace(/^\/+/, "").replace(/\/+$/, "").split("/");
  if (!owner || !repo) {
    return null;
  }

  return { owner, repo: repo.replace(/\.git$/, "") };
}

/** Fetches a public repo's numeric owner id from the GitHub API. Null if not found/private. */
export async function fetchGithubRepoOwnerId(owner: string, repo: string): Promise<string | null> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: { Accept: "application/vnd.github+json" },
  });

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as { owner?: { id?: number } };
  return data.owner?.id != null ? String(data.owner.id) : null;
}

/** True if `githubAccountId` (Account.providerAccountId for provider "github") owns the repo at `url`. */
export async function verifyGithubRepoOwnership(
  url: string,
  githubAccountId: string,
): Promise<boolean> {
  const parsed = parseGithubRepoUrl(url);
  if (!parsed) return false;

  const ownerId = await fetchGithubRepoOwnerId(parsed.owner, parsed.repo);
  return ownerId !== null && ownerId === githubAccountId;
}
