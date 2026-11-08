const IMAGE_PLACEHOLDER =
  /%(?:user\.avatar|useravatar|user\.banner|server\.icon|server\.banner|bot\.avatar|[a-z]+gif|img:[^%\s]*)%/gi;

/** Placeholders that resolve to an image or GIF link. */
export function findImagePlaceholders(text: string | null | undefined): string[] {
  if (!text) return [];
  return text.match(IMAGE_PLACEHOLDER) ?? [];
}

export function isImagePlaceholder(text: string | null | undefined): boolean {
  const value = text?.trim() ?? "";
  const matches = findImagePlaceholders(value);
  return matches.length === 1 && matches[0] === value;
}

/** The first image placeholder in `next` that `previous` did not already contain. */
export function newImagePlaceholder(previous: string | null | undefined, next: string | null | undefined): string | null {
  const before = findImagePlaceholders(previous);
  for (const token of findImagePlaceholders(next)) {
    const index = before.indexOf(token);
    if (index === -1) return token;
    before.splice(index, 1);
  }
  return null;
}

/** Removes one occurrence of `token` and the blank space it leaves behind. */
export function removePlaceholder(text: string, token: string): string {
  const index = text.indexOf(token);
  if (index === -1) return text;
  const before = text.slice(0, index).replace(/[ \t]+$/, "");
  const after = text.slice(index + token.length).replace(/^[ \t]+/, "");
  const joined = before.endsWith("\n") && after.startsWith("\n") ? before + after.slice(1) : before + after;
  return joined.replace(/^\n+/, "");
}
