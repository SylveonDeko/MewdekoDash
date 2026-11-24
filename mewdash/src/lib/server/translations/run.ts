import type pg from "pg";
import { query } from "$lib/server/db";

/** Runs one statement, on the pool or on the client of a transaction. */
export type Run = <T extends pg.QueryResultRow>(text: string, params?: unknown[]) => Promise<pg.QueryResult<T>>;

export const poolRun: Run = <T extends pg.QueryResultRow>(text: string, params: unknown[] = []) => query<T>(text, params);

export const clientRun =
  (client: pg.PoolClient): Run =>
  <T extends pg.QueryResultRow>(text: string, params: unknown[] = []) =>
    client.query<T>(text, params);
