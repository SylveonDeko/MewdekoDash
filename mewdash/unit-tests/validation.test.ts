import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  localeProblem,
  normalizeTags,
  slugFromTitle,
  slugProblem,
  validateArticle,
  validateFeedback,
  validatePageFields,
  wikiLimits,
} from "../src/lib/wiki/validation.ts";

describe("slug rules", () => {
  it("accepts lowercase words joined by single hyphens", () => {
    for (const slug of ["afk", "chat-triggers", "role-menus", "top-10", "a1"]) {
      assert.equal(slugProblem(slug), null, slug);
    }
  });

  it("rejects everything else", () => {
    for (const slug of ["", "Afk", "-afk", "afk-", "a--b", "a b", "a_b", "a/b", "a.b", "é", "x".repeat(65)]) {
      assert.equal(slugProblem(slug), "slug_invalid", JSON.stringify(slug));
    }
    assert.equal(slugProblem(undefined), "slug_invalid");
    assert.equal(slugProblem(7), "slug_invalid");
  });

  it("reserves the names of fixed routes", () => {
    assert.equal(slugProblem("manage"), "slug_reserved");
    assert.equal(slugProblem("sitemap"), "slug_reserved");
  });

  it("allows an article that is named like the member suggestions feature", () => {
    assert.equal(slugProblem("suggestions"), null);
  });

  it("builds a slug from a title", () => {
    assert.equal(slugFromTitle("Chat Triggers"), "chat-triggers");
    assert.equal(slugFromTitle("  Café  &  Bar!! "), "cafe-bar");
    assert.equal(slugFromTitle("!!!"), "");
    assert.equal(slugProblem(slugFromTitle("A".repeat(200))), null);
  });
});

describe("tag rules", () => {
  it("trims, lowercases, collapses spaces and drops repeats", () => {
    const result = normalizeTags(["  Welcome  Message ", "welcome message", "AFK", "", "   "]);
    assert.deepEqual(result, { ok: true, value: ["welcome message", "afk"] });
  });

  it("accepts exactly 12 tags and rejects 13", () => {
    const twelve = Array.from({ length: 12 }, (_, i) => `tag${i}`);
    assert.equal(normalizeTags(twelve).ok, true);
    const thirteen = [...twelve, "tag12"];
    assert.deepEqual(normalizeTags(thirteen), { ok: false, error: "tags_too_many", field: "tags" });
  });

  it("counts repeats once toward the limit", () => {
    const tags = Array.from({ length: 12 }, (_, i) => `tag${i}`);
    assert.equal(normalizeTags([...tags, "TAG0"]).ok, true);
  });

  it("accepts a 40 character tag and rejects 41", () => {
    assert.equal(normalizeTags(["a".repeat(wikiLimits.tagMax)]).ok, true);
    assert.deepEqual(normalizeTags(["a".repeat(wikiLimits.tagMax + 1)]), { ok: false, error: "tag_too_long", field: "tags" });
  });

  it("rejects values that are not text", () => {
    assert.equal(normalizeTags("afk").ok, false);
    assert.equal(normalizeTags([1]).ok, false);
    assert.deepEqual(normalizeTags(undefined), { ok: true, value: [] });
  });
});

describe("article validation", () => {
  it("cleans a valid article", () => {
    const result = validateArticle({ title: "  My  title ", summary: " Short ", markdown: "a\r\nb", tags: ["X"], note: " fix " });
    assert.deepEqual(result, { ok: true, value: { title: "My title", summary: "Short", markdown: "a\nb", tags: ["x"], note: "fix" } });
  });

  it("requires a title", () => {
    assert.deepEqual(validateArticle({ title: "   " }), { ok: false, error: "title_required", field: "title" });
    assert.equal(validateArticle({}).ok, false);
    assert.equal(validateArticle(null).ok, false);
  });

  it("enforces lengths", () => {
    assert.equal(validateArticle({ title: "x".repeat(121) }).ok, false);
    assert.equal(validateArticle({ title: "x".repeat(120) }).ok, true);
    assert.deepEqual(validateArticle({ title: "t", summary: "x".repeat(401) }), { ok: false, error: "summary_too_long", field: "summary" });
    assert.deepEqual(validateArticle({ title: "t", markdown: "x".repeat(100_001) }), { ok: false, error: "markdown_too_long", field: "markdown" });
    assert.deepEqual(validateArticle({ title: "t", note: "x".repeat(301) }), { ok: false, error: "note_too_long", field: "note" });
  });

  it("reports tag problems", () => {
    const result = validateArticle({ title: "t", tags: Array.from({ length: 13 }, (_, i) => `t${i}`) });
    assert.deepEqual(result, { ok: false, error: "tags_too_many", field: "tags" });
  });
});

