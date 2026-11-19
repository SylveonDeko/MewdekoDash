import type pg from "pg";
import { withTransaction } from "$lib/server/db";
import { readDashCatalog } from "./dashCatalog";
import { catalogHash, type CatalogEntry } from "./hash";

export interface RegistrationResult {
  skipped: boolean;
  hash: string;
  strings: number;
  baselines: number;
  milliseconds: number;
}

export const dashCatalogId = "dash";

const defaultBatchSize = 2000;

function chunks<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

async function writeStrings(client: pg.PoolClient, catalog: string, entries: readonly CatalogEntry[], batchSize: number): Promise<void> {
  for (const batch of chunks(entries, batchSize)) {
    await client.query(
      `insert into dash_tr_strings (catalog, key, grp, source_text)
       select $1, x.key, x.grp, x.source from unnest($2::text[], $3::text[], $4::text[]) as x(key, grp, source)
       on conflict (catalog, key) do update
         set grp = excluded.grp,
             source_text = excluded.source_text,
             updated_at = case when dash_tr_strings.source_text is distinct from excluded.source_text then now() else dash_tr_strings.updated_at end`,
      [catalog, batch.map((e) => e.key), batch.map((e) => e.group), batch.map((e) => e.source)],
    );
  }
  await client.query("delete from dash_tr_strings where catalog = $1 and key <> all($2::text[])", [catalog, entries.map((e) => e.key)]);
}

async function writeBaselines(client: pg.PoolClient, catalog: string, entries: readonly CatalogEntry[], batchSize: number): Promise<number> {
  const rows: Array<{ key: string; locale: string; text: string }> = [];
  for (const entry of entries) {
    for (const [locale, text] of Object.entries(entry.baselines)) rows.push({ key: entry.key, locale, text });
  }
  await client.query("delete from dash_tr_baselines where catalog = $1", [catalog]);
  for (const batch of chunks(rows, batchSize)) {
    await client.query(
      `insert into dash_tr_baselines (catalog, key, locale, text)
       select $1, x.key, x.locale, x.text from unnest($2::text[], $3::text[], $4::text[]) as x(key, locale, text)`,
      [catalog, batch.map((r) => r.key), batch.map((r) => r.locale), batch.map((r) => r.text)],
    );
  }
  return rows.length;
}

/**
 * Registers a catalog's strings and built-in translations. When the stored build hash equals the
 * hash of `entries` nothing is written. Otherwise, in one transaction, the strings are upserted
 * in batches (a string's `updated_at` moves only when its source text changed), strings whose key
 * is gone are deleted, the catalog's built-in translations are replaced and the hash is stored.
 * The catalog's `version` is never touched.
 *
 * @param catalog The catalog id, `dash` or `bot`.
 * @param entries Every string of the catalog.
 * @param batchSize Rows per statement.
 */
export async function registerCatalog(catalog: string, entries: readonly CatalogEntry[], batchSize = defaultBatchSize): Promise<RegistrationResult> {
  const startedAt = performance.now();
  const unique = [...new Map(entries.map((entry) => [entry.key, entry])).values()];
  const hash = catalogHash(unique);

  return withTransaction(async (client) => {
    await client.query("set local statement_timeout = '120s'");
    await client.query("select pg_advisory_xact_lock(hashtext($1))", [`dash_tr_register:${catalog}`]);
    const stored = await client.query<{ build_hash: string }>("select build_hash from dash_tr_catalogs where catalog = $1", [catalog]);
    if (stored.rows[0]?.build_hash === hash) {
      return { skipped: true, hash, strings: unique.length, baselines: 0, milliseconds: performance.now() - startedAt };
    }

    await writeStrings(client, catalog, unique, batchSize);
    const baselines = await writeBaselines(client, catalog, unique, batchSize);
    await client.query(
      `insert into dash_tr_catalogs (catalog, build_hash) values ($1, $2)
       on conflict (catalog) do update set build_hash = excluded.build_hash, registered_at = now()`,
      [catalog, hash],
    );
    return { skipped: false, hash, strings: unique.length, baselines, milliseconds: performance.now() - startedAt };
  });
}

/**
 * Registers the dashboard's own catalog from the bundled files.
 *
 * @param entries The catalog's strings when the caller has already read them.
 */
export async function registerDashCatalog(entries?: readonly CatalogEntry[]): Promise<RegistrationResult> {
  return registerCatalog(dashCatalogId, entries ?? (await readDashCatalog()));
}
