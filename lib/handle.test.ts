import { describe, expect, it } from "vitest";
import { slugifyHandle } from "./handle";

describe("slugifyHandle", () => {
  it("lowercases and strips diacritics", () => {
    expect(slugifyHandle("Émile Zéro")).toBe("emile-zero");
  });

  it("replaces non-alphanumeric runs with a single dash", () => {
    expect(slugifyHandle("john.doe_the-dev!!")).toBe("john-doe-the-dev");
  });

  it("trims leading and trailing dashes", () => {
    expect(slugifyHandle("  --weird--  ")).toBe("weird");
  });

  it("truncates to 30 characters", () => {
    expect(slugifyHandle("a".repeat(50))).toHaveLength(30);
  });

  it("falls back to 'user' when the input has no usable characters", () => {
    expect(slugifyHandle("!!!")).toBe("user");
  });
});
