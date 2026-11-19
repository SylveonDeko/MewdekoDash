import type pg from "pg";
import { query, withTransaction } from "$lib/server/db";
import type { Catalog, CatalogPage, CatalogVersion } from "$lib/wiki/catalog";
import { sourceLocale } from "$lib/wiki/catalog";
import type {
  EditorRecord,
  FeedbackRecord,
  ManagePage,
  RecentChange,
  RevisionRecord,
  RevisionSummary,
  SuggestionRecord,
  SuggestionStatus,
  VersionRecord,
} from "$lib/wiki/records";
import type { ArticleFields, PageFields } from "$lib/wiki/validation";
import { invalidateWikiCache } from "./cache";
import { isUniqueViolation, WikiError } from "./errors";

/** Who is making a change. */
export interface Actor {
  id: string;
  name: string;
}

const iso = (value: Date): string => value.toISOString();
const isoOrNull = (value: Date | null): string | null => (value ? value.toISOString() : null);

function sameContent(a: ArticleFields, b: ArticleFields): boolean {
  return a.title === b.title && a.summary === b.summary && a.markdown === b.markdown && a.tags.join("\n") === b.tags.join("\n");
}

/** Reads everything the public wiki shows: live, published pages and all of their versions. */
export async function loadCatalog(): Promise<Catalog> {
  const pages = await query<{
    id: string;
    slug: string;
    icon: string;
    category: string;
    dashboard_href: string | null;
    module: string | null;
    related: string[];
    sort_order: number;
  }>(
    `select id, slug, icon, category, dashboard_href, module, related, sort_order
       from dash_wiki_pages
      where deleted_at is null and published
      order by sort_order, id`,
  );
  const versions = await query<{ slug: string; locale: string; title: string; summary: string; markdown: string; tags: string[] }>(
    `select p.slug, v.locale, v.title, v.summary, v.markdown, v.tags
       from dash_wiki_versions v
       join dash_wiki_pages p on p.id = v.page_id
      where p.deleted_at is null and p.published`,
  );

  const catalogPages: CatalogPage[] = pages.rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    icon: row.icon,
    category: row.category,
    dashboardHref: row.dashboard_href,
    module: row.module,
    related: row.related,
    sortOrder: row.sort_order,
  }));
  const byslug = new Map<string, Map<string, CatalogVersion>>();
  for (const row of versions.rows) {
    const byLocale = byslug.get(row.slug) ?? new Map<string, CatalogVersion>();
    byLocale.set(row.locale, { title: row.title, summary: row.summary, markdown: row.markdown, tags: row.tags });
    byslug.set(row.slug, byLocale);
  }
  return { pages: catalogPages, versions: byslug };
}

interface PageRow {
  id: string;
  slug: string;
  icon: string;
  category: string;
  dashboard_href: string | null;
  module: string | null;
  related: string[];
  published: boolean;
  title: string | null;
  locale_count: string;
  open_suggestions: string;
  updated_at: Date;
}

function toManagePage(row: PageRow): ManagePage {
  return {
    id: row.id,
    slug: row.slug,
    icon: row.icon,
    category: row.category,
    dashboardHref: row.dashboard_href,
    module: row.module,
    related: row.related,
    published: row.published,
    title: row.title ?? row.slug,
    localeCount: Number(row.locale_count),
    openSuggestions: Number(row.open_suggestions),
    updatedAt: iso(row.updated_at),
  };
}

const pageSelect = `
  select p.id, p.slug, p.icon, p.category, p.dashboard_href, p.module, p.related, p.published, p.updated_at,
         v.title,
         (select count(*) from dash_wiki_versions x where x.page_id = p.id) as locale_count,
         (select count(*) from dash_wiki_suggestions s where s.page_id = p.id and s.status = 'open') as open_suggestions
    from dash_wiki_pages p
    left join dash_wiki_versions v on v.page_id = p.id and v.locale = $1`;

