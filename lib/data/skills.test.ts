import { describe, expect, it } from "vitest";
import { parseSkillNames } from "./skills";

describe("parseSkillNames", () => {
  it("splits and trims comma-separated names", () => {
    expect(parseSkillNames("React, Next.js , PostgreSQL")).toEqual([
      "React",
      "Next.js",
      "PostgreSQL",
    ]);
  });

  it("dedupes by normalized slug, keeping the first occurrence", () => {
    expect(parseSkillNames("React, react, REACT")).toEqual(["React"]);
  });

  it("drops empty entries", () => {
    expect(parseSkillNames("React, , , Go")).toEqual(["React", "Go"]);
  });

  it("returns an empty array for blank input", () => {
    expect(parseSkillNames("   ")).toEqual([]);
  });
});
