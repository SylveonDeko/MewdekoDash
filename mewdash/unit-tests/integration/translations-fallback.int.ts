import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { databaseReady } from "$lib/server/db";
import { overlayFor } from "$lib/server/translations/overlay";
import { notifyReload } from "$lib/server/translations/reload";
import { startTranslations } from "$lib/server/translations/startup";

process.env.DATABASE_URL = "postgresql://postgres:none@127.0.0.1:1/none";

describe("translations without a database or Redis", () => {
  const realError = console.error;

  it("starts without waiting, serves no overlay and does nothing about Redis", async () => {
    console.error = () => undefined;
    try {
      const startedAt = performance.now();
      startTranslations();
      assert.ok(performance.now() - startedAt < 50, "start up returns at once");

      await new Promise((resolve) => setTimeout(resolve, 300));
      assert.equal(databaseReady(), false);
      assert.equal(overlayFor("de-DE"), null);
      assert.equal(overlayFor("fr-FR"), null);

      await notifyReload("bot");
      await notifyReload("dash");
    } finally {
      console.error = realError;
    }
  });
});