/** Every live page in display order, including unpublished ones. */
export async function listManagePages(): Promise<ManagePage[]> {
  const result = await query<PageRow>(`${pageSelect} where p.deleted_at is null order by p.sort_order, p.id`, [sourceLocale]);
  return result.rows.map(toManagePage);
}

/** One live page, or null. */
export async function getManagePage(id: string): Promise<ManagePage | null> {
  const result = await query<PageRow>(`${pageSelect} where p.id = $2 and p.deleted_at is null`, [sourceLocale, id]);
  return result.rows[0] ? toManagePage(result.rows[0]) : null;
}

interface VersionRow {
  page_id: string;
  locale: string;
  title: string;
  summary: string;
  markdown: string;
  tags: string[];
  current_revision_id: string | null;
  updated_at: Date;
  updated_by_name: string;
}

function toVersion(row: VersionRow): VersionRecord {
  return {
    pageId: row.page_id,
    locale: row.locale,
    title: row.title,
    summary: row.summary,
    markdown: row.markdown,
    tags: row.tags,
    currentRevisionId: row.current_revision_id,
    updatedAt: iso(row.updated_at),
    updatedByName: row.updated_by_name,
  };
}

/** The stored text of a page in one locale, or null. */
export async function getVersion(pageId: string, locale: string): Promise<VersionRecord | null> {
  const result = await query<VersionRow>(
    `select page_id, locale, title, summary, markdown, tags, current_revision_id, updated_at, updated_by_name
       from dash_wiki_versions where page_id = $1 and locale = $2`,
    [pageId, locale],
  );
  return result.rows[0] ? toVersion(result.rows[0]) : null;
}

/**
 * The tags an article starts from in a locale: its own, or the source language's when the locale
 * has no text yet. Used to let imported tag lists that are over the limits be saved unchanged.
 */
export async function getStartingTags(pageId: string, locale: string): Promise<string[] | undefined> {
  const result = await query<{ tags: string[] }>(
    "select tags from dash_wiki_versions where page_id = $1 and locale = any($2::text[]) order by (locale = $3) desc limit 1",
    [pageId, [locale, sourceLocale], locale],
  );
  return result.rows[0]?.tags;
}

/** The locales a page has text in. */
export async function listVersionLocales(pageId: string): Promise<string[]> {
  const result = await query<{ locale: string }>("select locale from dash_wiki_versions where page_id = $1 order by locale", [pageId]);
  return result.rows.map((row) => row.locale);
}

/** Categories of live pages, in the order they first appear. */
export async function listCategories(): Promise<string[]> {
  const result = await query<{ category: string }>(
    "select category from dash_wiki_pages where deleted_at is null group by category order by min(sort_order), category",
  );
  return result.rows.map((row) => row.category);
}

interface RevisionRow {
  id: string;
  page_id: string;
  locale: string;
  title: string;
  summary: string;
  markdown: string;
  tags: string[];
  note: string;
  author_id: string;
  author_name: string;
  created_at: Date;
}

function toSummary(row: RevisionRow): RevisionSummary {
  return {
    id: row.id,
    pageId: row.page_id,
    locale: row.locale,
    title: row.title,
    note: row.note,
    authorId: row.author_id,
    authorName: row.author_name,
    createdAt: iso(row.created_at),
  };
}

function toRevision(row: RevisionRow): RevisionRecord {
  return { ...toSummary(row), summary: row.summary, markdown: row.markdown, tags: row.tags };
}

/**
 * Revisions of a page in one locale, newest first.
 *
 * @param pageId The page.
 * @param locale The locale.
 * @param beforeId Only revisions older than this one, for paging.
 * @param limit How many to return.
 */
export async function listRevisions(pageId: string, locale: string, beforeId: string | null, limit: number): Promise<RevisionSummary[]> {
  const result = await query<RevisionRow>(
    `select id, page_id, locale, title, summary, markdown, tags, note, author_id, author_name, created_at
       from dash_wiki_revisions
      where page_id = $1 and locale = $2 and ($3::bigint is null or id < $3::bigint)
      order by id desc limit $4`,
    [pageId, locale, beforeId, limit],
  );
  return result.rows.map(toSummary);
}

