import assert from "node:assert/strict";
import { before, after, describe, it } from "node:test";
import pg from "pg";
import { closeDatabase, ensureDatabase } from "$lib/server/db";
import { runMigrations } from "$lib/server/migrate";
import { readDashCatalog } from "$lib/server/translations/dashCatalog";
import type { CatalogEntry } from "$lib/server/translations/hash";
import { overlayFor, refreshOverlay, resetOverlay } from "$lib/server/translations/overlay";
import { registerCatalog, registerDashCatalog } from "$lib/server/translations/register";
import { reloadChannel, reloadMessage, setReloadPublisher } from "$lib/server/translations/reload";
import * as store from "$lib/server/translations/store";
import { WikiError } from "$lib/server/wiki/errors";
import type { TranslationScope } from "$lib/translate/permissions";

const baseUrl = process.env.WIKI_TEST_DATABASE_URL as string;
const schema = "tr_it";
const scopedUrl = new URL(baseUrl);
scopedUrl.searchParams.set("options", `-c search_path=${schema}`);
process.env.DATABASE_URL = scopedUrl.toString();

const alice = { id: "111111111111111111", name: "Alice" };
const bob = { id: "222222222222222222", name: "Bob" };
const carol = { id: "333333333333333333", name: "Carol" };
const adminScope: TranslationScope = { admin: true, locales: [] };
const germanScope: TranslationScope = { admin: false, locales: ["de-DE"] };
const frenchScope: TranslationScope = { admin: false, locales: ["fr-FR"] };
const memberScope: TranslationScope = { admin: false, locales: [] };

async function rejectsWith(promise: Promise<unknown>, code: string, status?: number) {
  await assert.rejects(promise, (error: unknown) => {
    assert.ok(error instanceof WikiError, String(error));
    assert.equal(error.code, code);
    if (status !== undefined) assert.equal(error.status, status);
    return true;
  });
}

const entry = (key: string, group: string, source: string, baselines: Record<string, string> = {}): CatalogEntry => ({ key, group, source, baselines });

const readStarted = performance.now();
const bundled = await readDashCatalog();
const readMs = performance.now() - readStarted;

function botEntries(): CatalogEntry[] {
  const entries = [
    entry("a.hello", "a", "Hello {0}", { "de-DE": "Hallo {0}" }),
    entry("a.bye", "a", "Bye", { "de-DE": "Bye" }),
    entry("a.only_en", "a", "Only English"),
    entry("a.count", "a", "Total {0:N0} items", { "de-DE": "Gesamt {0:N0} Elemente", "fr-FR": "Total {0:N0} elements" }),
    entry("b.percent", "b", "100% sure_thing"),
  ];
  for (let n = 1; n <= 120; n++) {
    entries.push(entry(`p.k${String(n).padStart(3, "0")}`, "p", `Paged number ${n}`, n % 2 === 0 ? { "de-DE": `Seite ${n}` } : {}));
  }
  return entries;
}

