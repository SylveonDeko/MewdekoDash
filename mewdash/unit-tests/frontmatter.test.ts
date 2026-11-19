import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { catalogFromSeed } from "../src/lib/wiki/catalog.ts";
import { localeOfPath, mapFrontmatter, parseFrontmatter, parseList } from "../src/lib/wiki/frontmatter.ts";
import { normalizeTags, slugProblem, validatePageFields, wikiLimits } from "../src/lib/wiki/validation.ts";

describe("frontmatter parsing", () => {
  it("parses lists in brackets", () => {
    assert.deepEqual(parseList("[afk, away, 'mention reply']"), ["afk", "away", "mention reply"]);
    assert.deepEqual(parseList(undefined), []);
    assert.deepEqual(parseList("[]"), []);
  });

  it("splits frontmatter from the body", () => {
    const { fields, body } = parseFrontmatter("---\ntitle: \"Hello: world\"\nslug: hi\n---\n\n## Body\n");
    assert.equal(fields.title, "Hello: world");
    assert.equal(fields.slug, "hi");
    assert.equal(body, "\n## Body\n");
  });

  it("treats a file without frontmatter as all body", () => {
    assert.deepEqual(parseFrontmatter("just text"), { fields: {}, body: "just text" });
  });

  it("reads the locale from the folder", () => {
    assert.equal(localeOfPath("/src/lib/content/wiki/de-DE/afk.md"), "de-DE");
  });
});

describe("import mapping", () => {
  const raw = [
    "---",
    "title: AFK System",
    "slug: afk",
    "summary: Away messages",
    "icon: fa-moon",
    "category: Actions",
    "dashboard: /dashboard/afk",
    "module: Afk",
    "tags: [afk, away]",
    "related: [utility, administration]",
    "---",
    "",
    "## What it does",
  ].join("\n");

  it("maps every field", () => {
    assert.deepEqual(mapFrontmatter("/src/lib/content/wiki/en-US/afk.md", raw), {
      locale: "en-US",
      slug: "afk",
      title: "AFK System",
      summary: "Away messages",
      icon: "fa-moon",
      category: "Actions",
      dashboardHref: "/dashboard/afk",
      module: "Afk",
      tags: ["afk", "away"],
      related: ["utility", "administration"],
      markdown: "\n## What it does",
    });
  });

  it("applies the loader's defaults", () => {
    assert.deepEqual(mapFrontmatter("/src/lib/content/wiki/en-US/plain.md", "text"), {
      locale: "en-US",
      slug: "plain",
      title: "plain",
      summary: "",
      icon: "fa-book",
      category: "General",
      dashboardHref: null,
      module: null,
      tags: [],
      related: [],
      markdown: "text",
    });
  });
});

describe("the built-in articles", () => {
  const root = fileURLToPath(new URL("../src/lib/content/wiki", import.meta.url));
  const entries = readdirSync(root).flatMap((locale) =>
    readdirSync(join(root, locale))
      .filter((file) => file.endsWith(".md"))
      .map((file) => mapFrontmatter(`/src/lib/content/wiki/${locale}/${file}`, readFileSync(join(root, locale, file), "utf8")))
  );

  it("loads every locale", () => {
    assert.equal(entries.filter((e) => e.locale === "en-US").length, 76);
    assert.ok(entries.length > 700);
  });

  it("gives every source article a valid slug and valid page fields", () => {
    for (const entry of entries.filter((e) => e.locale === "en-US")) {
      assert.equal(slugProblem(entry.slug), null, entry.slug);
      const fields = validatePageFields(
        { slug: entry.slug, icon: entry.icon, category: entry.category, dashboardHref: entry.dashboardHref ?? "", module: entry.module ?? "", related: entry.related },
        false
      );
      assert.equal(fields.ok, true, `${entry.slug}: ${JSON.stringify(fields)}`);
    }
  });

  it("lets imported tag lists that are over the limits be saved unchanged but not extended", () => {
    const over = entries.filter((e) => !normalizeTags(e.tags).ok);
    assert.ok(over.length > 0);
    for (const entry of over) {
      assert.equal(normalizeTags(entry.tags, entry.tags).ok, true, `${entry.locale}/${entry.slug}`);
      assert.equal(normalizeTags([...entry.tags, "one more tag"], entry.tags).ok, false, `${entry.locale}/${entry.slug}`);
    }
  });

  it("keeps titles, summaries and bodies within the editor's limits", () => {
    for (const entry of entries) {
      assert.ok([...entry.title].length <= wikiLimits.titleMax, `${entry.locale}/${entry.slug} title`);
      assert.ok([...entry.summary].length <= wikiLimits.summaryMax, `${entry.locale}/${entry.slug} summary`);
      assert.ok(entry.markdown.length <= wikiLimits.markdownMax, `${entry.locale}/${entry.slug} body`);
    }
  });

  it("imports every translation of a source article", () => {
    const { catalog, skipped } = catalogFromSeed(entries);
    assert.deepEqual(skipped, []);
    assert.equal(catalog.pages.length, 76);
    for (const page of catalog.pages) assert.ok(catalog.versions.get(page.slug)?.get("en-US"), page.slug);
  });
});