/** One revision with its full text, or null. */
export async function getRevision(id: string): Promise<RevisionRecord | null> {
  const result = await query<RevisionRow>(
    `select r.id, r.page_id, r.locale, r.title, r.summary, r.markdown, r.tags, r.note, r.author_id, r.author_name, r.created_at
       from dash_wiki_revisions r join dash_wiki_pages p on p.id = r.page_id
      where r.id = $1 and p.deleted_at is null`,
    [id],
  );
  return result.rows[0] ? toRevision(result.rows[0]) : null;
}

/** The revision before the given one for the same page and locale, or null. */
export async function getPreviousRevision(revision: RevisionSummary): Promise<RevisionRecord | null> {
  const result = await query<RevisionRow>(
    `select id, page_id, locale, title, summary, markdown, tags, note, author_id, author_name, created_at
       from dash_wiki_revisions where page_id = $1 and locale = $2 and id < $3 order by id desc limit 1`,
    [revision.pageId, revision.locale, revision.id],
  );
  return result.rows[0] ? toRevision(result.rows[0]) : null;
}

/** The newest revisions across every live page. */
export async function listRecentChanges(limit: number): Promise<RecentChange[]> {
  const result = await query<RevisionRow & { slug: string; page_title: string | null }>(
    `select r.id, r.page_id, r.locale, r.title, r.summary, r.markdown, r.tags, r.note, r.author_id, r.author_name, r.created_at,
            p.slug, v.title as page_title
       from dash_wiki_revisions r
       join dash_wiki_pages p on p.id = r.page_id
       left join dash_wiki_versions v on v.page_id = p.id and v.locale = $2
      where p.deleted_at is null
      order by r.id desc limit $1`,
    [limit, sourceLocale],
  );
  return result.rows.map((row) => ({ ...toSummary(row), slug: row.slug, pageTitle: row.page_title ?? row.slug }));
}

async function lockLivePage(client: pg.PoolClient, pageId: string, mustBePublished = false): Promise<{ slug: string }> {
  const result = await client.query<{ slug: string; published: boolean }>(
    "select slug, published from dash_wiki_pages where id = $1 and deleted_at is null for update",
    [pageId],
  );
  const row = result.rows[0];
  if (!row || (mustBePublished && !row.published)) throw new WikiError("not_found", 404);
  return { slug: row.slug };
}

async function assertRelatedExist(client: pg.PoolClient, related: string[], ownSlug: string | null): Promise<void> {
  if (related.length === 0) return;
  if (ownSlug !== null && related.includes(ownSlug)) throw new WikiError("related_invalid", 400, "related");
  const found = await client.query<{ slug: string }>(
    "select slug from dash_wiki_pages where slug = any($1::text[]) and deleted_at is null",
    [related],
  );
  if (found.rows.length !== new Set(related).size) throw new WikiError("related_invalid", 400, "related");
}

async function writeVersion(
  client: pg.PoolClient,
  args: {
    pageId: string;
    locale: string;
    article: ArticleFields;
    note: string;
    authorId: string;
    authorName: string;
    expectedRevisionId?: string | null;
  },
): Promise<string> {
  const current = await client.query<{ current_revision_id: string | null; title: string; summary: string; markdown: string; tags: string[] }>(
    "select current_revision_id, title, summary, markdown, tags from dash_wiki_versions where page_id = $1 and locale = $2 for update",
    [args.pageId, args.locale],
  );
  const existing = current.rows[0];
  if (args.expectedRevisionId !== undefined && (existing?.current_revision_id ?? null) !== args.expectedRevisionId) {
    throw new WikiError("conflict", 409);
  }
  if (existing && sameContent(existing, args.article)) throw new WikiError("no_changes", 409);

  const revision = await client.query<{ id: string }>(
    `insert into dash_wiki_revisions (page_id, locale, title, summary, markdown, tags, note, author_id, author_name)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9) returning id`,
    [args.pageId, args.locale, args.article.title, args.article.summary, args.article.markdown, args.article.tags, args.note, args.authorId, args.authorName],
  );
  const revisionId = revision.rows[0].id;
  await client.query(
    `insert into dash_wiki_versions (page_id, locale, title, summary, markdown, tags, current_revision_id, updated_at, updated_by_name)
     values ($1, $2, $3, $4, $5, $6, $7, now(), $8)
     on conflict (page_id, locale) do update
       set title = excluded.title, summary = excluded.summary, markdown = excluded.markdown, tags = excluded.tags,
           current_revision_id = excluded.current_revision_id, updated_at = now(), updated_by_name = excluded.updated_by_name`,
    [args.pageId, args.locale, args.article.title, args.article.summary, args.article.markdown, args.article.tags, revisionId, args.authorName],
  );
  await client.query("update dash_wiki_pages set updated_at = now() where id = $1", [args.pageId]);
  return revisionId;
}

