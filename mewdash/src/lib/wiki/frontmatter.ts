/** A built-in Markdown file reduced to the fields the wiki database stores. */
export interface SeedEntry {
  locale: string;
  slug: string;
  title: string;
  summary: string;
  icon: string;
  category: string;
  dashboardHref: string | null;
  module: string | null;
  tags: string[];
  related: string[];
  markdown: string;
}

/**
 * Reads a `[a, b, c]` frontmatter list.
 *
 * @param value The raw value after the colon.
 */
export function parseList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((s) => s.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

/**
 * Splits a file into its frontmatter and body. Frontmatter is a flat `key: value` block; lists
 * are written as `[a, b, c]`.
 *
 * @param raw The whole file.
 */
export function parseFrontmatter(raw: string): { fields: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  if (!match) return { fields: {}, body: raw };

  const fields: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    fields[key] = value;
  }
  return { fields, body: match[2] };
}

/** The locale folder a glob path sits in, such as `en-US` from `/src/lib/content/wiki/en-US/xp.md`. */
export function localeOfPath(path: string): string {
  const parts = path.split("/");
  return parts[parts.length - 2];
}

/**
 * Maps one built-in file onto the stored fields, with the same defaults the file loader has
 * always applied.
 *
 * @param path The file's path, whose last segment is the fallback slug and whose folder is the locale.
 * @param raw The file contents.
 */
export function mapFrontmatter(path: string, raw: string): SeedEntry {
  const fileSlug = path.split("/").pop()!.replace(/\.md$/, "");
  const { fields, body } = parseFrontmatter(raw);
  return {
    locale: localeOfPath(path),
    slug: fields.slug || fileSlug,
    title: fields.title || fileSlug,
    summary: fields.summary || "",
    icon: fields.icon || "fa-book",
    category: fields.category || "General",
    dashboardHref: fields.dashboard || null,
    module: fields.module || null,
    tags: parseList(fields.tags),
    related: parseList(fields.related),
    markdown: body,
  };
}
