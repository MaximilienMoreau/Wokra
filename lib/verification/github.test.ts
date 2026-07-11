import { describe, expect, it } from "vitest";
import { parseGithubRepoUrl } from "./github";

describe("parseGithubRepoUrl", () => {
  it("extracts owner and repo from a github.com URL", () => {
    expect(parseGithubRepoUrl("https://github.com/vercel/next.js")).toEqual({
      owner: "vercel",
      repo: "next.js",
    });
  });

  it("strips a trailing .git suffix", () => {
    expect(parseGithubRepoUrl("https://github.com/vercel/next.js.git")).toEqual({
      owner: "vercel",
      repo: "next.js",
    });
  });

  it("strips trailing slashes and extra path segments", () => {
    expect(parseGithubRepoUrl("https://github.com/vercel/next.js/")).toEqual({
      owner: "vercel",
      repo: "next.js",
    });
  });

  it("returns null for non-GitHub hosts", () => {
    expect(parseGithubRepoUrl("https://gitlab.com/vercel/next.js")).toBeNull();
  });

  it("returns null when the path is missing an owner or repo", () => {
    expect(parseGithubRepoUrl("https://github.com/vercel")).toBeNull();
  });

  it("returns null for invalid URLs", () => {
    expect(parseGithubRepoUrl("not a url")).toBeNull();
  });
});