/**
 * Creates a page with its first source language text. New pages start unpublished.
 *
 * @param fields The page level fields.
 * @param article The first article text.
 * @param actor Who is creating it.
 * @returns The new page id.
 */
export async function createPage(fields: PageFields, article: ArticleFields, actor: Actor): Promise<string> {
  try {
    const id = await withTransaction(async (client) => {
      await assertRelatedExist(client, fields.related, fields.slug);
      const inserted = await client.query<{ id: string }>(
        `insert into dash_wiki_pages (slug, icon, category, dashboard_href, module, related, sort_order, published)
         values ($1, $2, $3, $4, $5, $6, (select coalesce(max(sort_order), -1) + 1 from dash_wiki_pages where deleted_at is null), false)
         returning id`,
        [fields.slug, fields.icon, fields.category, fields.dashboardHref, fields.module, fields.related],
      );
      const pageId = inserted.rows[0].id;
      await writeVersion(client, { pageId, locale: sourceLocale, article, note: "", authorId: actor.id, authorName: actor.name });
      return pageId;
    });
    invalidateWikiCache();
    return id;
  } catch (error) {
    if (isUniqueViolation(error)) throw new WikiError("slug_taken", 409, "slug");
    throw error;
  }
}

const pageColumns: Record<keyof PageFields, string> = {
  slug: "slug",
  icon: "icon",
  category: "category",
  dashboardHref: "dashboard_href",
  module: "module",
  related: "related",
  published: "published",
};

/**
 * Changes page level fields. A new slug is carried into the related lists of other pages.
 *
 * @param pageId The page.
 * @param patch The fields to change.
 */
export async function updatePage(pageId: string, patch: Partial<PageFields>): Promise<void> {
  try {
    await withTransaction(async (client) => {
      const page = await lockLivePage(client, pageId);
      if (patch.related) await assertRelatedExist(client, patch.related, patch.slug ?? page.slug);

      const sets: string[] = [];
      const values: unknown[] = [pageId];
      for (const key of Object.keys(pageColumns) as Array<keyof PageFields>) {
        if (patch[key] === undefined) continue;
        values.push(patch[key]);
        sets.push(`${pageColumns[key]} = $${values.length}`);
      }
      if (sets.length === 0) return;
      await client.query(`update dash_wiki_pages set ${sets.join(", ")}, updated_at = now() where id = $1`, values);

      if (patch.slug !== undefined && patch.slug !== page.slug) {
        await client.query(
          "update dash_wiki_pages set related = array_replace(related, $1, $2) where $1 = any(related) and id <> $3",
          [page.slug, patch.slug, pageId],
        );
      }
    });
    invalidateWikiCache();
  } catch (error) {
    if (isUniqueViolation(error)) throw new WikiError("slug_taken", 409, "slug");
    throw error;
  }
}

/** Soft deletes a page. Its history stays in the database. */
export async function deletePage(pageId: string): Promise<void> {
  const result = await query("update dash_wiki_pages set deleted_at = now(), updated_at = now() where id = $1 and deleted_at is null", [pageId]);
  if (result.rowCount === 0) throw new WikiError("not_found", 404);
  invalidateWikiCache();
}

