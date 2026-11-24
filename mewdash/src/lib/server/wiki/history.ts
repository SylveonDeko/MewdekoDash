import { query } from "$lib/server/db";
import type { PublicRevision, RevisionRecord } from "$lib/wiki/records";

interface Row {
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

const columns = "r.id, r.page_id, r.locale, r.title, r.summary, r.markdown, r.tags, r.note, r.author_id, r.author_name, r.created_at";

function toPublic(row: Row): PublicRevision {
  return { id: row.id, locale: row.locale, title: row.title, note: row.note, authorName: row.author_name, createdAt: row.created_at.toISOString() };
}

/**
 * The saved versions of a published page in one language, newest first. Author ids are never
 * included.
 *
 * @param pageId The page.
 * @param locale The language.
 * @param beforeId Only versions older than this one, for paging.
 * @param limit How many to return.
 */
export async function listPublicRevisions(pageId: string, locale: string, beforeId: string | null, limit: number): Promise<PublicRevision[]> {
  const result = await query<Row>(
    `select ${columns}
       from dash_wiki_revisions r
       join dash_wiki_pages p on p.id = r.page_id and p.deleted_at is null and p.published
      where r.page_id = $1 and r.locale = $2 and ($3::bigint is null or r.id < $3::bigint)
      order by r.id desc limit $4`,
    [pageId, locale, beforeId, limit],
  );
  return result.rows.map(toPublic);
}

function toRecord(row: Row): RevisionRecord {
  return { ...toPublic(row), pageId: row.page_id, authorId: "", summary: row.summary, markdown: row.markdown, tags: row.tags };
}

/**
 * One saved version of a published page with the version before it, for a public comparison.
 * The author id is blanked.
 *
 * @param id The revision.
 */
export async function getPublicRevisionPair(id: string): Promise<{ revision: RevisionRecord; previous: RevisionRecord | null } | null> {
  const found = await query<Row>(
    `select ${columns}
       from dash_wiki_revisions r
       join dash_wiki_pages p on p.id = r.page_id and p.deleted_at is null and p.published
      where r.id = $1`,
    [id],
  );
  const row = found.rows[0];
  if (!row) return null;
  const before = await query<Row>(
    `select ${columns} from dash_wiki_revisions r where r.page_id = $1 and r.locale = $2 and r.id < $3 order by r.id desc limit 1`,
    [row.page_id, row.locale, row.id],
  );
  return { revision: toRecord(row), previous: before.rows[0] ? toRecord(before.rows[0]) : null };
}
