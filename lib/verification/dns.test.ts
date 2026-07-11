import { describe, expect, it } from "vitest";
import { buildChallengeHostname, txtRecordsContainToken, parseProductHostname } from "./dns";

describe("parseProductHostname", () => {
  it("extracts the hostname from a URL", () => {
    expect(parseProductHostname("https://myapp.example.com/pricing")).toBe("myapp.example.com");
  });

  it("returns null for invalid URLs", () => {
    expect(parseProductHostname("not a url")).toBeNull();
  });
});

describe("buildChallengeHostname", () => {
  it("prefixes the hostname with the challenge subdomain", () => {
    expect(buildChallengeHostname("example.com")).toBe("_proof-verify.example.com");
  });
});

describe("txtRecordsContainToken", () => {
  it("matches when a record's joined chunks equal the token", () => {
    expect(txtRecordsContainToken([["abc123"]], "abc123")).toBe(true);
  });

  it("joins multi-chunk TXT records before comparing (DNS splits long strings)", () => {
    expect(txtRecordsContainToken([["abc", "123"]], "abc123")).toBe(true);
  });

  it("ignores unrelated records", () => {
    expect(txtRecordsContainToken([["v=spf1 include:_spf.example.com ~all"]], "abc123")).toBe(
      false,
    );
  });

  it("returns false for an empty record set", () => {
    expect(txtRecordsContainToken([], "abc123")).toBe(false);
  });
});