/**
 * Saves a new order for the pages of one category. The category keeps the same set of positions,
 * handed out in the order given.
 *
 * @param category The category.
 * @param ids Every live page id in the category, in the new order.
 */
export async function reorderCategory(category: string, ids: string[]): Promise<void> {
  await withTransaction(async (client) => {
    const rows = await client.query<{ id: string; sort_order: number }>(
      "select id, sort_order from dash_wiki_pages where category = $1 and deleted_at is null order by sort_order, id for update",
      [category],
    );
    const known = new Set(rows.rows.map((row) => row.id));
    if (ids.length !== known.size || new Set(ids).size !== ids.length || !ids.every((id) => known.has(id))) {
      throw new WikiError("list_changed", 409);
    }
    const positions = rows.rows.map((row) => row.sort_order).sort((a, b) => a - b);
    for (let i = 0; i < ids.length; i++) {
      await client.query("update dash_wiki_pages set sort_order = $2 where id = $1", [ids[i], positions[i]]);
    }
  });
  invalidateWikiCache();
}

/**
 * Saves an article version as a new revision.
 *
 * @param pageId The page.
 * @param locale The locale of the text.
 * @param article The new text.
 * @param note A short description of the change.
 * @param actor Who is saving.
 * @param expectedRevisionId The revision the editor started from, or null when the locale had no text yet.
 * @returns The new revision id.
 */
export async function saveVersion(
  pageId: string,
  locale: string,
  article: ArticleFields,
  note: string,
  actor: Actor,
  expectedRevisionId: string | null,
): Promise<string> {
  const revisionId = await withTransaction(async (client) => {
    await lockLivePage(client, pageId);
    return writeVersion(client, { pageId, locale, article, note, authorId: actor.id, authorName: actor.name, expectedRevisionId });
  });
  invalidateWikiCache();
  return revisionId;
}

/**
 * Saves an older revision's text as a new revision.
 *
 * @param pageId The page.
 * @param revisionId The revision to restore.
 * @param note A short description of the change.
 * @param actor Who is restoring.
 * @param expectedRevisionId The revision the editor saw as current.
 * @returns The new revision id.
 */
export async function undoToRevision(pageId: string, revisionId: string, note: string, actor: Actor, expectedRevisionId: string | null): Promise<string> {
  const created = await withTransaction(async (client) => {
    await lockLivePage(client, pageId);
    const old = await client.query<RevisionRow>(
      `select id, page_id, locale, title, summary, markdown, tags, note, author_id, author_name, created_at
         from dash_wiki_revisions where id = $1 and page_id = $2`,
      [revisionId, pageId],
    );
    const row = old.rows[0];
    if (!row) throw new WikiError("not_found", 404);
    return writeVersion(client, {
      pageId,
      locale: row.locale,
      article: { title: row.title, summary: row.summary, markdown: row.markdown, tags: row.tags },
      note,
      authorId: actor.id,
      authorName: actor.name,
      expectedRevisionId,
    });
  });
  invalidateWikiCache();
  return created;
}

interface SuggestionRow {
  id: string;
  page_id: string;
  locale: string;
  base_revision_id: string | null;
  title: string;
  summary: string;
  markdown: string;
  tags: string[];
  note: string;
  user_id: string;
  user_name: string;
  status: SuggestionStatus;
  decline_reason: string;
  created_at: Date;
  reviewed_at: Date | null;
  reviewed_by_name: string | null;
  slug: string;
  page_title: string | null;
  cur_title: string | null;
  cur_summary: string | null;
  cur_markdown: string | null;
  cur_tags: string[] | null;
  cur_revision_id: string | null;
}

