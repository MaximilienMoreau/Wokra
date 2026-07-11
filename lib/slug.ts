const COMBINING_MARK_RANGE = { start: 0x0300, end: 0x036f };

function stripDiacritics(input: string): string {
  return Array.from(input.normalize("NFD"))
    .filter((char) => {
      const code = char.codePointAt(0) ?? 0;
      return code < COMBINING_MARK_RANGE.start || code > COMBINING_MARK_RANGE.end;
    })
    .join("");
}

export function slugify(input: string, maxLength = 50): string {
  return stripDiacritics(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
}
