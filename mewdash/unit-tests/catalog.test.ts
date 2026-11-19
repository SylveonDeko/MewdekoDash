import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { catalogFromSeed, entryToMeta, pickCatalogSource, readingMinutes, resolveEntries } from "../src/lib/wiki/catalog.ts";
import type { SeedEntry } from "../src/lib/wiki/frontmatter.ts";
import { findByDashboardPath, searchWikiIndex, wikiIconClass } from "../src/lib/wiki/index.ts";

function seed(overrides: Partial<SeedEntry> & { slug: string; locale: string; title: string }): SeedEntry {
  return {
    summary: "",
    icon: "fa-book",
    category: "General",
    dashboardHref: null,
    module: null,
    tags: [],
    related: [],
    markdown: "body",
    ...overrides,
  };
}

describe("where the wiki is read from", () => {
  it("uses the database only when it is configured, ready and the last read worked", () => {
    assert.equal(pickCatalogSource({ configured: true, ready: true, readFailed: false }), "database");
  });

  it("falls back to the built-in files in every other case", () => {
    assert.equal(pickCatalogSource({ configured: false, ready: false, readFailed: false }), "builtin");
    assert.equal(pickCatalogSource({ configured: true, ready: false, readFailed: false }), "builtin");
    assert.equal(pickCatalogSource({ configured: true, ready: true, readFailed: true }), "builtin");
    assert.equal(pickCatalogSource({ configured: false, ready: true, readFailed: false }), "builtin");
  });
});

describe("built-in catalog", () => {
  const entries = [
    seed({ slug: "xp", locale: "en-US", title: "XP", category: "Community", dashboardHref: "/dashboard/xp", related: ["afk"] }),
    seed({ slug: "afk", locale: "en-US", title: "AFK System", category: "Actions" }),
    seed({ slug: "afk", locale: "de-DE", title: "AFK Modus", category: "Aktionen", markdown: "Text" }),
    seed({ slug: "gone", locale: "de-DE", title: "Verwaist" }),
  ];
  const { catalog, skipped } = catalogFromSeed(entries);

  it("orders pages alphabetically by title", () => {
    assert.deepEqual(catalog.pages.map((p) => p.slug), ["afk", "xp"]);
    assert.deepEqual(catalog.pages.map((p) => p.sortOrder), [0, 1]);
  });

  it("takes page details from the source language file only", () => {
    assert.equal(catalog.pages[0].category, "Actions");
  });

  it("skips translations that have no source language page", () => {
    assert.deepEqual(skipped.map((e) => e.slug), ["gone"]);
  });

  it("serves a translation where one exists and the source text elsewhere", () => {
    const german = resolveEntries(catalog, "de-DE");
    assert.deepEqual(german.map((e) => [e.page.slug, e.version.title, e.locale]), [
      ["afk", "AFK Modus", "de-DE"],
      ["xp", "XP", "en-US"],
    ]);
  });

  it("serves the source language for a locale with no translations", () => {
    assert.deepEqual(resolveEntries(catalog, "ja-JP").map((e) => e.version.title), ["AFK System", "XP"]);
  });

  it("builds metadata with the reading time", () => {
    const meta = entryToMeta(resolveEntries(catalog, "en-US")[1]);
    assert.equal(meta.dashboardHref, "/dashboard/xp");
    assert.deepEqual(meta.related, ["afk"]);
    assert.equal(meta.readingMinutes, 1);
    assert.equal(readingMinutes(Array.from({ length: 1000 }, () => "word").join(" ")), 5);
  });
});

describe("lookup helpers", () => {
  it("finds the article for a dashboard path or its parents", () => {
    const byHref = new Map([["/dashboard/afk", "afk"]]);
    assert.equal(findByDashboardPath(byHref, "/dashboard/afk"), "afk");
    assert.equal(findByDashboardPath(byHref, "/dashboard/afk/anything/deep"), "afk");
    assert.equal(findByDashboardPath(byHref, "/dashboard/xp"), undefined);
    assert.equal(findByDashboardPath(byHref, "/dashboard"), undefined);
  });

  it("searches title, summary, category, module and tags with every term", () => {
    const index = [
      { slug: "a", title: "AFK System", summary: "Away messages", icon: "", category: "Actions", tags: ["brb"], related: [], readingMinutes: 1 },
      { slug: "b", title: "XP", summary: "Levels", icon: "", category: "Community", module: "Xp", tags: [], related: [], readingMinutes: 1 },
    ];
    assert.deepEqual(searchWikiIndex(index, "away brb").map((a) => a.slug), ["a"]);
    assert.deepEqual(searchWikiIndex(index, "xp community").map((a) => a.slug), ["b"]);
    assert.equal(searchWikiIndex(index, "").length, 2);
    assert.equal(searchWikiIndex(index, "nothing").length, 0);
  });

  it("keeps brand icons as written", () => {
    assert.equal(wikiIconClass("fa-moon"), "fa-utility-duo fa-regular fa-moon");
    assert.equal(wikiIconClass("fa-brands fa-twitch"), "fa-brands fa-twitch");
  });
});
