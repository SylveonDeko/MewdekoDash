export const wikiLimits = {
  slugMax: 64,
  titleMax: 120,
  summaryMax: 400,
  markdownMax: 100_000,
  noteMax: 300,
  reasonMax: 300,
  feedbackNoteMax: 1000,
  tagsMax: 12,
  tagMax: 40,
  categoryMax: 40,
  moduleMax: 40,
  iconMax: 60,
  hrefMax: 120,
  relatedMax: 12,
  nameMax: 80,
} as const;

/** Slugs that would shadow a fixed route under `/wiki/`. */
export const reservedSlugs: readonly string[] = ["manage", "sitemap"];

export type WikiErrorCode =
  | "slug_invalid"
  | "slug_reserved"
  | "slug_taken"
  | "title_required"
  | "title_too_long"
  | "summary_too_long"
  | "markdown_too_long"
  | "note_too_long"
  | "reason_too_long"
  | "tags_too_many"
  | "tag_too_long"
  | "category_invalid"
  | "icon_invalid"
  | "href_invalid"
  | "module_invalid"
  | "related_invalid"
  | "locale_invalid"
  | "user_id_invalid"
  | "name_too_long"
  | "feedback_invalid"
  | "no_changes"
  | "conflict"
  | "not_found"
  | "forbidden"
  | "unauthorized"
  | "database_unavailable"
  | "bad_request"
  | "list_changed"
  | "translation_empty"
  | "translation_too_long"
  | "translation_unchanged"
  | "placeholders_mismatch"
  | "html_mismatch"
  | "too_many_suggestions";

export type Validated<T> = { ok: true; value: T } | { ok: false; error: WikiErrorCode; field?: string };

const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const iconPattern = /^(fa-brands )?fa-[a-z0-9]+(-[a-z0-9]+)*$/;
const hrefPattern = /^\/[a-z0-9]+([/_-][a-z0-9]+)*(\?[a-z0-9_-]+=[a-z0-9_-]+)?$/;
const modulePattern = /^[A-Za-z0-9][A-Za-z0-9 ._-]*$/;
const localePattern = /^[a-z]{2,3}-[A-Z]{2}$/;
const userIdPattern = /^\d{15,22}$/;
const numericIdPattern = /^\d{1,18}$/;

function fail(error: WikiErrorCode, field?: string): { ok: false; error: WikiErrorCode; field?: string } {
  return { ok: false, error, field };
}

/**
 * Collapses every run of whitespace, newlines included, to a single space.
 *
 * @param value Raw single line input.
 * @returns The trimmed text.
 */
export function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

/**
 * Checks a page slug.
 *
 * @param slug The candidate slug.
 * @returns An error code, or null when the slug may be used.
 */
export function slugProblem(slug: unknown): WikiErrorCode | null {
  if (typeof slug !== "string") return "slug_invalid";
  if (slug.length === 0 || slug.length > wikiLimits.slugMax || !slugPattern.test(slug)) return "slug_invalid";
  if (reservedSlugs.includes(slug)) return "slug_reserved";
  return null;
}

/**
 * Turns a title into a slug candidate. Accents are dropped and everything else that is not a
 * letter or digit becomes a hyphen.
 *
 * @param title A page title.
 * @returns A string that may still be empty or reserved, so it still needs {@link slugProblem}.
 */
export function slugFromTitle(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, wikiLimits.slugMax)
    .replace(/-+$/g, "");
}

/**
 * Normalises and checks a tag list: trimmed, lower case, single spaces, no empties, no repeats.
 *
 * @param raw The submitted tags.
 * @param unchanged The tags already stored for this article. Imported articles can carry more
 * tags than the limits allow, and saving them as they are must not be blocked.
 * @returns The cleaned list, or the first rule that failed.
 */
export function normalizeTags(raw: unknown, unchanged?: readonly string[]): Validated<string[]> {
  if (raw === undefined || raw === null) return { ok: true, value: [] };
  const tags = cleanTags(raw);
  if (tags === null) return fail("bad_request", "tags");

  const stored = unchanged === undefined ? null : cleanTags(unchanged);
  const same = stored !== null && stored.length === tags.length && stored.every((tag, index) => tag === tags[index]);
  if (!same) {
    if (tags.some((tag) => [...tag].length > wikiLimits.tagMax)) return fail("tag_too_long", "tags");
    if (tags.length > wikiLimits.tagsMax) return fail("tags_too_many", "tags");
  }
  return { ok: true, value: tags };
}

function cleanTags(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const seen = new Set<string>();
  const tags: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") return null;
    const tag = collapseWhitespace(item).toLowerCase();
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    tags.push(tag);
  }
  return tags;
}

/** The fields of one language version of an article. */
export interface ArticleFields {
  title: string;
  summary: string;
  markdown: string;
  tags: string[];
}

/**
 * Checks and cleans the editable fields of an article version.
 *
 * @param input The submitted object.
 * @param unchangedTags The tags currently stored for the article, which may be saved as they are.
 * @returns Clean fields with a normalised note, or the first rule that failed.
 */
