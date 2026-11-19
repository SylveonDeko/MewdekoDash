import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getCatalog } from "$lib/server/wiki";
import { databaseReady, ensureDatabase } from "$lib/server/db";

process.env.DATABASE_URL = "postgresql://postgres:none@127.0.0.1:1/none";

describe("fallback to the built-in files", () => {
  const errors: unknown[][] = [];
  const realError = console.error;
  const realNow = Date.now;
  let skew = 0;

  it("serves the built-in files when the database is unreachable and retries on a schedule", async () => {
    console.error = (...args: unknown[]) => {
      errors.push(args);
    };
    Date.now = () => realNow() + skew;
    try {
      const first = await getCatalog();
      assert.equal(first.source, "builtin");
      assert.ok(first.catalog.pages.length >= 76);
      assert.equal(databaseReady(), false);
      assert.equal(errors.length, 1, "one start up failure is logged");

      const second = await getCatalog();
      assert.equal(second.source, "builtin");
      assert.equal(second.catalog, first.catalog);
      assert.equal(await ensureDatabase(), false);
      assert.equal(errors.length, 1, "no retry inside 30 seconds");

      skew = 31_000;
      const third = await getCatalog();
      assert.equal(third.source, "builtin");
      await new Promise((resolve) => setTimeout(resolve, 500));
      assert.equal(errors.length, 2, "a background retry ran after 30 seconds");
      assert.equal(await ensureDatabase(), false);
      assert.equal(errors.length, 2, "and not again right away");
    } finally {
      console.error = realError;
      Date.now = realNow;
    }
  });
});
