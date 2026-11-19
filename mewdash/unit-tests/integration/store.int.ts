import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import pg from "pg";
import { builtinSeedEntries } from "$lib/server/wiki/builtin";
import { getCatalog } from "$lib/server/wiki";
import { closeDatabase, databaseReady, ensureDatabase, query } from "$lib/server/db";
import { runMigrations } from "$lib/server/migrate";
import * as store from "$lib/server/wiki/store";
import { WikiError } from "$lib/server/wiki/errors";

process.env.DATABASE_URL = process.env.WIKI_TEST_DATABASE_URL;

const actor = { id: "111111111111111111", name: "Tester" };
const other = { id: "222222222222222222", name: "Other" };
const editor = { id: "333333333333333333", name: "Editor" };

async function rejectsWith(promise: Promise<unknown>, code: string, status?: number) {
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof WikiError, String(error));
    assert.equal(error.code, code);
    if (status !== undefined) assert.equal(error.status, status);
    return true;
  });
}

const article = (title: string, markdown = "body", tags: string[] = []) => ({ title, summary: "s", markdown, tags });

describe("wiki database", () => {
  const pool = new pg.Pool({ connectionString: process.env.WIKI_TEST_DATABASE_URL, max: 2 });

  before(async () => {
    const tables = await pool.query<{ tablename: string }>("select tablename from pg_tables where schemaname = 'public' and tablename like 'dash\\_%'");
    for (const { tablename } of tables.rows) await pool.query(`drop table if exists ${tablename} cascade`);
  });

  describe("migrations and seed", () => {
    it("applies migrations and seeds on an empty database, then does nothing on a second run", async () => {
      await runMigrations(pool);
      const applied = await pool.query("select version, name from dash_schema_migrations order by version");
      assert.deepEqual(applied.rows, [
        { version: 1, name: "wiki" },
        { version: 2, name: "translations" },
      ]);
      const counts = async () =>
        (await pool.query<{ t: string; n: string }>(
          `select 'pages' t, count(*) n from dash_wiki_pages union all select 'versions', count(*) from dash_wiki_versions
           union all select 'revisions', count(*) from dash_wiki_revisions`,
        )).rows.map((r) => `${r.t}=${r.n}`).join(",");
      const first = await counts();
      await runMigrations(pool);
      assert.equal(await counts(), first);
      assert.equal((await pool.query("select * from dash_schema_migrations")).rowCount, 2);
    });

    it("seeds the same counts per locale as the built-in files", async () => {
      const entries = builtinSeedEntries();
      const expected = new Map<string, number>();
      for (const e of entries) expected.set(e.locale, (expected.get(e.locale) ?? 0) + 1);
      const versions = await pool.query<{ locale: string; n: string }>("select locale, count(*) n from dash_wiki_versions group by locale");
      const revisions = await pool.query<{ locale: string; n: string }>("select locale, count(*) n from dash_wiki_revisions group by locale");
      assert.equal(versions.rowCount, expected.size);
      for (const row of versions.rows) assert.equal(Number(row.n), expected.get(row.locale), `versions ${row.locale}`);
      for (const row of revisions.rows) assert.equal(Number(row.n), expected.get(row.locale), `revisions ${row.locale}`);
      const pages = await pool.query<{ n: string }>("select count(*) n from dash_wiki_pages");
      assert.equal(Number(pages.rows[0].n), expected.get("en-US"));
      const missing = await pool.query("select 1 from dash_wiki_versions where current_revision_id is null");
      assert.equal(missing.rowCount, 0);
    });

    it("keeps page details, tags and order from the built-in files", async () => {
      const afk = (await store.listManagePages()).find((p) => p.slug === "afk");
      assert.ok(afk);
      assert.equal(afk.icon, "fa-moon");
      assert.equal(afk.category, "Actions");
      assert.equal(afk.dashboardHref, "/dashboard/afk");
      assert.deepEqual(afk.related, ["utility", "administration"]);
      const pages = await store.listManagePages();
      const sorted = [...pages].sort((a, b) => a.title.localeCompare(b.title)).map((p) => p.slug);
      assert.deepEqual(pages.map((p) => p.slug), sorted);
      assert.equal(typeof pages[0].id, "string");
    });

    it("wires the pool through ensureDatabase", async () => {
      assert.equal(await ensureDatabase(), true);
      assert.equal(databaseReady(), true);
      assert.equal((await query("select 1 as one")).rows[0].one, 1);
    });
  });

  describe("pages and revisions", () => {
    let pageId = "";
    let r1 = "";
    let r2 = "";
    let r3 = "";

    it("creates a page unpublished with a first revision", async () => {
      pageId = await store.createPage(
        { slug: "it-page", icon: "fa-book", category: "ItCat", dashboardHref: null, module: null, related: [], published: false },
        article("First", "one"),
        actor,
      );
      assert.match(pageId, /^\d+$/);
      const page = await store.getManagePage(pageId);
      assert.equal(page?.published, false);
      assert.equal(page?.title, "First");
      const version = await store.getVersion(pageId, "en-US");
      assert.ok(version?.currentRevisionId);
      r1 = version.currentRevisionId;
      const catalog = await store.loadCatalog();
      assert.ok(!catalog.pages.some((p) => p.slug === "it-page"));
    });

    it("rejects a duplicate slug and a bad related slug", async () => {
      await rejectsWith(
        store.createPage({ slug: "it-page", icon: "fa-book", category: "ItCat", dashboardHref: null, module: null, related: [], published: false }, article("x"), actor),
        "slug_taken",
        409,
      );
      await rejectsWith(
        store.createPage({ slug: "it-other", icon: "fa-book", category: "ItCat", dashboardHref: null, module: null, related: ["no-such-page"], published: false }, article("x"), actor),
        "related_invalid",
      );
      assert.equal((await pool.query("select 1 from dash_wiki_pages where slug = 'it-other'")).rowCount, 0);
    });

    it("saves several edits and chains revisions", async () => {
      r2 = await store.saveVersion(pageId, "en-US", article("Second", "two", ["a"]), "second", actor, r1);
      r3 = await store.saveVersion(pageId, "en-US", article("Third", "three\nlines", ["a", "b"]), "third", other, r2);
      assert.deepEqual([r1, r2, r3].map((r) => Number(r)), [...[r1, r2, r3].map(Number)].sort((a, b) => a - b));
      const version = await store.getVersion(pageId, "en-US");
      assert.equal(version?.currentRevisionId, r3);
      assert.equal(version?.title, "Third");
      assert.deepEqual(version?.tags, ["a", "b"]);
      assert.equal(version?.updatedByName, "Other");
    });

    it("reports a conflict for a stale base and no_changes for identical text", async () => {
      await rejectsWith(store.saveVersion(pageId, "en-US", article("Stale", "x"), "", actor, r2), "conflict", 409);
      await rejectsWith(store.saveVersion(pageId, "en-US", article("Third", "three\nlines", ["a", "b"]), "", actor, r3), "no_changes", 409);
      await rejectsWith(store.saveVersion("999999999", "en-US", article("x"), "", actor, null), "not_found", 404);
      assert.equal((await store.listRevisions(pageId, "en-US", null, 50)).length, 3);
    });

    it("saves a new locale only when no revision is expected", async () => {
      await rejectsWith(store.saveVersion(pageId, "de-DE", article("Titel"), "", actor, r1), "conflict");
      const rev = await store.saveVersion(pageId, "de-DE", article("Titel"), "", actor, null);
      assert.ok(rev);
      assert.deepEqual(await store.listVersionLocales(pageId), ["de-DE", "en-US"]);
      assert.deepEqual(await store.getStartingTags(pageId, "fr-FR"), ["a", "b"]);
      assert.deepEqual(await store.getStartingTags(pageId, "de-DE"), []);
    });

    it("lists revisions newest first with paging and fetches them", async () => {
      const all = await store.listRevisions(pageId, "en-US", null, 50);
      assert.deepEqual(all.map((r) => r.id), [r3, r2, r1]);
      const page = await store.listRevisions(pageId, "en-US", r3, 1);
      assert.deepEqual(page.map((r) => r.id), [r2]);
      const full = await store.getRevision(r2);
      assert.equal(full?.markdown, "two");
      assert.equal(full?.authorName, "Tester");
      assert.equal(full?.note, "second");
      const prev = await store.getPreviousRevision(full!);
      assert.equal(prev?.id, r1);
      assert.equal(await store.getPreviousRevision((await store.getRevision(r1))!), null);
      assert.equal(await store.getRevision("999999999"), null);
    });

    it("undoes to an old revision as a new revision", async () => {
      const r4 = await store.undoToRevision(pageId, r1, "undo", actor, r3);
      const version = await store.getVersion(pageId, "en-US");
      assert.equal(version?.title, "First");
      assert.equal(version?.currentRevisionId, r4);
      assert.ok(Number(r4) > Number(r3));
      await rejectsWith(store.undoToRevision(pageId, r1, "", actor, r3), "conflict");
      await rejectsWith(store.undoToRevision(pageId, r1, "", actor, r4), "no_changes");
      await rejectsWith(store.undoToRevision(pageId, "999999999", "", actor, r4), "not_found");
      const recent = await store.listRecentChanges(5);
      assert.equal(recent[0].id, r4);
      assert.equal(recent[0].slug, "it-page");
      assert.equal(recent[0].pageTitle, "First");
    });

    it("changes details and the slug and rewrites related lists", async () => {
      const dependent = await store.createPage(
        { slug: "it-dependent", icon: "fa-book", category: "ItCat", dashboardHref: "/dashboard/it", module: "It", related: ["it-page"], published: false },
        article("Dependent"),
        actor,
      );
      await store.updatePage(pageId, { slug: "it-renamed", icon: "fa-moon", category: "ItCat", dashboardHref: "/dashboard/renamed", module: "Mod", related: ["it-dependent"], published: true });
      const page = await store.getManagePage(pageId);
      assert.deepEqual([page?.slug, page?.icon, page?.dashboardHref, page?.module, page?.published, page?.related], ["it-renamed", "fa-moon", "/dashboard/renamed", "Mod", true, ["it-dependent"]]);
      assert.deepEqual((await store.getManagePage(dependent))?.related, ["it-renamed"]);
      await store.updatePage(pageId, { dashboardHref: null, module: null });
      const cleared = await store.getManagePage(pageId);
      assert.equal(cleared?.dashboardHref, null);
      assert.equal(cleared?.module, null);
      await rejectsWith(store.updatePage(pageId, { slug: "it-dependent" }), "slug_taken", 409);
      await rejectsWith(store.updatePage(pageId, { related: ["it-renamed"] }), "related_invalid");
      await rejectsWith(store.updatePage("999999999", { icon: "fa-moon" }), "not_found");
      await store.updatePage(pageId, {});
      const catalog = await store.loadCatalog();
      assert.ok(catalog.pages.some((p) => p.slug === "it-renamed"));
      assert.ok(!catalog.pages.some((p) => p.slug === "it-dependent"));
      assert.ok(catalog.versions.get("it-renamed")?.get("de-DE"));
    });

    it("reorders inside a category and rejects a stale list", async () => {
      const ids = (await store.listManagePages()).filter((p) => p.category === "ItCat").map((p) => p.id);
      assert.equal(ids.length, 2);
      const before = (await pool.query<{ sort_order: number }>("select sort_order from dash_wiki_pages where category = 'ItCat' order by sort_order")).rows.map((r) => r.sort_order);
      const reversed = [...ids].reverse();
      await store.reorderCategory("ItCat", reversed);
      assert.deepEqual((await store.listManagePages()).filter((p) => p.category === "ItCat").map((p) => p.id), reversed);
      const after = (await pool.query<{ sort_order: number }>("select sort_order from dash_wiki_pages where category = 'ItCat' order by sort_order")).rows.map((r) => r.sort_order);
      assert.deepEqual(after, before);
      await rejectsWith(store.reorderCategory("ItCat", [ids[0]]), "list_changed", 409);
      await rejectsWith(store.reorderCategory("ItCat", [ids[0], ids[0]]), "list_changed");
      await rejectsWith(store.reorderCategory("ItCat", [ids[0], "999999999"]), "list_changed");
      assert.deepEqual((await store.listCategories()).includes("ItCat"), true);
    });

    it("soft deletes a page and lets the slug be reused", async () => {
      const gone = (await store.listManagePages()).find((p) => p.slug === "it-dependent")!;
      await store.deletePage(gone.id);
      assert.equal(await store.getManagePage(gone.id), null);
      assert.equal(await store.getRevision((await pool.query<{ id: string }>("select id from dash_wiki_revisions where page_id = $1 limit 1", [gone.id])).rows[0].id), null);
      await rejectsWith(store.deletePage(gone.id), "not_found", 404);
      const again = await store.createPage(
        { slug: "it-dependent", icon: "fa-book", category: "ItCat", dashboardHref: null, module: null, related: [], published: false },
        article("Reborn"),
        actor,
      );
      assert.notEqual(again, gone.id);
      assert.equal((await pool.query("select 1 from dash_wiki_pages where slug = 'it-dependent'")).rowCount, 2);
      await rejectsWith(store.saveVersion(gone.id, "en-US", article("x"), "", actor, null), "not_found");
    });

    it("exposes ids as strings that survive JSON", async () => {
      const page = (await store.listManagePages()).find((p) => p.slug === "it-renamed")!;
      const roundTrip = JSON.parse(JSON.stringify(page));
      assert.equal(roundTrip.id, page.id);
      assert.equal(typeof roundTrip.id, "string");
      const big = await pool.query<{ id: string }>("select (9223372036854775807)::bigint as id");
      assert.equal(big.rows[0].id, "9223372036854775807");
      assert.equal(typeof (await store.getVersion(page.id, "en-US"))?.currentRevisionId, "string");
      assert.equal(typeof (await store.listRecentChanges(1))[0].id, "string");
      assert.equal(typeof page.localeCount, "number");
      assert.equal(typeof page.openSuggestions, "number");
    });
  });

  describe("suggestions, feedback and editors", () => {
    let pageId = "";
    let base = "";
    let s1 = "";
    let s2 = "";

    before(async () => {
      pageId = await store.createPage(
        { slug: "it-sugg", icon: "fa-book", category: "SuggCat", dashboardHref: null, module: null, related: [], published: false },
        article("Base", "base text"),
        actor,
      );
      base = (await store.getVersion(pageId, "en-US"))!.currentRevisionId!;
    });

    it("refuses suggestions and feedback on an unpublished page", async () => {
      await rejectsWith(store.submitSuggestion(pageId, "en-US", article("x"), "", other), "not_found", 404);
      await rejectsWith(store.submitFeedback(pageId, "en-US", true, "", "", other.id), "not_found");
      await store.updatePage(pageId, { published: true });
    });

    it("replaces the same member's earlier open suggestion", async () => {
      s1 = await store.submitSuggestion(pageId, "en-US", article("Base", "better"), "first", other);
      s2 = await store.submitSuggestion(pageId, "en-US", article("Base", "even better"), "second", other);
      assert.notEqual(s1, s2);
      const rows = await pool.query<{ id: string; status: string; open_mark: number | null }>("select id, status, open_mark from dash_wiki_suggestions order by id");
      assert.deepEqual(rows.rows.map((r) => [r.id, r.status, r.open_mark]), [[s1, "replaced", null], [s2, "open", 1]]);
      const open = await store.getOpenSuggestion(pageId, "en-US", other.id);
      assert.equal(open?.id, s2);
      assert.equal(open?.baseRevisionId, base);
      assert.equal(open?.current?.revisionId, base);
      assert.equal(await store.getOpenSuggestion(pageId, "en-US", actor.id), null);
      assert.equal(typeof open?.id, "string");
    });

    it("rejects an unchanged suggestion and allows a different member and locale", async () => {
      await rejectsWith(store.submitSuggestion(pageId, "en-US", article("Base", "base text"), "", actor), "no_changes", 409);
      const third = await store.submitSuggestion(pageId, "en-US", article("Base", "member three"), "", actor);
      const german = await store.submitSuggestion(pageId, "de-DE", article("Basis", "deutsch"), "", other);
      assert.ok(third && german);
      assert.equal((await store.getOpenSuggestion(pageId, "de-DE", other.id))?.current?.title, "Base");
    });

    it("lists suggestions by status and by member", async () => {
      assert.equal((await store.listSuggestions("open", null, 50)).length, 3);
      assert.equal((await store.listSuggestions("replaced", null, 50)).length, 1);
      assert.equal((await store.listSuggestions("closed", null, 50)).length, 1);
      assert.equal((await store.listSuggestions(null, other.id, 50)).length, 3);
      assert.equal((await store.listSuggestions(null, actor.id, 50)).length, 1);
      assert.equal((await store.listSuggestions("open", other.id, 50)).length, 2);
      assert.equal((await store.listManagePages()).find((p) => p.id === pageId)?.openSuggestions, 3);
    });

    it("approves a suggestion and credits the suggester", async () => {
      const revisionId = await store.approveSuggestion(s2, editor);
      const revision = await store.getRevision(revisionId);
      assert.equal(revision?.authorId, other.id);
      assert.equal(revision?.authorName, "Other");
      assert.equal(revision?.note, "second");
      assert.equal((await store.getVersion(pageId, "en-US"))?.markdown, "even better");
      const row = (await store.listSuggestions("approved", null, 10))[0];
      assert.equal(row.id, s2);
      assert.equal(row.reviewedByName, "Editor");
      await rejectsWith(store.approveSuggestion(s2, editor), "conflict", 409);
      await rejectsWith(store.approveSuggestion("999999999", editor), "not_found");
      const after = await pool.query("select open_mark from dash_wiki_suggestions where id = $1", [s2]);
      assert.equal(after.rows[0].open_mark, null);
    });

    it("lets the member suggest again after approval, then declines it", async () => {
      const again = await store.submitSuggestion(pageId, "en-US", article("Base", "round two"), "", other);
      await store.declineSuggestion(again, editor, "not now");
      const declined = (await store.listSuggestions("declined", null, 10))[0];
      assert.equal(declined.declineReason, "not now");
      assert.equal(declined.status, "declined");
      await rejectsWith(store.declineSuggestion(again, editor, ""), "conflict", 409);
      const mine = await store.listSuggestions(null, other.id, 50);
      assert.deepEqual(new Set(mine.map((s) => s.status)), new Set(["replaced", "approved", "declined", "open"]));
    });

    it("records feedback, updates an unresolved answer and resolves it", async () => {
      await store.submitFeedback(pageId, "en-US", false, "unclear", "confusing", other.id);
      await store.submitFeedback(pageId, "en-US", false, "outdated", "old", other.id);
      let open = await store.listFeedback("open", 50);
      assert.equal(open.length, 1);
      assert.equal(open[0].reason, "outdated");
      assert.equal(open[0].pageTitle, "Base");
      await store.submitFeedback(pageId, "en-US", true, "outdated", "ignored", other.id);
      open = await store.listFeedback("open", 50);
      assert.deepEqual([open[0].helpful, open[0].reason, open[0].note], [true, "", ""]);
      await store.resolveFeedback(open[0].id, editor);
      assert.equal((await store.listFeedback("open", 50)).length, 0);
      assert.equal((await store.listFeedback("resolved", 50))[0].status, "resolved");
      await rejectsWith(store.resolveFeedback(open[0].id, editor), "not_found", 404);
      await store.submitFeedback(pageId, "en-US", true, "", "", other.id);
      assert.equal((await store.listFeedback(null, 50)).length, 2);
    });

    it("adds, finds, renames and removes editors", async () => {
      await store.addEditor(editor.id, "Editor", actor.id);
      await store.addEditor(editor.id, "Editor Renamed", actor.id);
      assert.equal(await store.isEditor(editor.id), true);
      assert.equal(await store.isEditor(other.id), false);
      assert.deepEqual((await store.listEditors()).map((e) => [e.userId, e.displayName, e.addedBy]), [[editor.id, "Editor Renamed", actor.id]]);
      await store.refreshEditorName(editor.id, "Editor Again");
      assert.equal((await store.listEditors())[0].displayName, "Editor Again");
      assert.equal(await store.knownName(editor.id), "Editor Again");
      assert.equal(await store.knownName(other.id), "Other");
      assert.equal(await store.knownName("444444444444444444"), null);
      await store.removeEditor(editor.id);
      assert.equal(await store.isEditor(editor.id), false);
      await rejectsWith(store.removeEditor(editor.id), "not_found", 404);
    });
  });

  describe("read path", () => {
    it("serves the database catalog through getCatalog with the database up", async () => {
      const { catalog, source } = await getCatalog();
      assert.equal(source, "database");
      assert.ok(catalog.pages.some((p) => p.slug === "afk"));
      assert.ok(!catalog.pages.some((p) => p.slug === "it-dependent" && p.id === "0"));
      assert.equal(typeof catalog.pages[0].id, "string");
      assert.ok(catalog.pages.every((p) => typeof p.sortOrder === "number"));
    });

    it("clears the cache on every write", async () => {
      const first = await getCatalog();
      assert.equal((await getCatalog()).catalog, first.catalog);
      const slug = first.catalog.pages.find((p) => p.slug === "it-sugg");
      assert.ok(slug);
      await store.updatePage(slug.id, { icon: "fa-moon" });
      const second = await getCatalog();
      assert.notEqual(second.catalog, first.catalog);
      assert.equal(second.catalog.pages.find((p) => p.slug === "it-sugg")?.icon, "fa-moon");
    });
  });

  it("closes", async () => {
    await pool.end();
    await closeDatabase();
  });
});