export function validateArticle(input: unknown, unchangedTags?: readonly string[]): Validated<ArticleFields & { note: string }> {
  if (typeof input !== "object" || input === null) return fail("bad_request");
  const raw = input as Record<string, unknown>;
  if (typeof raw.title !== "string") return fail("title_required", "title");
  const title = collapseWhitespace(raw.title);
  if (!title) return fail("title_required", "title");
  if ([...title].length > wikiLimits.titleMax) return fail("title_too_long", "title");

  const summary = collapseWhitespace(typeof raw.summary === "string" ? raw.summary : "");
  if ([...summary].length > wikiLimits.summaryMax) return fail("summary_too_long", "summary");

  const markdown = (typeof raw.markdown === "string" ? raw.markdown : "").replace(/\r\n?/g, "\n").replace(/\u0000/g, "");
  if (markdown.length > wikiLimits.markdownMax) return fail("markdown_too_long", "markdown");

  const tags = normalizeTags(raw.tags, unchangedTags);
  if (!tags.ok) return tags;

  const note = collapseWhitespace(typeof raw.note === "string" ? raw.note : "");
  if ([...note].length > wikiLimits.noteMax) return fail("note_too_long", "note");

  return { ok: true, value: { title, summary, markdown, tags: tags.value, note } };
}

/** The page level fields shared by every language. */
export interface PageFields {
  slug: string;
  icon: string;
  category: string;
  dashboardHref: string | null;
  module: string | null;
  related: string[];
  published: boolean;
}

/**
 * Checks the page level fields. Fields left out of a partial update stay out of the result.
 *
 * @param input The submitted object.
 * @param partial True when missing fields are allowed.
 * @returns The cleaned fields, or the first rule that failed.
 */
export function validatePageFields(input: unknown, partial: boolean): Validated<Partial<PageFields>> {
  if (typeof input !== "object" || input === null) return fail("bad_request");
  const raw = input as Record<string, unknown>;
  const out: Partial<PageFields> = {};

  if (raw.slug !== undefined || !partial) {
    const problem = slugProblem(raw.slug);
    if (problem) return fail(problem, "slug");
    out.slug = raw.slug as string;
  }

  if (raw.icon !== undefined || !partial) {
    const icon = typeof raw.icon === "string" ? collapseWhitespace(raw.icon) : "";
    if (!icon || icon.length > wikiLimits.iconMax || !iconPattern.test(icon)) return fail("icon_invalid", "icon");
    out.icon = icon;
  }

  if (raw.category !== undefined || !partial) {
    const category = typeof raw.category === "string" ? collapseWhitespace(raw.category) : "";
    if (!category || [...category].length > wikiLimits.categoryMax) return fail("category_invalid", "category");
    out.category = category;
  }

  if (raw.dashboardHref !== undefined) {
    const href = typeof raw.dashboardHref === "string" ? raw.dashboardHref.trim() : "";
    if (href && (href.length > wikiLimits.hrefMax || !hrefPattern.test(href))) return fail("href_invalid", "dashboardHref");
    out.dashboardHref = href || null;
  }

  if (raw.module !== undefined) {
    const module = typeof raw.module === "string" ? collapseWhitespace(raw.module) : "";
    if (module && (module.length > wikiLimits.moduleMax || !modulePattern.test(module))) return fail("module_invalid", "module");
    out.module = module || null;
  }

  if (raw.related !== undefined) {
    if (!Array.isArray(raw.related) || raw.related.length > wikiLimits.relatedMax) return fail("related_invalid", "related");
    const related: string[] = [];
    for (const slug of raw.related) {
      if (typeof slug !== "string" || slugProblem(slug) === "slug_invalid") return fail("related_invalid", "related");
      if (!related.includes(slug)) related.push(slug);
    }
    out.related = related;
  }

  if (raw.published !== undefined) {
    if (typeof raw.published !== "boolean") return fail("bad_request", "published");
    out.published = raw.published;
  }

  return { ok: true, value: out };
}

/**
 * Checks a locale code such as `en-US` against the locales the dashboard has.
 *
 * @param locale The candidate.
 * @param known The locales that exist.
 */
export function localeProblem(locale: unknown, known: readonly string[]): WikiErrorCode | null {
  if (typeof locale !== "string" || !localePattern.test(locale) || !known.includes(locale)) return "locale_invalid";
  return null;
}

/** True for a Discord user id (a snowflake in text form). */
export function isUserId(value: unknown): value is string {
  return typeof value === "string" && userIdPattern.test(value);
}

/** True for a database row id in text form. */
export function isRowId(value: unknown): value is string {
  return typeof value === "string" && numericIdPattern.test(value);
}

export const feedbackReasons = ["unclear", "outdated", "missing", "incorrect", "other"] as const;

export type FeedbackReason = (typeof feedbackReasons)[number];

/**
 * Checks an answer to "Was this page helpful?". Reason and note only count for a no.
 *
 * @param input The submitted object.
 */
export function validateFeedback(input: Record<string, unknown>): Validated<{ helpful: boolean; reason: string; note: string }> {
  if (typeof input.helpful !== "boolean") return fail("feedback_invalid", "helpful");
  if (input.helpful) return { ok: true, value: { helpful: true, reason: "", note: "" } };
  const reason = input.reason === undefined || input.reason === null || input.reason === "" ? "" : input.reason;
  if (reason !== "" && !feedbackReasons.includes(reason as FeedbackReason)) return fail("feedback_invalid", "reason");
  const note = optionalText(input.note, wikiLimits.feedbackNoteMax, "note_too_long");
  if (!note.ok) return note;
  return { ok: true, value: { helpful: false, reason: reason as string, note: note.value } };
}

/**
 * Checks an optional free text field such as a note or a decline reason.
 *
 * @param value The submitted text.
 * @param max The longest allowed length in characters.
 * @param code The error to report when it is too long.
 */
export function optionalText(value: unknown, max: number, code: WikiErrorCode): Validated<string> {
  if (value === undefined || value === null) return { ok: true, value: "" };
  if (typeof value !== "string") return fail("bad_request");
  const text = collapseWhitespace(value);
  if ([...text].length > max) return fail(code);
  return { ok: true, value: text };
}
