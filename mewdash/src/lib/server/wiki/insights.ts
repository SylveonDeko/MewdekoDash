import { query } from "$lib/server/db";
import { sourceLocale } from "$lib/wiki/catalog";
import type { AnalyticsOverview, LanguageRow } from "$lib/wiki/records";
import { dayKey } from "$lib/wiki/tracking";

/** Counts one view of a published page. Nothing that identifies the reader is stored. */
export async function recordView(pageId: string, locale: string): Promise<void> {
  await query(
    `insert into dash_wiki_view_days (page_id, locale, day, views)
     select p.id, $2::text, $3::date, 1 from dash_wiki_pages p where p.id = $1 and p.deleted_at is null and p.published
     on conflict (page_id, locale, day) do update set views = dash_wiki_view_days.views + 1`,
    [pageId, locale, dayKey(new Date())],
  );
}

/** Counts a search that found nothing, under its cleaned text. */
export async function recordMiss(text: string, locale: string): Promise<void> {
  await query(
    `insert into dash_wiki_search_misses (query, locale, day, misses) values ($1, $2, $3::date, 1)
     on conflict (query, locale, day) do update set misses = dash_wiki_search_misses.misses + 1`,
    [text, locale, dayKey(new Date())],
  );
}

/**
 * Views, votes and problem reports over the last days, as counts only.
 *
 * @param days The window: 7, 30 or 90.
 */
export async function getAnalytics(days: number): Promise<AnalyticsOverview> {
  const since = dayKey(new Date(Date.now() - (days - 1) * 86_400_000));

  const daily = await query<{ day: string; views: string }>(
    `select to_char(g.day, 'YYYY-MM-DD') as day, coalesce(sum(d.views), 0) as views
       from (select ($1::date + n) as day from generate_series(0, $2::int - 1) as s(n)) g
       left join dash_wiki_view_days d on d.day = g.day
      group by g.day order by g.day`,
    [since, days],
  );

  const items = await query<{
    id: string;
    slug: string;
    category: string;
    title: string;
    views: string;
    helpful: string;
    not_helpful: string;
    open_reports: string;
  }>(
    `select p.id, p.slug, p.category, coalesce(v.title, p.slug) as title,
            coalesce((select sum(d.views) from dash_wiki_view_days d where d.page_id = p.id and d.day >= $1::date), 0) as views,
            (select count(*) from dash_wiki_votes x where x.page_id = p.id and x.helpful and x.updated_at >= $1::date) as helpful,
            (select count(*) from dash_wiki_votes x where x.page_id = p.id and not x.helpful and x.updated_at >= $1::date) as not_helpful,
            (select count(*) from dash_wiki_feedback f where f.page_id = p.id and f.status = 'open' and not f.helpful) as open_reports
       from dash_wiki_pages p
       left join dash_wiki_versions v on v.page_id = p.id and v.locale = $2
      where p.deleted_at is null and p.published
      order by views desc, title`,
    [since, sourceLocale],
  );

  const misses = await query<{ query: string; count: string }>(
    `select query, sum(misses) as count from dash_wiki_search_misses where day >= $1::date
      group by query order by sum(misses) desc, query limit 25`,
    [since],
  );

  const reports = await query<{ count: string }>(
    "select count(*) as count from dash_wiki_feedback where not helpful and created_at >= $1::date",
    [since],
  );

  const rows = items.rows.map((row) => ({
    pageId: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    views: Number(row.views),
    helpful: Number(row.helpful),
    notHelpful: Number(row.not_helpful),
    openReports: Number(row.open_reports),
  }));

  return {
    days,
    views: rows.reduce((sum, row) => sum + row.views, 0),
    helpful: rows.reduce((sum, row) => sum + row.helpful, 0),
    notHelpful: rows.reduce((sum, row) => sum + row.notHelpful, 0),
    reports: Number(reports.rows[0]?.count ?? 0),
    daily: daily.rows.map((row) => ({ day: row.day, views: Number(row.views) })),
    items: rows,
    misses: misses.rows.map((row) => ({ query: row.query, count: Number(row.count) })),
  };
}

/** Every live page with the languages it has text in and the ones that fell behind the source text. */
export async function listLanguageRows(): Promise<LanguageRow[]> {
  const result = await query<{ id: string; slug: string; published: boolean; title: string | null; locales: string[]; outdated: string[] }>(
    `select p.id, p.slug, p.published, v.title,
            array(select x.locale from dash_wiki_versions x where x.page_id = p.id order by x.locale) as locales,
            array(select x.locale from dash_wiki_versions x
                    join dash_wiki_versions s on s.page_id = x.page_id and s.locale = $1
                   where x.page_id = p.id and x.locale <> $1 and x.source_revision_id is distinct from s.current_revision_id
                   order by x.locale) as outdated
       from dash_wiki_pages p
       left join dash_wiki_versions v on v.page_id = p.id and v.locale = $1
      where p.deleted_at is null
      order by p.sort_order, p.id`,
    [sourceLocale],
  );
  return result.rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title ?? row.slug,
    published: row.published,
    locales: row.locales,
    outdated: row.outdated,
  }));
}

/**
 * The current slug of the page an old slug used to belong to.
 *
 * @param oldSlug An address the page used to have.
 * @returns The slug to send the reader to, or null when there is none.
 */
export async function findRedirect(oldSlug: string): Promise<string | null> {
  const result = await query<{ slug: string }>(
    `select p.slug from dash_wiki_redirects r
       join dash_wiki_pages p on p.id = r.page_id and p.deleted_at is null and p.published
      where r.old_slug = $1`,
    [oldSlug],
  );
  return result.rows[0]?.slug ?? null;
}