function toSuggestion(row: SuggestionRow): SuggestionRecord {
  return {
    id: row.id,
    pageId: row.page_id,
    slug: row.slug,
    pageTitle: row.page_title ?? row.slug,
    locale: row.locale,
    baseRevisionId: row.base_revision_id,
    title: row.title,
    summary: row.summary,
    markdown: row.markdown,
    tags: row.tags,
    note: row.note,
    userId: row.user_id,
    userName: row.user_name,
    status: row.status,
    declineReason: row.decline_reason,
    createdAt: iso(row.created_at),
    reviewedAt: isoOrNull(row.reviewed_at),
    reviewedByName: row.reviewed_by_name,
    current:
      row.cur_title === null
        ? null
        : {
            title: row.cur_title,
            summary: row.cur_summary ?? "",
            markdown: row.cur_markdown ?? "",
            tags: row.cur_tags ?? [],
            revisionId: row.cur_revision_id,
          },
  };
}

const suggestionSelect = `
  select s.id, s.page_id, s.locale, s.base_revision_id, s.title, s.summary, s.markdown, s.tags, s.note, s.user_id, s.user_name,
         s.status, s.decline_reason, s.created_at, s.reviewed_at, s.reviewed_by_name,
         p.slug, ev.title as page_title,
         coalesce(cv.title, ev.title) as cur_title, coalesce(cv.summary, ev.summary) as cur_summary,
         coalesce(cv.markdown, ev.markdown) as cur_markdown, coalesce(cv.tags, ev.tags) as cur_tags,
         cv.current_revision_id as cur_revision_id
    from dash_wiki_suggestions s
    join dash_wiki_pages p on p.id = s.page_id and p.deleted_at is null
    left join dash_wiki_versions ev on ev.page_id = s.page_id and ev.locale = $1
    left join dash_wiki_versions cv on cv.page_id = s.page_id and cv.locale = s.locale`;

/**
 * Suggestions, newest first.
 *
 * @param status Only this status, `closed` for everything but open, or null for all.
 * @param userId Only this author, or null for all.
 * @param limit How many to return.
 */
export async function listSuggestions(status: SuggestionStatus | "closed" | null, userId: string | null, limit: number): Promise<SuggestionRecord[]> {
  const result = await query<SuggestionRow>(
    `${suggestionSelect}
      where ($2::text is null or s.status = $2 or ($2::text = 'closed' and s.status <> 'open')) and ($3::text is null or s.user_id = $3)
      order by s.created_at desc, s.id desc limit $4`,
    [sourceLocale, status, userId, limit],
  );
  return result.rows.map(toSuggestion);
}

/** The open suggestion a member has for a page and locale, or null. */
export async function getOpenSuggestion(pageId: string, locale: string, userId: string): Promise<SuggestionRecord | null> {
  const result = await query<SuggestionRow>(
    `${suggestionSelect} where s.page_id = $2 and s.locale = $3 and s.user_id = $4 and s.status = 'open'`,
    [sourceLocale, pageId, locale, userId],
  );
  return result.rows[0] ? toSuggestion(result.rows[0]) : null;
}

/**
 * Stores a member's suggestion. An older open suggestion from the same member for the same page
 * and locale is marked as replaced.
 *
 * @param pageId The page.
 * @param locale The locale of the text.
 * @param article The suggested text and note.
 * @param note The member's note.
 * @param actor The member.
 * @returns The new suggestion id.
 */
export async function submitSuggestion(pageId: string, locale: string, article: ArticleFields, note: string, actor: Actor): Promise<string> {
  try {
    return await withTransaction(async (client) => {
      await lockLivePage(client, pageId, true);
      const base = await client.query<{ current_revision_id: string | null; title: string; summary: string; markdown: string; tags: string[] }>(
        `select current_revision_id, title, summary, markdown, tags from dash_wiki_versions
          where page_id = $1 and locale = any($2::text[]) order by (locale = $3) desc limit 1`,
        [pageId, [locale, sourceLocale], locale],
      );
      const current = base.rows[0];
      if (current && sameContent(current, article)) throw new WikiError("no_changes", 409);

      await client.query(
        "update dash_wiki_suggestions set status = 'replaced', open_mark = null where page_id = $1 and locale = $2 and user_id = $3 and status = 'open'",
        [pageId, locale, actor.id],
      );
      const inserted = await client.query<{ id: string }>(
        `insert into dash_wiki_suggestions (page_id, locale, base_revision_id, title, summary, markdown, tags, note, user_id, user_name)
         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning id`,
        [pageId, locale, current?.current_revision_id ?? null, article.title, article.summary, article.markdown, article.tags, note, actor.id, actor.name],
      );
      return inserted.rows[0].id;
    });
  } catch (error) {
    if (isUniqueViolation(error)) throw new WikiError("conflict", 409);
    throw error;
  }
}

