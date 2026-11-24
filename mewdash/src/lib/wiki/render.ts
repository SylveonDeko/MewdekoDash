import { m } from "$lib/i18n";
import { renderMarkdown } from "./renderCore";
import type { ImageRewriter } from "./sanitize";
import type { WikiHeading } from "./types";

export { slugifyHeading } from "./renderCore";

/** Labels for the callout blocks. Resolved when an article is rendered, so they follow the active locale. */
function calloutLabel(kind: string): string {
  switch (kind) {
    case "TIP": return m.wiki.calloutTip();
    case "NOTE": return m.wiki.calloutNote();
    case "WARNING": return m.common.warning();
    case "PERMISSION": return m.wiki.calloutPermission();
    case "EXAMPLE": return m.wiki.calloutExample();
    default: return kind;
  }
}

/**
 * Renders article Markdown to sanitised HTML. The input may come from any signed in member, so
 * raw HTML in it is shown as text and the result is passed through the allow-list sanitiser.
 *
 * @param markdown The article body.
 * @param rewriteImage Gives the address to load for an image, or null to leave the image's source out.
 * @returns HTML plus the headings found in it.
 */
export function renderWikiMarkdown(markdown: string, rewriteImage?: ImageRewriter): { html: string; headings: WikiHeading[] } {
  return renderMarkdown(markdown, calloutLabel, rewriteImage);
}
