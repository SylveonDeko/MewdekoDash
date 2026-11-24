import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { groupByCategory, resolveEntries, type Catalog } from "../src/lib/wiki/catalog.ts";
import { externalImageUrl, parseUploadFile, sniffImage } from "../src/lib/wiki/images.ts";
import { isTooComplex, outputTooLarge } from "../src/lib/wiki/limits.ts";
import { searchEntries, searchTerms, toPlainText } from "../src/lib/wiki/search.ts";
import { dayKey, isCountable, normaliseMissQuery } from "../src/lib/wiki/tracking.ts";
import { validateArticle, validateCategory, validateSettings, validateVote } from "../src/lib/wiki/validation.ts";

const catalog: Catalog = {
  pages: [
    { id: "1", slug: "afk", icon: "fa-moon", category: "Actions", dashboardHref: null, module: "Afk", related: [], sortOrder: 0 },
    { id: "2", slug: "xp", icon: "fa-star", category: "Community", dashboardHref: null, module: null, related: [], sortOrder: 1 },
    { id: "3", slug: "tickets", icon: "fa-ticket", category: "Community", dashboardHref: null, module: null, related: [], sortOrder: 2 },
  ],
  versions: new Map([
    ["afk", new Map([["en-US", { title: "AFK System", summary: "Away status", markdown: "## Setup\n\nRun the **afk** command to leave a note.", tags: ["away"] }]])],
    ["xp", new Map([["en-US", { title: "XP", summary: "Levels", markdown: "Members earn points by chatting.", tags: [] }]])],
    ["tickets", new Map([["en-US", { title: "Tickets", summary: "Support", markdown: "Open a [ticket](/x) for help with the afk command.", tags: ["support"] }]])],
  ]),
  categories: [
    { name: "Community", icon: "fa-users", sortOrder: 0 },
    { name: "Actions", icon: "fa-bolt", sortOrder: 1 },
    { name: "Empty", icon: "fa-folder", sortOrder: 2 },
  ],
};

describe("categories in the public wiki", () => {
  const entries = resolveEntries(catalog, "en-US");
  const metas = entries.map((e) => ({
    slug: e.page.slug, title: e.version.title, summary: e.version.summary, icon: e.page.icon, category: e.page.category,
    tags: e.version.tags, related: [], readingMinutes: 1,
  }));

  it("orders groups by the category order and leaves out empty categories", () => {
    const groups = groupByCategory(metas, catalog.categories);
    assert.deepEqual(groups.map((g) => [g.name, g.icon, g.articles.map((a) => a.slug)]), [
      ["Community", "fa-users", ["xp", "tickets"]],
      ["Actions", "fa-bolt", ["afk"]],
    ]);
  });

  it("puts an article with an unlisted category into a group of its own after the listed ones", () => {
    const groups = groupByCategory([...metas, { ...metas[0], slug: "odd", category: "Odd" }], catalog.categories);
    assert.equal(groups[groups.length - 1].name, "Odd");
  });
});

describe("searching article text", () => {
  const entries = resolveEntries(catalog, "en-US");

  it("finds words in the body and shows a snippet around them", () => {
    const hits = searchEntries(entries, "leave a note");
    assert.deepEqual(hits.map((h) => h.slug), ["afk"]);
    assert.ok(hits[0].snippet.includes("leave a note"));
  });

  it("ranks title matches before body matches", () => {
    assert.deepEqual(searchEntries(entries, "afk").map((h) => h.slug), ["afk", "tickets"]);
  });

  it("needs every term and ignores queries that are too short", () => {
    assert.deepEqual(searchEntries(entries, "afk support").map((h) => h.slug), ["tickets"]);
    assert.deepEqual(searchTerms("a"), []);
    assert.deepEqual(searchEntries(entries, "x"), []);
  });

  it("flattens Markdown to plain words", () => {
    assert.equal(toPlainText("## Head\n\n**bold** [link](/x) `code`\n\n> [!TIP] Note\n\n- item"), "Head bold link code Note item");
  });
});

describe("view and miss tracking rules", () => {
  const none = () => null;

  it("does not count crawlers, previews or requests without a user agent", () => {
    assert.equal(isCountable("Mozilla/5.0 Firefox/130.0", none), true);
    assert.equal(isCountable("Googlebot/2.1", none), false);
    assert.equal(isCountable("Discordbot/2.0 link preview", none), false);
    assert.equal(isCountable("", none), false);
    assert.equal(isCountable(null, none), false);
    assert.equal(isCountable("Mozilla/5.0", (name) => (name === "sec-purpose" ? "prefetch" : null)), false);
  });

  it("keeps only searches that cannot identify someone", () => {
    assert.equal(normaliseMissQuery("  Anti   Raid "), "anti raid");
    assert.equal(normaliseMissQuery("a"), null);
    assert.equal(normaliseMissQuery("me@example.com"), null);
    assert.equal(normaliseMissQuery("https://example.com"), null);
    assert.equal(normaliseMissQuery("123456789012"), null);
    assert.equal(normaliseMissQuery("x".repeat(300))?.length, 100);
  });

  it("names the day in UTC", () => {
    assert.equal(dayKey(new Date("2026-03-04T23:59:59Z")), "2026-03-04");
  });
});