/**
 * Approves an open suggestion. A revision is created with the suggestion's text, credited to the
 * member who made it.
 *
 * @param suggestionId The suggestion.
 * @param reviewer The editor approving it.
 * @returns The new revision id.
 */
export async function approveSuggestion(suggestionId: string, reviewer: Actor): Promise<string> {
  const revisionId = await withTransaction(async (client) => {
    const found = await client.query<{
      page_id: string;
      locale: string;
      title: string;
      summary: string;
      markdown: string;
      tags: string[];
      note: string;
      user_id: string;
      user_name: string;
      status: string;
    }>(
      `select page_id, locale, title, summary, markdown, tags, note, user_id, user_name, status
         from dash_wiki_suggestions where id = $1 for update`,
      [suggestionId],
    );
    const suggestion = found.rows[0];
    if (!suggestion) throw new WikiError("not_found", 404);
    if (suggestion.status !== "open") throw new WikiError("conflict", 409);
    await lockLivePage(client, suggestion.page_id);

    const created = await writeVersion(client, {
      pageId: suggestion.page_id,
      locale: suggestion.locale,
      article: { title: suggestion.title, summary: suggestion.summary, markdown: suggestion.markdown, tags: suggestion.tags },
      note: suggestion.note,
      authorId: suggestion.user_id,
      authorName: suggestion.user_name,
    });
    await client.query(
      `update dash_wiki_suggestions
          set status = 'approved', open_mark = null, reviewed_at = now(), reviewed_by = $2, reviewed_by_name = $3, revision_id = $4
        where id = $1`,
      [suggestionId, reviewer.id, reviewer.name, created],
    );
    return created;
  });
  invalidateWikiCache();
  return revisionId;
}

/**
 * Declines an open suggestion.
 *
 * @param suggestionId The suggestion.
 * @param reviewer The editor declining it.
 * @param reason An optional reason shown to the member.
 */
export async function declineSuggestion(suggestionId: string, reviewer: Actor, reason: string): Promise<void> {
  const result = await query(
    `update dash_wiki_suggestions
        set status = 'declined', open_mark = null, decline_reason = $2, reviewed_at = now(), reviewed_by = $3, reviewed_by_name = $4
      where id = $1 and status = 'open'`,
    [suggestionId, reason, reviewer.id, reviewer.name],
  );
  if (result.rowCount === 0) throw new WikiError("conflict", 409);
}

/**
 * Records an answer to "Was this page helpful?". A member's earlier unresolved answer for the
 * same page and locale is updated instead of adding another.
 *
 * @param pageId The page.
 * @param locale The locale the member read.
 * @param helpful The answer.
 * @param reason A reason, only kept for a no.
 * @param note A note, only kept for a no.
 * @param userId The member.
 */
export async function submitFeedback(pageId: string, locale: string, helpful: boolean, reason: string, note: string, userId: string): Promise<void> {
  await withTransaction(async (client) => {
    await lockLivePage(client, pageId, true);
    const keptReason = helpful ? "" : reason;
    const keptNote = helpful ? "" : note;
    const updated = await client.query(
      `update dash_wiki_feedback set helpful = $4, reason = $5, note = $6, created_at = now()
        where page_id = $1 and locale = $2 and user_id = $3 and status = 'open'`,
      [pageId, locale, userId, helpful, keptReason, keptNote],
    );
    if (updated.rowCount === 0) {
      await client.query(
        "insert into dash_wiki_feedback (page_id, locale, helpful, reason, note, user_id) values ($1, $2, $3, $4, $5, $6)",
        [pageId, locale, helpful, keptReason, keptNote, userId],
      );
    }
  });
}

