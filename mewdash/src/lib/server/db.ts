import pg from "pg";
import { env } from "$env/dynamic/private";
import { logger } from "$lib/logger";
import { runMigrations } from "./migrate";

type DatabaseState = "disabled" | "pending" | "ready" | "failed";

const retryAfterMs = 30_000;

let pool: pg.Pool | null = null;
let state: DatabaseState = "pending";
let attempt: Promise<void> | null = null;
let attemptedOnce = false;
let lastFailureAt = 0;

/** True when `DATABASE_URL` is set. Without it the wiki serves the built-in files and cannot be edited. */
export function databaseConfigured(): boolean {
  return Boolean(env.DATABASE_URL?.trim());
}

/** True once migrations finished and the last start up did not fail. */
export function databaseReady(): boolean {
  return state === "ready";
}

function getPool(): pg.Pool {
  if (!pool) {
    pool = new pg.Pool({
      connectionString: env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 3_000,
      statement_timeout: 10_000,
      query_timeout: 15_000,
      application_name: "mewdash",
    });
    pool.on("error", (error) => {
      logger.error("Wiki database pool error:", error);
    });
  }
  return pool;
}

async function start(): Promise<void> {
  try {
    await runMigrations(getPool());
    state = "ready";
    logger.info("Wiki database is ready");
  } catch (error) {
    state = "failed";
    lastFailureAt = Date.now();
    logger.error("Wiki database could not be prepared, serving the built-in wiki files:", error);
  } finally {
    attemptedOnce = true;
    attempt = null;
  }
}

/**
 * Makes sure the database has been migrated. The first call waits for start up to finish. After a
 * failure the next attempt runs in the background at most every 30 seconds, and callers are told
 * the database is not ready until one succeeds.
 *
 * @returns Whether queries can run now.
 */
export async function ensureDatabase(): Promise<boolean> {
  if (state === "ready") return true;
  if (!databaseConfigured()) {
    if (state !== "disabled") {
      state = "disabled";
      logger.warn("DATABASE_URL is not set. The wiki serves the built-in files and cannot be edited.");
    }
    return false;
  }
  if (attempt) {
    if (!attemptedOnce) await attempt;
    return databaseReady();
  }
  if (state === "pending" || (state === "failed" && Date.now() - lastFailureAt >= retryAfterMs)) {
    attempt = start();
    if (!attemptedOnce) await attempt;
  }
  return databaseReady();
}

/** Closes the pool. Used by the integration tests so the process can exit. */
export async function closeDatabase(): Promise<void> {
  const open = pool;
  pool = null;
  if (open) await open.end();
}

/**
 * Starts the database at server start without holding anything up.
 */
export function startDatabase(): void {
  void ensureDatabase();
}

/**
 * Runs a parameterised query.
 *
 * @param text SQL with `$1` style placeholders. Never build it from user input.
 * @param params The values for the placeholders.
 */
export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(text: string, params: unknown[] = []): Promise<pg.QueryResult<T>> {
  return getPool().query<T>(text, params);
}

/**
 * Runs `work` in a transaction on one connection. It commits when `work` returns and rolls back
 * when it throws.
 *
 * @param work The statements to run.
 */
export async function withTransaction<T>(work: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("begin");
    const result = await work(client);
    await client.query("commit");
    return result;
  } catch (error) {
    try {
      await client.query("rollback");
    } catch (rollbackError) {
      logger.error("Rollback failed:", rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}