describe("markdown limits", () => {
  it("refuses text with too many headings, deep quotes, long lines or many images", () => {
    assert.equal(isTooComplex("# a\n".repeat(1001)), true);
    assert.equal(isTooComplex(`${">".repeat(13)} deep`), true);
    assert.equal(isTooComplex("x".repeat(20_001)), true);
    assert.equal(isTooComplex("![a](/b.png)\n".repeat(101)), true);
    assert.equal(isTooComplex("[".repeat(60_000)), true);
  });

  it("accepts ordinary text", () => {
    assert.equal(isTooComplex("# Title\n\nSome **text** with a [link](/x).\n\n> quote\n"), false);
    assert.equal(isTooComplex(""), false);
  });

  it("flags output far larger than the source", () => {
    assert.equal(outputTooLarge("a", "x".repeat(100_000)), true);
    assert.equal(outputTooLarge("a".repeat(1000), "x".repeat(2000)), false);
  });

  it("is passed by every built-in article", () => {
    const root = fileURLToPath(new URL("../src/lib/content/wiki", import.meta.url));
    for (const locale of readdirSync(root)) {
      for (const file of readdirSync(join(root, locale))) {
        assert.equal(isTooComplex(readFileSync(join(root, locale, file), "utf8")), false, `${locale}/${file}`);
      }
    }
  });

  it("is enforced when an article is saved", () => {
    const result = validateArticle({ title: "T", markdown: "# a\n".repeat(1001) });
    assert.deepEqual(result.ok ? null : result.error, "markdown_too_complex");
  });
});

describe("images", () => {
  it("names the type from the bytes", () => {
    assert.equal(sniffImage(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0])), "image/png");
    assert.equal(sniffImage(Uint8Array.from([0xff, 0xd8, 0xff, 0xe0])), "image/jpeg");
    assert.equal(sniffImage(Uint8Array.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])), "image/gif");
    assert.equal(sniffImage(Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50])), "image/webp");
    assert.equal(sniffImage(new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'></svg>")), null);
    assert.equal(sniffImage(new TextEncoder().encode("<html>")), null);
  });

  it("reads upload file names strictly", () => {
    const id = "123e4567-e89b-12d3-a456-426614174000";
    assert.deepEqual(parseUploadFile(`${id}.png`), { id, type: "image/png" });
    assert.equal(parseUploadFile(`${id}.svg`), null);
    assert.equal(parseUploadFile(`../${id}.png`), null);
    assert.equal(parseUploadFile("x.png"), null);
  });

  it("accepts only plain https addresses for outside images", () => {
    assert.equal(externalImageUrl("https://cdn.example.com/a.png"), "https://cdn.example.com/a.png");
    for (const bad of ["http://a.example/x.png", "https://user:pw@a.example/x.png", "https://a.example:8443/x.png", "https://localhost/x.png", "https://db.internal/x.png", "//a.example/x.png", "javascript:alert(1)", "https://a.example/" + "x".repeat(2000)]) {
      assert.equal(externalImageUrl(bad), null, bad);
    }
  });
});

describe("category, vote and settings input", () => {
  it("checks a category", () => {
    assert.deepEqual(validateCategory({ name: "  Music  ", icon: "fa-music" }), { ok: true, value: { name: "Music", icon: "fa-music" } });
    assert.equal(validateCategory({ name: "", icon: "fa-music" }).ok, false);
    assert.equal(validateCategory({ name: "x".repeat(41), icon: "fa-music" }).ok, false);
    assert.equal(validateCategory({ name: "Music", icon: "fa-solid fa-music" }).ok, false);
  });

  it("checks a vote and the browser key", () => {
    assert.deepEqual(validateVote({ helpful: true }), { ok: true, value: { helpful: true, browserKey: null } });
    assert.equal(validateVote({ helpful: "yes" }).ok, false);
    assert.equal(validateVote({ helpful: false, browserKey: "short" }).ok, false);
    assert.equal(validateVote({ helpful: false, browserKey: "a".repeat(32) }).ok, true);
    assert.equal(validateVote({ helpful: false, browserKey: "a b".repeat(12) }).ok, false);
  });

  it("checks settings", () => {
    assert.deepEqual(validateSettings({ suggestionsOpen: false }), { ok: true, value: { suggestionsOpen: false } });
    assert.deepEqual(validateSettings({}), { ok: true, value: {} });
    assert.equal(validateSettings({ suggestionsOpen: "no" }).ok, false);
  });
});