/**
 * Feedback, newest first.
 *
 * @param status Only this status, or null for all.
 * @param limit How many to return.
 */
export async function listFeedback(status: "open" | "resolved" | null, limit: number): Promise<FeedbackRecord[]> {
  const result = await query<{
    id: string;
    page_id: string;
    locale: string;
    helpful: boolean;
    reason: string;
    note: string;
    user_id: string;
    status: "open" | "resolved";
    created_at: Date;
    resolved_at: Date | null;
    slug: string;
    page_title: string | null;
  }>(
    `select f.id, f.page_id, f.locale, f.helpful, f.reason, f.note, f.user_id, f.status, f.created_at, f.resolved_at,
            p.slug, v.title as page_title
       from dash_wiki_feedback f
       join dash_wiki_pages p on p.id = f.page_id and p.deleted_at is null
       left join dash_wiki_versions v on v.page_id = p.id and v.locale = $1
      where ($2::text is null or f.status = $2)
      order by f.created_at desc, f.id desc limit $3`,
    [sourceLocale, status, limit],
  );
  return result.rows.map((row) => ({
    id: row.id,
    pageId: row.page_id,
    slug: row.slug,
    pageTitle: row.page_title ?? row.slug,
    locale: row.locale,
    helpful: row.helpful,
    reason: row.reason,
    note: row.note,
    userId: row.user_id,
    status: row.status,
    createdAt: iso(row.created_at),
    resolvedAt: isoOrNull(row.resolved_at),
  }));
}

/** Marks feedback as resolved. */
export async function resolveFeedback(feedbackId: string, resolver: Actor): Promise<void> {
  const result = await query(
    "update dash_wiki_feedback set status = 'resolved', resolved_at = now(), resolved_by = $2 where id = $1 and status = 'open'",
    [feedbackId, resolver.id],
  );
  if (result.rowCount === 0) throw new WikiError("not_found", 404);
}

/** Every editor, by name. */
export async function listEditors(): Promise<EditorRecord[]> {
  const result = await query<{ user_id: string; display_name: string; added_by: string; added_at: Date }>(
    "select user_id, display_name, added_by, added_at from dash_wiki_editors order by lower(display_name), user_id",
  );
  return result.rows.map((row) => ({ userId: row.user_id, displayName: row.display_name, addedBy: row.added_by, addedAt: iso(row.added_at) }));
}

/** True when the user is on the editors list. */
export async function isEditor(userId: string): Promise<boolean> {
  const result = await query("select 1 from dash_wiki_editors where user_id = $1", [userId]);
  return (result.rowCount ?? 0) > 0;
}

/** Keeps an editor's stored name in step with the name they currently use. */
export async function refreshEditorName(userId: string, displayName: string): Promise<void> {
  await query("update dash_wiki_editors set display_name = $2 where user_id = $1 and display_name <> $2", [userId, displayName]);
}

/**
 * A name the dashboard already knows for a user: an editor entry, a suggestion or a revision.
 *
 * @param userId The Discord user id.
 */
export async function knownName(userId: string): Promise<string | null> {
  const result = await query<{ name: string }>(
    `select name from (
       select display_name as name, 1 as priority from dash_wiki_editors where user_id = $1
       union all select user_name, 2 from dash_wiki_suggestions where user_id = $1
       union all select author_name, 3 from dash_wiki_revisions where author_id = $1
     ) known order by priority limit 1`,
    [userId],
  );
  return result.rows[0]?.name ?? null;
}

/** Adds an editor, or updates the name of an existing one. */
export async function addEditor(userId: string, displayName: string, addedBy: string): Promise<void> {
  await query(
    `insert into dash_wiki_editors (user_id, display_name, added_by) values ($1, $2, $3)
     on conflict (user_id) do update set display_name = excluded.display_name`,
    [userId, displayName, addedBy],
  );
}

/** Removes an editor. */
export async function removeEditor(userId: string): Promise<void> {
  const result = await query("delete from dash_wiki_editors where user_id = $1", [userId]);
  if (result.rowCount === 0) throw new WikiError("not_found", 404);
}
