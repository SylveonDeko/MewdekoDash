import type pg from "pg";
import { logger } from "$lib/logger";
import { builtinCatalog, builtinSeedEntries } from "./wiki/builtin";
import { orderMigrations } from "./migrationOrder";

const files = import.meta.glob("./migrations/*.sql", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

/** Held for the whole run so two dashboard processes never migrate at once. */
const advisoryLockKey = 6_240_117_001;

/** The name shown as the author of the first revision of every imported page. */
const seedAuthorName = "Mewdeko";

/**
 * Applies the bundled migrations in order, each in its own transaction, then imports the
 * built-in wiki files when the wiki has no pages yet.
 *
 * @param pool The pool to take one connection from.
 */
export async function runMigrations(pool: pg.Pool): Promise<void> {
  const migrations = orderMigrations(files);
  const client = await pool.connect();
  try {
    await client.query("select pg_advisory_lock($1)", [advisoryLockKey]);
    try {
      await client.query(
        "create table if not exists dash_schema_migrations (version integer primary key, name text not null, applied_at timestamptz not null default now())",
      );
      const applied = await client.query<{ version: number }>("select version from dash_schema_migrations");
      const done = new Set(applied.rows.map((row) => row.version));

      for (const migration of migrations) {
        if (done.has(migration.version)) continue;
        await client.query("begin");
        try {
          await client.query("set local statement_timeout = '60s'");
          await client.query(migration.sql);
          await client.query("insert into dash_schema_migrations (version, name) values ($1, $2)", [migration.version, migration.name]);
          await client.query("commit");
          logger.info(`Applied wiki migration ${migration.version} ${migration.name}`);
        } catch (error) {
          await client.query("rollback");
          throw error;
        }
      }

      await seedIfEmpty(client);
    } finally {
      await client.query("select pg_advisory_unlock($1)", [advisoryLockKey]);
    }
  } finally {
    client.release();
  }
}

async function seedIfEmpty(client: pg.PoolClient): Promise<void> {
  const count = await client.query<{ count: string }>("select count(*) as count from dash_wiki_pages");
  if (count.rows[0].count !== "0") return;

  const { catalog, skipped } = builtinCatalog();
  const entries = builtinSeedEntries();
  await client.query("begin");
  try {
    await client.query("set local statement_timeout = '120s'");
    for (const page of catalog.pages) {
      const inserted = await client.query<{ id: string }>(
        `insert into dash_wiki_pages (slug, icon, category, dashboard_href, module, related, sort_order)
         values ($1, $2, $3, $4, $5, $6, $7) returning id`,
        [page.slug, page.icon, page.category, page.dashboardHref, page.module, page.related, page.sortOrder],
      );
      const pageId = inserted.rows[0].id;

      const texts = entries
        .filter((entry) => entry.slug === page.slug)
        .map((entry) => ({ locale: entry.locale, title: entry.title, summary: entry.summary, markdown: entry.markdown, tags: entry.tags }));
      await client.query(
        `with revision as (
           insert into dash_wiki_revisions (page_id, locale, title, summary, markdown, tags, note, author_id, author_name)
           select $1::bigint, x.locale, x.title, x.summary, x.markdown, array(select jsonb_array_elements_text(x.tags)), '', 'builtin', $3::text
             from jsonb_to_recordset($2::jsonb) as x(locale text, title text, summary text, markdown text, tags jsonb)
           returning id, locale, title, summary, markdown, tags
         )
         insert into dash_wiki_versions (page_id, locale, title, summary, markdown, tags, current_revision_id, updated_by_name)
         select $1::bigint, locale, title, summary, markdown, tags, id, $3::text from revision`,
        [pageId, JSON.stringify(texts), seedAuthorName],
      );
    }
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  }
  logger.info(`Imported ${catalog.pages.length} built-in wiki pages`);
  if (skipped.length > 0) logger.warn(`${skipped.length} built-in wiki files were not imported because their slug has no en-US file`);
}
