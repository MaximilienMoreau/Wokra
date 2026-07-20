import { describe, expect, it, vi, afterEach } from "vitest";
import { fetchLinkPreview } from "./link-preview";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("fetchLinkPreview", () => {
  it("parses Open Graph tags from the response HTML", async () => {
    const html = `<html><head>
      <meta property="og:title" content="Nice article" />
      <meta property="og:description" content="A description." />
      <meta property="og:image" content="https://example.com/img.png" />
    </head></html>`;
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(html, { status: 200, headers: { "content-type": "text/html" } }),
        ),
    );

    const preview = await fetchLinkPreview("http://93.184.216.34/article");

    expect(preview).toEqual({
      title: "Nice article",
      description: "A description.",
      imageUrl: "https://example.com/img.png",
    });
  });

  it("falls back to <title> when og:title is missing", async () => {
    const html = `<html><head><title>Fallback title</title></head></html>`;
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(html, { status: 200, headers: { "content-type": "text/html" } }),
        ),
    );

    const preview = await fetchLinkPreview("http://93.184.216.34/article");

    expect(preview?.title).toBe("Fallback title");
  });

  it("returns null when the response isn't HTML", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response("{}", { status: 200, headers: { "content-type": "application/json" } }),
        ),
    );

    expect(await fetchLinkPreview("http://93.184.216.34/data.json")).toBeNull();
  });

  it("returns null when the fetch fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));

    expect(await fetchLinkPreview("http://93.184.216.34/")).toBeNull();
  });

  it.each([
    ["loopback", "http://127.0.0.1/"],
    ["localhost hostname", "http://localhost/"],
    ["private class A", "http://10.0.0.5/"],
    ["private class B", "http://172.16.0.5/"],
    ["private class C", "http://192.168.1.5/"],
    ["cloud metadata IP", "http://169.254.169.254/latest/meta-data/"],
    ["IPv6 loopback", "http://[::1]/"],
    ["non-http protocol", "ftp://example.com/"],
  ])("rejects %s (SSRF guard)", async (_label, url) => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    expect(await fetchLinkPreview(url)).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
