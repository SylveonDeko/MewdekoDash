/**
 * A single wiki article, authored as Markdown under `src/lib/content/wiki` and loaded at build
 * time. The frontmatter describes the feature; the body explains it.
 */
export interface WikiArticleMeta {
  /** URL segment under `/wiki/`. Matches the file name without its extension. */
  slug: string;
  /** Display name, matching the label the dashboard sidebar uses for the feature. */
  title: string;
  /** One or two sentences shown on cards and in search results. */
  summary: string;
  /** FontAwesome icon class, without the `fa-utility-duo fa-regular` prefix. */
  icon: string;
  /** Grouping shown on the wiki index. Mirrors the category in navigationItems. */
  category: string;
  /** Dashboard page this article documents, so the dashboard can find its own article. */
  dashboardHref?: string;
  /** Bot module the feature's commands live in, as shown on the commands page. */
  module?: string;
  /** Extra search terms. */
  tags: string[];
  /** Slugs of related articles. */
  related: string[];
  /** Rough reading time, derived from the body. */
  readingMinutes: number;
}

export interface WikiHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface WikiArticle extends WikiArticleMeta {
  /** Raw Markdown body, without frontmatter. */
  markdown: string;
  /** Rendered, sanitized HTML. */
  html: string;
  /** Second and third level headings, for the table of contents. */
  headings: WikiHeading[];
}