describe("page field validation", () => {
  const valid = { slug: "afk", icon: "fa-moon", category: "Actions" };

  it("accepts required fields and fills nothing else", () => {
    assert.deepEqual(validatePageFields(valid, false), { ok: true, value: valid });
  });

  it("requires slug, icon and category unless partial", () => {
    assert.equal(validatePageFields({ slug: "afk" }, false).ok, false);
    assert.deepEqual(validatePageFields({ published: true }, true), { ok: true, value: { published: true } });
  });

  it("accepts brand icons and rejects odd ones", () => {
    assert.equal(validatePageFields({ ...valid, icon: "fa-brands fa-twitch" }, false).ok, true);
    assert.equal(validatePageFields({ ...valid, icon: "moon" }, false).ok, false);
    assert.equal(validatePageFields({ ...valid, icon: "fa-moon\" onclick=\"x" }, false).ok, false);
  });

  it("validates dashboard paths, modules and related slugs", () => {
    assert.equal(validatePageFields({ ...valid, dashboardHref: "/dashboard/afk" }, false).ok, true);
    assert.equal(validatePageFields({ ...valid, dashboardHref: "dashboard/afk" }, false).ok, false);
    assert.equal(validatePageFields({ ...valid, dashboardHref: "/dashboard/roles?tab=states" }, false).ok, true);
    assert.equal(validatePageFields({ ...valid, dashboardHref: "/dashboard/afk?x=1&y=2" }, false).ok, false);
    assert.equal(validatePageFields({ ...valid, dashboardHref: "/dashboard/afk#top" }, false).ok, false);
    assert.deepEqual(validatePageFields({ ...valid, dashboardHref: "" }, false), { ok: true, value: { ...valid, dashboardHref: null } });
    assert.equal(validatePageFields({ ...valid, module: "Custom Voice" }, false).ok, true);
    assert.equal(validatePageFields({ ...valid, module: "<b>" }, false).ok, false);
    assert.equal(validatePageFields({ ...valid, related: ["xp", "utility", "xp"] }, false).ok, true);
    assert.equal(validatePageFields({ ...valid, related: ["Bad Slug"] }, false).ok, false);
    assert.equal(validatePageFields({ ...valid, related: Array.from({ length: 13 }, (_, i) => `p${i}`) }, false).ok, false);
  });
});

describe("feedback validation", () => {
  it("drops reason and note for a yes", () => {
    assert.deepEqual(validateFeedback({ helpful: true, reason: "unclear", note: "x" }), { ok: true, value: { helpful: true, reason: "", note: "" } });
  });

  it("keeps a known reason and a note for a no", () => {
    assert.deepEqual(validateFeedback({ helpful: false, reason: "outdated", note: " old " }), {
      ok: true,
      value: { helpful: false, reason: "outdated", note: "old" },
    });
  });

  it("rejects unknown reasons and a missing answer", () => {
    assert.equal(validateFeedback({ helpful: false, reason: "rude" }).ok, false);
    assert.equal(validateFeedback({}).ok, false);
  });
});

describe("locale rule", () => {
  it("only accepts locales the dashboard has", () => {
    assert.equal(localeProblem("de-DE", ["en-US", "de-DE"]), null);
    assert.equal(localeProblem("xx-XX", ["en-US", "de-DE"]), "locale_invalid");
    assert.equal(localeProblem("de", ["en-US", "de-DE"]), "locale_invalid");
  });
});