describe("translations database", () => {
  const admin = new pg.Pool({ connectionString: baseUrl, max: 1 });
  const pool = new pg.Pool({ connectionString: scopedUrl.toString(), max: 2 });
  const sent: Array<[string, string]> = [];

  const version = async (catalog: string) =>
    Number((await pool.query<{ version: string }>("select version from dash_tr_catalogs where catalog = $1", [catalog])).rows[0].version);

  async function resetState() {
    await pool.query("truncate dash_tr_suggestions, dash_tr_overrides, dash_translators restart identity");
    await pool.query("update dash_tr_catalogs set version = 0");
    sent.length = 0;
  }

  before(async () => {
    await admin.query(`drop schema if exists ${schema} cascade`);
    await admin.query(`create schema ${schema}`);
    setReloadPublisher(async (channel, message) => {
      sent.push([channel, message]);
      return true;
    });
  });

  after(async () => {
    setReloadPublisher(null);
    resetOverlay();
    await closeDatabase();
    await pool.end();
    await admin.query(`drop schema if exists ${schema} cascade`);
    await admin.end();
  });

  describe("migration", () => {
    it("creates the tables and records the migration, and a second run changes nothing", async () => {
      await runMigrations(pool);
      const applied = await pool.query("select version, name from dash_schema_migrations order by version");
      assert.deepEqual(applied.rows, [
        { version: 1, name: "wiki" },
        { version: 2, name: "translations" },
        { version: 3, name: "wiki_features" },
        { version: 4, name: "translations_history_blocks_settings" },
      ]);
      const tables = await pool.query<{ tablename: string }>("select tablename from pg_tables where schemaname = $1 and (tablename like 'dash\\_tr\\_%' or tablename = 'dash_translators') order by tablename", [schema]);
      assert.deepEqual(
        tables.rows.map((row) => row.tablename),
        ["dash_tr_baselines", "dash_tr_blocks", "dash_tr_catalogs", "dash_tr_events", "dash_tr_overrides", "dash_tr_settings", "dash_tr_strings", "dash_tr_suggestions", "dash_translators"],
      );
      await runMigrations(pool);
      assert.equal((await pool.query("select * from dash_schema_migrations")).rowCount, 4);
    });

    it("has the columns, defaults and keys of the contract", async () => {
      const columns = async (table: string) =>
        (await pool.query<{ column_name: string; data_type: string; is_nullable: string; column_default: string | null }>(
          "select column_name, data_type, is_nullable, column_default from information_schema.columns where table_schema = $1 and table_name = $2 order by ordinal_position",
          [schema, table],
        )).rows;
      const catalogs = await columns("dash_tr_catalogs");
      assert.deepEqual(catalogs.map((c) => c.column_name), ["catalog", "build_hash", "version", "registered_at"]);
      assert.equal(catalogs.find((c) => c.column_name === "version")?.data_type, "bigint");
      assert.equal(catalogs.find((c) => c.column_name === "version")?.column_default, "0");

      const strings = await columns("dash_tr_strings");
      assert.deepEqual(strings.map((c) => c.column_name), ["catalog", "key", "grp", "source_text", "updated_at"]);
      assert.equal(strings.find((c) => c.column_name === "grp")?.column_default, "''::text");

      const overrides = await columns("dash_tr_overrides");
      assert.deepEqual(overrides.map((c) => c.column_name), ["catalog", "key", "locale", "text", "source_text", "updated_at", "updated_by", "updated_by_name"]);
      assert.equal(overrides.find((c) => c.column_name === "updated_by")?.is_nullable, "YES");

      const suggestions = await columns("dash_tr_suggestions");
      assert.deepEqual(
        suggestions.map((c) => c.column_name),
        ["id", "catalog", "key", "locale", "text", "source_text", "user_id", "user_name", "status", "open_mark", "decline_reason", "created_at", "reviewed_at", "reviewed_by", "reviewed_by_name", "origin"],
      );
      assert.equal(suggestions.find((c) => c.column_name === "open_mark")?.data_type, "smallint");
      assert.equal(suggestions.find((c) => c.column_name === "open_mark")?.column_default, "1");
      assert.equal(suggestions.find((c) => c.column_name === "status")?.column_default, "'open'::text");

      const translators = await columns("dash_translators");
      assert.deepEqual(translators.map((c) => c.column_name), ["user_id", "locale", "display_name", "added_by", "added_at"]);

      const indexes = await pool.query<{ indexname: string }>("select indexname from pg_indexes where schemaname = $1 and tablename like 'dash\\_tr\\_%'", [schema]);
      const names = indexes.rows.map((row) => row.indexname);
      for (const expected of ["dash_tr_strings_group", "dash_tr_overrides_locale", "dash_tr_suggestions_queue", "dash_tr_suggestions_user"]) {
        assert.ok(names.includes(expected), expected);
      }
    });

    it("enforces one open suggestion per member and string, and allows many closed ones", async () => {
      const insert = (status: string, mark: number | null) =>
        pool.query(
          "insert into dash_tr_suggestions (catalog, key, locale, text, source_text, user_id, user_name, status, open_mark) values ('x', 'k', 'de-DE', 't', 's', 'u', 'U', $1, $2)",
          [status, mark],
        );
      await insert("open", 1);
      await assert.rejects(insert("open", 1), (error: { code?: string }) => error.code === "23505");
      await insert("declined", null);
      await insert("declined", null);
      await assert.rejects(insert("open", null), (error: { code?: string }) => error.code === "23514");
      await assert.rejects(insert("bogus", null), (error: { code?: string }) => error.code === "23514");
      await pool.query("truncate dash_tr_suggestions restart identity");
    });
  });

  describe("registration", () => {
    it("registers a catalog on the first run in batches and skips an unchanged one", async () => {
      const entries = botEntries();
      const first = await registerCatalog("bot", entries, 7);
      assert.equal(first.skipped, false);
      assert.equal(first.strings, 125);
      assert.equal(first.baselines, 64);
      assert.match(first.hash, /^[0-9a-f]{64}$/);

      const strings = await pool.query<{ n: string }>("select count(*) n from dash_tr_strings where catalog = 'bot'");
      const baselines = await pool.query<{ n: string }>("select count(*) n from dash_tr_baselines where catalog = 'bot'");
      assert.equal(Number(strings.rows[0].n), 125);
      assert.equal(Number(baselines.rows[0].n), first.baselines);
      const catalog = await pool.query<{ build_hash: string; version: string }>("select build_hash, version from dash_tr_catalogs where catalog = 'bot'");
      assert.equal(catalog.rows[0].build_hash, first.hash);
      assert.equal(catalog.rows[0].version, "0");
      const group = await pool.query<{ grp: string }>("select grp from dash_tr_strings where catalog = 'bot' and key = 'a.hello'");
      assert.equal(group.rows[0].grp, "a");

      const before = await pool.query("select registered_at from dash_tr_catalogs where catalog = 'bot'");
      const second = await registerCatalog("bot", [...entries].reverse(), 7);
      assert.equal(second.skipped, true);
      assert.equal(second.hash, first.hash);
      const afterRun = await pool.query("select registered_at from dash_tr_catalogs where catalog = 'bot'");
      assert.deepEqual(afterRun.rows, before.rows);
    });

    it("touches updated_at only for strings whose source text changed, deletes gone keys and replaces baselines", async () => {
      const stamp = async (key: string) =>
        (await pool.query<{ updated_at: Date }>("select updated_at from dash_tr_strings where catalog = 'bot' and key = $1", [key])).rows[0]?.updated_at.getTime();
      const helloBefore = await stamp("a.hello");
      const byeBefore = await stamp("a.bye");
      await pool.query("update dash_tr_catalogs set version = 7 where catalog = 'bot'");
      await new Promise((resolve) => setTimeout(resolve, 20));

      const next = botEntries()
        .filter((e) => e.key !== "a.only_en")
        .map((e) => (e.key === "a.hello" ? entry(e.key, e.group, "Hello there {0}", e.baselines) : e.key === "a.bye" ? entry(e.key, e.group, "Bye", { "de-DE": "Tschuss" }) : e));
      const result = await registerCatalog("bot", next, 10);
      assert.equal(result.skipped, false);
      assert.equal(result.strings, 124);

      assert.ok((await stamp("a.hello")) !== helloBefore, "changed source moves updated_at");
      assert.equal(await stamp("a.bye"), byeBefore, "unchanged source keeps updated_at");
      assert.equal(await stamp("a.only_en"), undefined, "gone key is deleted");
      assert.equal(await version("bot"), 7, "version is never touched");
      const bye = await pool.query<{ text: string }>("select text from dash_tr_baselines where catalog = 'bot' and key = 'a.bye' and locale = 'de-DE'");
      assert.equal(bye.rows[0].text, "Tschuss");

      await registerCatalog("bot", botEntries(), 10);
      assert.equal(await version("bot"), 7);
      assert.equal((await pool.query("select 1 from dash_tr_strings where catalog = 'bot' and key = 'a.only_en'")).rowCount, 1);
    });

    it("keeps overrides and suggestions for keys that no longer exist", async () => {
      await pool.query(
        "insert into dash_tr_overrides (catalog, key, locale, text, source_text) values ('bot', 'a.only_en', 'de-DE', 'Nur Englisch', 'Only English')",
      );
      await registerCatalog("bot", botEntries().filter((e) => e.key !== "a.only_en"), 10);
      assert.equal((await pool.query("select 1 from dash_tr_overrides where key = 'a.only_en'")).rowCount, 1);
      await registerCatalog("bot", botEntries(), 10);
      await pool.query("truncate dash_tr_overrides");
    });

    it("lets only one of two concurrent registrations write", async () => {
      const entries = [entry("c.one", "c", "One", { "de-DE": "Eins" }), entry("c.two", "c", "Two")];
      const results = await Promise.all([registerCatalog("race", entries), registerCatalog("race", entries), registerCatalog("race", entries)]);
      assert.equal(results.filter((r) => !r.skipped).length, 1);
      assert.equal((await pool.query("select 1 from dash_tr_strings where catalog = 'race'")).rowCount, 2);
      await pool.query("delete from dash_tr_strings where catalog = 'race'");
      await pool.query("delete from dash_tr_baselines where catalog = 'race'");
      await pool.query("delete from dash_tr_catalogs where catalog = 'race'");
    });

    it("registers the dashboard's bundled catalogs, then skips them", async () => {
      const baselineCount = bundled.reduce((sum, e) => sum + Object.keys(e.baselines).length, 0);
      assert.ok(bundled.length > 5000, `bundled strings: ${bundled.length}`);

      const firstStarted = performance.now();
      const first = await registerDashCatalog(bundled);
      const firstMs = performance.now() - firstStarted;
      assert.equal(first.skipped, false);
      assert.equal(first.strings, bundled.length);
      assert.equal(first.baselines, baselineCount);

      const secondStarted = performance.now();
      const second = await registerDashCatalog(bundled);
      const secondMs = performance.now() - secondStarted;
      assert.equal(second.skipped, true);
      assert.equal(second.hash, first.hash);

      console.log(
        `dash registration: ${first.strings} strings, ${first.baselines} built-in translations; read ${readMs.toFixed(0)} ms, first run ${firstMs.toFixed(0)} ms (write ${first.milliseconds.toFixed(0)} ms), unchanged run ${secondMs.toFixed(0)} ms (check ${second.milliseconds.toFixed(0)} ms)`,
      );

      const save = await pool.query<{ grp: string; source_text: string }>("select grp, source_text from dash_tr_strings where catalog = 'dash' and key = '_common.save'");
      assert.deepEqual(save.rows, [{ grp: "_common", source_text: "Save" }]);
      const locales = await store.catalogLocales("dash");
      assert.ok(locales.includes("de-DE") && !locales.includes("en-US"));
    });
  });

  describe("strings, flags and paging", () => {
    before(resetState);

    it("lists catalogs with groups and per language progress", async () => {
      const overview = await store.getOverview();
      assert.deepEqual(overview.map((c) => c.catalog), ["bot", "dash"]);
      const bot = overview[0];
      assert.equal(bot.total, 125);
      assert.deepEqual(bot.groups, ["a", "b", "p"]);
      assert.deepEqual(bot.languages.map((l) => l.locale), await store.allLocales());
      const de = bot.languages.find((l) => l.locale === "de-DE");
      assert.deepEqual({ ...de }, { locale: "de-DE", total: 125, untranslated: 63, outdated: 0, openSuggestions: 0 });
      assert.equal(bot.languages.find((l) => l.locale === "fr-FR")?.untranslated, 124);
    });

    it("pages 50 at a time ordered by group and key", async () => {
      const base = { catalog: "bot", locale: "de-DE", group: null, filter: "all" as const, search: "" };
      const one = await store.listStrings({ ...base, page: 1 }, null);
      assert.equal(one.total, 125);
      assert.equal(one.pageSize, 50);
      assert.equal(one.rows.length, 50);
      assert.deepEqual(one.rows.slice(0, 6).map((r) => r.key), ["a.bye", "a.count", "a.hello", "a.only_en", "b.percent", "p.k001"]);
      const three = await store.listStrings({ ...base, page: 3 }, null);
      assert.equal(three.rows.length, 25);
      assert.equal(three.rows[24].key, "p.k120");
      const beyond = await store.listStrings({ ...base, page: 9 }, null);
      assert.equal(beyond.rows.length, 0);
      assert.equal(beyond.total, 125);
      const keys = new Set([...one.rows, ...(await store.listStrings({ ...base, page: 2 }, null)).rows, ...three.rows].map((r) => r.key));
      assert.equal(keys.size, 125);
    });

    it("filters by group", async () => {
      const result = await store.listStrings({ catalog: "bot", locale: "de-DE", group: "p", filter: "all", search: "", page: 3 }, null);
      assert.equal(result.total, 120);
      assert.equal(result.rows.length, 20);
      assert.ok(result.rows.every((r) => r.group === "p"));
      const none = await store.listStrings({ catalog: "bot", locale: "de-DE", group: "zzz", filter: "all", search: "", page: 1 }, null);
      assert.equal(none.total, 0);
    });

    it("flags untranslated strings, and counts a built-in text equal to the source as untranslated", async () => {
      const result = await store.listStrings({ catalog: "bot", locale: "de-DE", group: "a", filter: "all", search: "", page: 1 }, null);
      const byKey = new Map(result.rows.map((r) => [r.key, r]));
      assert.equal(byKey.get("a.hello")?.untranslated, false);
      assert.equal(byKey.get("a.hello")?.translation, "Hallo {0}");
      assert.equal(byKey.get("a.bye")?.untranslated, true);
      assert.equal(byKey.get("a.bye")?.translation, "Bye");
      assert.equal(byKey.get("a.only_en")?.untranslated, true);
      assert.equal(byKey.get("a.only_en")?.translation, null);

      const only = await store.listStrings({ catalog: "bot", locale: "de-DE", group: null, filter: "untranslated", search: "", page: 1 }, null);
      assert.equal(only.total, 63);
      assert.ok(only.rows.every((r) => r.untranslated));
    });

    it("searches key, source text and translation, ignoring case, and treats wildcards literally", async () => {
      const search = async (term: string, locale = "de-DE") =>
        (await store.listStrings({ catalog: "bot", locale, group: null, filter: "all", search: term, page: 1 }, null)).rows.map((r) => r.key);
      assert.deepEqual(await search("HALLO"), ["a.hello"]);
      assert.deepEqual(await search("only english"), ["a.only_en"]);
      assert.deepEqual(await search("k007"), ["p.k007"]);
      assert.deepEqual(await search("%"), ["b.percent"]);
      assert.deepEqual(await search("_"), ["a.only_en", "b.percent"]);
      assert.deepEqual(await search("Seite 12"), ["p.k012", "p.k120"]);
      assert.deepEqual(await search("Seite 120"), ["p.k120"]);
      assert.deepEqual(await search("Seite 12", "fr-FR"), []);
      assert.deepEqual(await search("nothing like this"), []);
      assert.deepEqual(await search("'; drop table dash_tr_strings; --"), []);
      assert.equal((await pool.query("select 1 from dash_tr_strings")).rowCount! > 0, true);
    });

    it("searches the override text once there is one", async () => {
      await store.saveOverride("bot", "a.hello", "de-DE", "Servus {0}", alice, germanScope);
      const hits = await store.listStrings({ catalog: "bot", locale: "de-DE", group: null, filter: "all", search: "servus", page: 1 }, null);
      assert.deepEqual(hits.rows.map((r) => r.key), ["a.hello"]);
      const old = await store.listStrings({ catalog: "bot", locale: "de-DE", group: null, filter: "all", search: "hallo", page: 1 }, null);
      assert.deepEqual(old.rows.map((r) => r.key), []);
      await resetState();
    });

    it("rejects an unknown catalog or language", async () => {
      await rejectsWith(store.listStrings({ catalog: "nope", locale: "de-DE", group: null, filter: "all", search: "", page: 1 }, null), "not_found", 404);
      await rejectsWith(store.listStrings({ catalog: "bot", locale: "xx-XX", group: null, filter: "all", search: "", page: 1 }, null), "locale_invalid", 400);
      await rejectsWith(store.listStrings({ catalog: "bot", locale: "en-US", group: null, filter: "all", search: "", page: 1 }, null), "locale_invalid", 400);
    });
  });

  describe("suggestions", () => {
    before(resetState);

    it("stores a suggestion with the source text it was written against", async () => {
      const id = await store.submitSuggestion("bot", "a.only_en", "de-DE", "  Nur Englisch  ", alice);
      assert.match(id, /^\d+$/);
      const row = await pool.query("select text, source_text, status, open_mark, user_id, user_name from dash_tr_suggestions where id = $1", [id]);
      assert.deepEqual(row.rows[0], { text: "Nur Englisch", source_text: "Only English", status: "open", open_mark: 1, user_id: alice.id, user_name: "Alice" });
      assert.equal(await version("bot"), 0);
    });

    it("replaces the member's open suggestion for the same string and language", async () => {
      const first = await store.submitSuggestion("bot", "a.only_en", "de-DE", "Nur Englisch", bob);
      const second = await store.submitSuggestion("bot", "a.only_en", "de-DE", "Bloss Englisch", bob);
      const rows = await pool.query<{ id: string; status: string; open_mark: number | null }>("select id, status, open_mark from dash_tr_suggestions where user_id = $1 order by id", [bob.id]);
      assert.deepEqual(rows.rows, [
        { id: first, status: "replaced", open_mark: null },
        { id: second, status: "open", open_mark: 1 },
      ]);
      await store.submitSuggestion("bot", "a.only_en", "fr-FR", "Seulement anglais", bob);
      const open = await pool.query("select 1 from dash_tr_suggestions where user_id = $1 and status = 'open'", [bob.id]);
      assert.equal(open.rowCount, 2, "another language is a separate suggestion");
    });

    it("keeps suggestions from different members side by side", async () => {
      const open = await pool.query("select user_id from dash_tr_suggestions where key = 'a.only_en' and locale = 'de-DE' and status = 'open' order by user_id");
      assert.deepEqual(open.rows.map((r) => r.user_id), [alice.id, bob.id]);
    });

    it("enforces the rules for a translation", async () => {
      const submit = (key: string, text: unknown, locale = "de-DE") => store.submitSuggestion("bot", key, locale, text, carol);
      await rejectsWith(submit("a.only_en", ""), "translation_empty", 400);
      await rejectsWith(submit("a.only_en", "   \n "), "translation_empty", 400);
      await rejectsWith(submit("a.only_en", 12), "bad_request", 400);
      await rejectsWith(submit("a.only_en", "a".repeat(4001)), "translation_too_long", 400);
      await submit("a.only_en", "a".repeat(4000));
      await rejectsWith(submit("a.hello", "Hallo {0}"), "translation_unchanged", 400);
      await rejectsWith(submit("a.hello", "Hallo"), "placeholders_mismatch", 400);
      await rejectsWith(submit("a.hello", "Hallo {1}"), "placeholders_mismatch", 400);
      await rejectsWith(submit("a.count", "Gesamt {0} Elemente"), "placeholders_mismatch", 400);
      await submit("a.count", "Summe {0:N0} Stuck");
      await rejectsWith(submit("a.nope", "x"), "not_found", 404);
      await rejectsWith(submit("a.only_en", "x", "xx-XX"), "locale_invalid", 400);
      await rejectsWith(submit("a.only_en", "x", "en-US"), "locale_invalid", 400);
      await pool.query("delete from dash_tr_suggestions where user_id = $1", [carol.id]);
    });

    it("limits a member to 200 open suggestions but still lets one be replaced", async () => {
      const limited = { id: "999999999999999999", name: "Limited" };
      await pool.query(
        `insert into dash_tr_suggestions (catalog, key, locale, text, source_text, user_id, user_name)
         select 'bot', 'p.k' || lpad(n::text, 3, '0'), case when n <= 120 then 'de-DE' else 'fr-FR' end, 'x' || n, 's', $1, 'Limited'
           from generate_series(1, 200) n`,
        [limited.id],
      );
      assert.equal(Number((await pool.query("select count(*) n from dash_tr_suggestions where user_id = $1 and status = 'open'", [limited.id])).rows[0].n), 200);
      await rejectsWith(store.submitSuggestion("bot", "a.only_en", "de-DE", "Nur Englisch", limited), "too_many_suggestions", 409);
      await store.submitSuggestion("bot", "p.k001", "de-DE", "Seite eins", limited);
      assert.equal(Number((await pool.query("select count(*) n from dash_tr_suggestions where user_id = $1 and status = 'open'", [limited.id])).rows[0].n), 200);
      await pool.query("delete from dash_tr_suggestions where user_id = $1", [limited.id]);
      await store.submitSuggestion("bot", "a.only_en", "de-DE", "Nur Englisch", limited);
    });

    it("attaches the viewer's open suggestion to the list and counts open ones", async () => {
      const page = await store.listStrings({ catalog: "bot", locale: "de-DE", group: "a", filter: "all", search: "", page: 1 }, alice.id);
      const row = page.rows.find((r) => r.key === "a.only_en");
      assert.equal(row?.mine?.text, "Nur Englisch");
      assert.match(row?.mine?.id ?? "", /^\d+$/);
      assert.equal(row?.openSuggestions, 3);
      const other = await store.listStrings({ catalog: "bot", locale: "de-DE", group: "a", filter: "all", search: "", page: 1 }, null);
      assert.equal(other.rows.find((r) => r.key === "a.only_en")?.mine, null);
      assert.equal(other.rows.find((r) => r.key === "a.hello")?.openSuggestions, 0);
    });

    it("filters strings that have open suggestions and counts them in the overview", async () => {
      const result = await store.listStrings({ catalog: "bot", locale: "de-DE", group: null, filter: "suggestions", search: "", page: 1 }, null);
      assert.deepEqual(result.rows.map((r) => r.key), ["a.only_en"]);
      const overview = await store.getOverview();
      const bot = overview.find((c) => c.catalog === "bot")!;
      assert.equal(bot.languages.find((l) => l.locale === "de-DE")?.openSuggestions, 3);
      assert.equal(bot.languages.find((l) => l.locale === "fr-FR")?.openSuggestions, 1);
    });

    it("lists a member's own suggestions newest first, 50 at a time", async () => {
      await pool.query(
        `insert into dash_tr_suggestions (catalog, key, locale, text, source_text, user_id, user_name, status, open_mark)
         select 'bot', 'p.k' || lpad(n::text, 3, '0'), 'de-DE', 'y' || n, 's', $1, 'Pager', 'declined', null from generate_series(1, 60) n`,
        [carol.id],
      );
      const one = await store.listMySuggestions(carol.id, 1);
      assert.equal(one.total, 60);
      assert.equal(one.rows.length, 50);
      assert.equal(one.rows[0].text, "y60");
      assert.equal(one.rows[0].group, "p");
      assert.equal(one.rows[0].currentSource, "Paged number 60");
      const two = await store.listMySuggestions(carol.id, 2);
      assert.equal(two.rows.length, 10);
      assert.equal((await store.listMySuggestions("0", 1)).total, 0);
      await pool.query("delete from dash_tr_suggestions where user_id = $1", [carol.id]);
    });
  });

  describe("review", () => {
    before(resetState);

    it("approves a suggestion into an override, bumps the version and tells the bots", async () => {
      const id = await store.submitSuggestion("bot", "a.only_en", "de-DE", "Nur Englisch", alice);
      const result = await store.approveSuggestion(id, carol, germanScope);
      assert.deepEqual(result, { catalog: "bot", key: "a.only_en", locale: "de-DE", text: "Nur Englisch" });

      const override = await pool.query("select text, source_text, updated_by, updated_by_name from dash_tr_overrides where key = 'a.only_en' and locale = 'de-DE'");
      assert.deepEqual(override.rows[0], { text: "Nur Englisch", source_text: "Only English", updated_by: carol.id, updated_by_name: "Carol" });
      const suggestion = await pool.query("select status, open_mark, reviewed_by, reviewed_by_name from dash_tr_suggestions where id = $1", [id]);
      assert.deepEqual(suggestion.rows[0], { status: "approved", open_mark: null, reviewed_by: carol.id, reviewed_by_name: "Carol" });
      assert.equal(await version("bot"), 1);
      assert.deepEqual(sent, [[reloadChannel, reloadMessage]]);
      assert.deepEqual(sent[0], ["mewdeko:translations:reload", "bot"]);

      const row = (await store.listStrings({ catalog: "bot", locale: "de-DE", group: "a", filter: "all", search: "", page: 1 }, null)).rows.find((r) => r.key === "a.only_en");
      assert.equal(row?.translation, "Nur Englisch");
      assert.equal(row?.untranslated, false);
      assert.equal(row?.hasOverride, true);
      assert.equal(row?.updatedByName, "Carol");
    });

    it("refuses to approve twice, or an unknown suggestion", async () => {
      const id = (await pool.query<{ id: string }>("select id from dash_tr_suggestions where status = 'approved'")).rows[0].id;
      await rejectsWith(store.approveSuggestion(id, carol, germanScope), "conflict", 409);
      await rejectsWith(store.approveSuggestion("99999", carol, germanScope), "not_found", 404);
      assert.equal(await version("bot"), 1);
    });

    it("lets a translator review only their own language and an admin any", async () => {
      const id = await store.submitSuggestion("bot", "a.count", "fr-FR", "Somme {0:N0} elements", alice);
      await rejectsWith(store.approveSuggestion(id, carol, germanScope), "forbidden", 403);
      await rejectsWith(store.declineSuggestion(id, carol, germanScope, ""), "forbidden", 403);
      await rejectsWith(store.approveSuggestion(id, bob, memberScope), "forbidden", 403);
      assert.equal((await pool.query("select status from dash_tr_suggestions where id = $1", [id])).rows[0].status, "open");
      await store.approveSuggestion(id, bob, adminScope);
      assert.equal((await pool.query("select status from dash_tr_suggestions where id = $1", [id])).rows[0].status, "approved");
      assert.equal(await version("bot"), 2);
    });

    it("does not bump the version when approving changes nothing", async () => {
      const first = await store.submitSuggestion("bot", "a.hello", "de-DE", "Servus {0}", alice);
      await store.approveSuggestion(first, carol, germanScope);
      assert.equal(await version("bot"), 3);
      sent.length = 0;
      await pool.query(
        "insert into dash_tr_suggestions (catalog, key, locale, text, source_text, user_id, user_name) values ('bot', 'a.hello', 'de-DE', 'Servus {0}', 'Hello {0}', $1, 'Bob')",
        [bob.id],
      );
      const id = (await pool.query<{ id: string }>("select id from dash_tr_suggestions where user_id = $1 and status = 'open' and key = 'a.hello'", [bob.id])).rows[0].id;
      await store.approveSuggestion(id, carol, germanScope);
      assert.equal(await version("bot"), 3);
      assert.deepEqual(sent, []);
      assert.equal((await pool.query("select status from dash_tr_suggestions where id = $1", [id])).rows[0].status, "approved");
    });

    it("checks the suggestion against the current source text when approving", async () => {
      const id = await store.submitSuggestion("bot", "a.count", "de-DE", "Summe {0:N0} Stuck", alice);
      const changed = botEntries().map((e) => (e.key === "a.count" ? entry(e.key, e.group, "Total {0} items", e.baselines) : e));
      await registerCatalog("bot", changed);
      const before = await version("bot");
      await rejectsWith(store.approveSuggestion(id, carol, germanScope), "placeholders_mismatch", 400);
      assert.equal(await version("bot"), before);
      assert.equal((await pool.query("select status from dash_tr_suggestions where id = $1", [id])).rows[0].status, "open");
      await store.declineSuggestion(id, carol, germanScope, "outdated");
      await registerCatalog("bot", botEntries());
    });

    it("keeps the old source text on an approved override when the source changed since it was written", async () => {
      const id = await store.submitSuggestion("bot", "a.bye", "de-DE", "Tschuss", alice);
      await registerCatalog("bot", botEntries().map((e) => (e.key === "a.bye" ? entry(e.key, e.group, "Goodbye", e.baselines) : e)));
      await store.approveSuggestion(id, carol, germanScope);
      const row = (await store.listStrings({ catalog: "bot", locale: "de-DE", group: "a", filter: "outdated", search: "", page: 1 }, null)).rows;
      assert.deepEqual(row.map((r) => [r.key, r.outdated, r.previousSource, r.source]), [["a.bye", true, "Bye", "Goodbye"]]);
      await registerCatalog("bot", botEntries());
      await pool.query("delete from dash_tr_overrides where key = 'a.bye'");
    });

    it("declines with a reason and changes nothing else", async () => {
      const before = await version("bot");
      sent.length = 0;
      const id = await store.submitSuggestion("bot", "p.k001", "de-DE", "Seite eins", alice);
      await store.declineSuggestion(id, carol, germanScope, "Not natural");
      const row = await pool.query("select status, open_mark, decline_reason, reviewed_by, reviewed_by_name from dash_tr_suggestions where id = $1", [id]);
      assert.deepEqual(row.rows[0], { status: "declined", open_mark: null, decline_reason: "Not natural", reviewed_by: carol.id, reviewed_by_name: "Carol" });
      assert.equal((await pool.query("select 1 from dash_tr_overrides where key = 'p.k001'")).rowCount, 0);
      assert.equal(await version("bot"), before);
      assert.deepEqual(sent, []);
      await rejectsWith(store.declineSuggestion(id, carol, germanScope, ""), "conflict", 409);
      await rejectsWith(store.declineSuggestion("99999", carol, germanScope, ""), "not_found", 404);
      await store.submitSuggestion("bot", "p.k001", "de-DE", "Seite 1", alice);
      const again = (await pool.query<{ id: string }>("select id from dash_tr_suggestions where user_id = $1 and key = 'p.k001' and status = 'open'", [alice.id])).rows[0].id;
      await store.declineSuggestion(again, carol, germanScope, "");
      assert.equal((await pool.query("select decline_reason from dash_tr_suggestions where id = $1", [again])).rows[0].decline_reason, "");
    });

    it("lets a member suggest again after a decline", async () => {
      await store.submitSuggestion("bot", "p.k001", "de-DE", "Seite Nummer eins", alice);
      assert.equal((await pool.query("select 1 from dash_tr_suggestions where user_id = $1 and key = 'p.k001' and status = 'open'", [alice.id])).rowCount, 1);
    });
  });

  describe("direct edit and revert", () => {
    before(resetState);

    it("saves straight away, stores an approved suggestion and replaces the translator's own open one", async () => {
      const open = await store.submitSuggestion("bot", "p.k002", "de-DE", "Seite zwei neu", carol);
      sent.length = 0;
      const result = await store.saveOverride("bot", "p.k002", "de-DE", "  Seite zwei neu und besser ", carol, germanScope);
      assert.deepEqual(result, { catalog: "bot", key: "p.k002", locale: "de-DE", text: "Seite zwei neu und besser" });

      const override = await pool.query("select text, source_text, updated_by_name from dash_tr_overrides where key = 'p.k002'");
      assert.deepEqual(override.rows[0], { text: "Seite zwei neu und besser", source_text: "Paged number 2", updated_by_name: "Carol" });
      const history = await pool.query<{ id: string; status: string; open_mark: number | null; reviewed_by: string }>(
        "select id, status, open_mark, reviewed_by from dash_tr_suggestions where key = 'p.k002' order by id",
      );
      assert.equal(history.rowCount, 2);
      assert.deepEqual({ id: history.rows[0].id, status: history.rows[0].status }, { id: open, status: "replaced" });
      assert.deepEqual({ status: history.rows[1].status, open_mark: history.rows[1].open_mark, reviewed_by: history.rows[1].reviewed_by }, { status: "approved", open_mark: null, reviewed_by: carol.id });
      assert.equal(await version("bot"), 1);
      assert.deepEqual(sent, [[reloadChannel, reloadMessage]]);
    });

    it("enforces the rules and the language scope", async () => {
      await rejectsWith(store.saveOverride("bot", "p.k002", "de-DE", "Seite zwei neu und besser", carol, germanScope), "translation_unchanged", 400);
      await rejectsWith(store.saveOverride("bot", "a.hello", "de-DE", "Hallo", carol, germanScope), "placeholders_mismatch", 400);
      await rejectsWith(store.saveOverride("bot", "a.hello", "de-DE", " ", carol, germanScope), "translation_empty", 400);
      await rejectsWith(store.saveOverride("bot", "a.hello", "fr-FR", "Salut {0}", carol, germanScope), "forbidden", 403);
      await rejectsWith(store.saveOverride("bot", "a.hello", "de-DE", "Servus {0}", alice, memberScope), "forbidden", 403);
      await rejectsWith(store.saveOverride("bot", "a.gone", "de-DE", "x", carol, germanScope), "not_found", 404);
      await rejectsWith(store.saveOverride("bot", "a.hello", "xx-XX", "x", carol, adminScope), "locale_invalid", 400);
      assert.equal(await version("bot"), 1);
      await store.saveOverride("bot", "a.hello", "fr-FR", "Salut {0}", bob, adminScope);
      assert.equal(await version("bot"), 2);
    });

    it("bumps the version for every change to an override", async () => {
      assert.equal(await version("bot"), 2);
      await store.saveOverride("bot", "p.k002", "de-DE", "Seite zwei, nochmals", carol, germanScope);
      assert.equal(await version("bot"), 3);
      await store.revertOverride("bot", "p.k002", "de-DE", carol, germanScope);
      assert.equal(await version("bot"), 4);
    });

    it("reverts to the built-in translation and keeps the history", async () => {
      await store.saveOverride("bot", "p.k004", "de-DE", "Seite vier neu", carol, germanScope);
      sent.length = 0;
      const before = await version("bot");
      const result = await store.revertOverride("bot", "p.k004", "de-DE", carol, germanScope);
      assert.deepEqual(result, { catalog: "bot", key: "p.k004", locale: "de-DE", text: "Seite 4" });
      assert.equal((await pool.query("select 1 from dash_tr_overrides where key = 'p.k004'")).rowCount, 0);
      assert.equal(await version("bot"), before + 1);
      assert.deepEqual(sent, [[reloadChannel, reloadMessage]]);
      assert.equal((await pool.query("select 1 from dash_tr_suggestions where key = 'p.k004' and status = 'approved'")).rowCount, 1);
      const row = (await store.listStrings({ catalog: "bot", locale: "de-DE", group: "p", filter: "all", search: "k004", page: 1 }, null)).rows[0];
      assert.equal(row.translation, "Seite 4");
      assert.equal(row.hasOverride, false);
    });

    it("reverts to nothing when there is no built-in translation", async () => {
      await store.saveOverride("bot", "a.only_en", "de-DE", "Nur Englisch", carol, germanScope);
      const result = await store.revertOverride("bot", "a.only_en", "de-DE", carol, adminScope);
      assert.equal(result.text, null);
      const row = (await store.listStrings({ catalog: "bot", locale: "de-DE", group: "a", filter: "all", search: "only english", page: 1 }, null)).rows[0];
      assert.equal(row.untranslated, true);
    });

    it("refuses to revert what has no override, or outside the language scope", async () => {
      const before = await version("bot");
      await rejectsWith(store.revertOverride("bot", "p.k006", "de-DE", carol, germanScope), "not_found", 404);
      await rejectsWith(store.revertOverride("bot", "a.hello", "fr-FR", carol, germanScope), "forbidden", 403);
      await rejectsWith(store.revertOverride("bot", "a.hello", "fr-FR", carol, memberScope), "forbidden", 403);
      assert.equal(await version("bot"), before);
    });

    it("tells nobody about changes to a catalog the bots do not read", async () => {
      sent.length = 0;
      await store.saveOverride("dash", "_common.cancel", "de-DE", "Abbruch", carol, germanScope);
      await store.revertOverride("dash", "_common.cancel", "de-DE", carol, germanScope);
      assert.deepEqual(sent, []);
    });

    it("carries on when the publisher fails", async () => {
      setReloadPublisher(async () => {
        throw new Error("redis is down");
      });
      try {
        const result = await store.saveOverride("bot", "p.k008", "de-DE", "Seite acht neu", carol, germanScope);
        assert.equal(result.text, "Seite acht neu");
        setReloadPublisher(async () => false);
        await store.revertOverride("bot", "p.k008", "de-DE", carol, germanScope);
      } finally {
        setReloadPublisher(async (channel, message) => {
          sent.push([channel, message]);
          return true;
        });
      }
    });
  });

  describe("outdated strings", () => {
    before(resetState);

    it("flags an override whose source text differs from the string's current source text", async () => {
      await store.saveOverride("bot", "a.bye", "de-DE", "Tschuss", carol, germanScope);
      await store.saveOverride("bot", "p.k010", "de-DE", "Seite zehn neu", carol, germanScope);
      const entries = botEntries().map((e) => (e.key === "a.bye" ? entry(e.key, e.group, "Goodbye", e.baselines) : e));
      await registerCatalog("bot", entries);

      const outdated = await store.listStrings({ catalog: "bot", locale: "de-DE", group: null, filter: "outdated", search: "", page: 1 }, null);
      assert.deepEqual(outdated.rows.map((r) => [r.key, r.source, r.previousSource, r.outdated, r.untranslated]), [["a.bye", "Goodbye", "Bye", true, false]]);
      assert.equal(outdated.total, 1);

      const overview = (await store.getOverview()).find((c) => c.catalog === "bot")!;
      assert.equal(overview.languages.find((l) => l.locale === "de-DE")?.outdated, 1);
      assert.equal(overview.languages.find((l) => l.locale === "fr-FR")?.outdated, 0);
    });

    it("clears the flag once the string is saved again", async () => {
      await store.saveOverride("bot", "a.bye", "de-DE", "Auf Wiedersehen", carol, germanScope);
      const outdated = await store.listStrings({ catalog: "bot", locale: "de-DE", group: null, filter: "outdated", search: "", page: 1 }, null);
      assert.equal(outdated.total, 0);
      await registerCatalog("bot", botEntries());
    });

    it("counts a translated and an untranslated string through the overview after overrides", async () => {
      await store.saveOverride("bot", "a.only_en", "de-DE", "Nur Englisch", carol, germanScope);
      const overview = (await store.getOverview()).find((c) => c.catalog === "bot")!;
      assert.equal(overview.languages.find((l) => l.locale === "de-DE")?.untranslated, 63 - 2);
    });
  });

  describe("history and queue", () => {
    before(resetState);

    it("shows approved history to everyone and the rest to the author and reviewers", async () => {
      const declined = await store.submitSuggestion("bot", "a.only_en", "de-DE", "Falsch", alice);
      await store.declineSuggestion(declined, carol, germanScope, "No");
      await store.submitSuggestion("bot", "a.only_en", "de-DE", "Vielleicht", alice);
      await store.saveOverride("bot", "a.only_en", "de-DE", "Nur Englisch", carol, germanScope);
      await store.submitSuggestion("bot", "a.only_en", "de-DE", "Noch ein Versuch", bob);

      const asAnon = await store.getHistory("bot", "a.only_en", "de-DE", null, memberScope);
      assert.deepEqual(asAnon.map((e) => e.status), ["approved", "reverted"]);
      assert.equal(asAnon[0].text, "Nur Englisch");
      const asAlice = await store.getHistory("bot", "a.only_en", "de-DE", alice.id, memberScope);
      assert.deepEqual(asAlice.map((e) => e.status), ["approved", "open", "declined", "reverted"]);
      const asBob = await store.getHistory("bot", "a.only_en", "de-DE", bob.id, memberScope);
      assert.deepEqual(asBob.map((e) => e.status), ["open", "approved", "reverted"]);
      const asReviewer = await store.getHistory("bot", "a.only_en", "de-DE", carol.id, germanScope);
      assert.deepEqual(asReviewer.map((e) => e.status), ["open", "approved", "open", "declined", "reverted"]);
      assert.equal(asReviewer[3].declineReason, "No");
      assert.equal(asReviewer[3].reviewedByName, "Carol");
      const asFrench = await store.getHistory("bot", "a.only_en", "de-DE", carol.id, frenchScope);
      assert.deepEqual(asFrench.map((e) => e.status), ["approved", "reverted"]);
      await rejectsWith(store.getHistory("bot", "a.gone", "de-DE", null, memberScope), "not_found", 404);
    });

    it("lists only the languages a reviewer may review, oldest first", async () => {
      await resetState();
      await store.submitSuggestion("bot", "p.k011", "de-DE", "Seite elf", alice);
      await store.submitSuggestion("bot", "a.count", "fr-FR", "Somme {0:N0} elements", bob);
      await store.submitSuggestion("bot", "a.hello", "de-DE", "Servus {0}", carol);
      await store.submitSuggestion("dash", "_common.save", "de-DE", "Sichern", alice);

      const german = await store.listQueue(germanScope, { catalog: null, locale: null }, 1);
      assert.deepEqual(german.rows.map((r) => [r.catalog, r.key, r.locale]), [
        ["bot", "p.k011", "de-DE"],
        ["bot", "a.hello", "de-DE"],
        ["dash", "_common.save", "de-DE"],
      ]);
      assert.equal(german.total, 3);
      assert.equal(german.rows[1].currentText, "Hallo {0}");
      assert.equal(german.rows[1].currentSource, "Hello {0}");
      assert.equal(german.rows[1].group, "a");

      const admins = await store.listQueue(adminScope, { catalog: null, locale: null }, 1);
      assert.equal(admins.total, 4);
      const french = await store.listQueue(frenchScope, { catalog: null, locale: null }, 1);
      assert.deepEqual(french.rows.map((r) => r.key), ["a.count"]);
      assert.equal((await store.listQueue(memberScope, { catalog: null, locale: null }, 1)).total, 0);

      const dashOnly = await store.listQueue(adminScope, { catalog: "dash", locale: null }, 1);
      assert.deepEqual(dashOnly.rows.map((r) => r.key), ["_common.save"]);
      const frOnly = await store.listQueue(adminScope, { catalog: null, locale: "fr-FR" }, 1);
      assert.deepEqual(frOnly.rows.map((r) => r.key), ["a.count"]);
      const none = await store.listQueue(germanScope, { catalog: null, locale: "fr-FR" }, 1);
      assert.equal(none.total, 0);
    });

    it("pages the queue and leaves out strings that no longer exist", async () => {
      await resetState();
      await pool.query(
        `insert into dash_tr_suggestions (catalog, key, locale, text, source_text, user_id, user_name)
         select 'bot', 'p.k' || lpad(n::text, 3, '0'), 'de-DE', 'z' || n, 's', $1, 'Many' from generate_series(1, 60) n`,
        [alice.id],
      );
      await pool.query("insert into dash_tr_suggestions (catalog, key, locale, text, source_text, user_id, user_name) values ('bot', 'gone.key', 'de-DE', 'x', 's', $1, 'Many')", [alice.id]);
      const one = await store.listQueue(adminScope, { catalog: null, locale: null }, 1);
      const two = await store.listQueue(adminScope, { catalog: null, locale: null }, 2);
      assert.equal(one.total, 60);
      assert.equal(one.rows.length, 50);
      assert.equal(two.rows.length, 10);
      assert.equal(one.rows[0].key, "p.k001");
      assert.ok(![...one.rows, ...two.rows].some((r) => r.key === "gone.key"));
      await resetState();
    });
  });

  describe("translators", () => {
    before(resetState);

    it("adds, lists and removes translators per language", async () => {
      await store.addTranslator(carol.id, "de-DE", "Carol", alice.id);
      await store.addTranslator(carol.id, "fr-FR", "Carol", alice.id);
      await store.addTranslator(bob.id, "de-DE", "Bob", alice.id);
      assert.deepEqual(await store.translatorLocales(carol.id), ["de-DE", "fr-FR"]);
      assert.deepEqual(await store.translatorLocales(alice.id), []);
      const list = await store.listTranslators();
      assert.deepEqual(list.map((t) => [t.userId, t.locale, t.displayName, t.addedBy]), [
        [bob.id, "de-DE", "Bob", alice.id],
        [carol.id, "de-DE", "Carol", alice.id],
        [carol.id, "fr-FR", "Carol", alice.id],
      ]);
      await store.addTranslator(bob.id, "de-DE", "Robert", alice.id);
      assert.equal((await store.listTranslators()).find((t) => t.userId === bob.id)?.displayName, "Robert");

      await store.removeTranslator(carol.id, "fr-FR");
      assert.deepEqual(await store.translatorLocales(carol.id), ["de-DE"]);
      await rejectsWith(store.removeTranslator(carol.id, "fr-FR"), "not_found", 404);
      await rejectsWith(store.removeTranslator(alice.id, "de-DE"), "not_found", 404);
    });

    it("only accepts languages the tool has", async () => {
      await rejectsWith(store.addTranslator(carol.id, "xx-XX", "Carol", alice.id), "locale_invalid", 400);
      await rejectsWith(store.addTranslator(carol.id, "en-US", "Carol", alice.id), "locale_invalid", 400);
      assert.ok((await store.allLocales()).includes("ja-JP"));
    });

    it("fills in a name the dashboard already knows", async () => {
      assert.equal(await store.knownTranslatorName(bob.id), "Robert");
      await store.submitSuggestion("bot", "a.only_en", "de-DE", "Nur Englisch", alice);
      assert.equal(await store.knownTranslatorName(alice.id), "Alice");
      assert.equal(await store.knownTranslatorName("123456789012345678"), null);
      await resetState();
    });
  });

  describe("dashboard overlay", () => {
    before(async () => {
      await resetState();
      await ensureDatabase();
      resetOverlay();
    });

    it("serves an approved dashboard translation from memory and drops it on revert", async () => {
      assert.equal(overlayFor("de-DE"), null);
      await store.saveOverride("dash", "_common.save", "de-DE", "Sichern", carol, germanScope);
      assert.equal(await version("dash"), 1);
      assert.equal(overlayFor("de-DE")?._common?.save, "Sichern");
      assert.equal(overlayFor("fr-FR"), null);

      await store.revertOverride("dash", "_common.save", "de-DE", carol, germanScope);
      assert.equal(await version("dash"), 2);
      assert.equal(overlayFor("de-DE"), null);
    });

    it("ignores an override that no longer fits the string's source text", async () => {
      await store.saveOverride("dash", "achievements.cards_tab_intro", "de-DE", "Standard ist <strong>{name}</strong>.", carol, germanScope);
      assert.equal(overlayFor("de-DE")?.achievements?.cards_tab_intro, "Standard ist <strong>{name}</strong>.");
      await pool.query("update dash_tr_strings set source_text = 'Now with {other} only' where catalog = 'dash' and key = 'achievements.cards_tab_intro'");
      await refreshOverlay();
      assert.equal(overlayFor("de-DE")?.achievements?.cards_tab_intro, undefined);
      await pool.query("delete from dash_tr_catalogs where catalog = 'dash'");
      await registerDashCatalog(bundled);
      await refreshOverlay();
      assert.equal(overlayFor("de-DE")?.achievements?.cards_tab_intro, "Standard ist <strong>{name}</strong>.");
      await store.revertOverride("dash", "achievements.cards_tab_intro", "de-DE", carol, adminScope);
    });

    it("enforces HTML tags for the dashboard catalog only", async () => {
      await rejectsWith(store.saveOverride("dash", "home.landing_forms_bullet_appeals", "de-DE", "Ohne Tags", carol, germanScope), "html_mismatch", 400);
      await rejectsWith(
        store.saveOverride("dash", "home.landing_forms_bullet_appeals", "de-DE", "<strong onclick=\"x()\">Mit</strong> Tags", carol, germanScope),
        "html_mismatch",
        400,
      );
      await rejectsWith(store.submitSuggestion("dash", "home.landing_forms_bullet_appeals", "de-DE", "Ohne Tags", alice), "html_mismatch", 400);
      await store.saveOverride("dash", "home.landing_forms_bullet_appeals", "de-DE", "Mit <strong>Tags</strong> versehen", carol, germanScope);
      await store.submitSuggestion("bot", "a.hello", "de-DE", "<b>Hallo</b> {0}", alice);
      await store.revertOverride("dash", "home.landing_forms_bullet_appeals", "de-DE", carol, germanScope);
    });
  });
});
