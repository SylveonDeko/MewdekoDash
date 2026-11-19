import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cleanTranslation,
  escapeLike,
  htmlProblem,
  htmlTagsOf,
  isHtmlCatalog,
  placeholderDiff,
  placeholdersMatch,
  placeholdersOf,
  structureProblem,
  translationLimits,
  translationProblem,
} from "../src/lib/translate/rules.ts";

describe("placeholders", () => {
  it("finds every brace token without whitespace", () => {
    assert.deepEqual(placeholdersOf("{0} gave {1:N0} to {user}"), ["{0}", "{1:N0}", "{user}"]);
    assert.deepEqual(placeholdersOf("no tokens here"), []);
    assert.deepEqual(placeholdersOf("{ spaced } and {ok}"), ["{ok}"]);
    assert.deepEqual(placeholdersOf("{}"), []);
  });

  it("counts a repeated token twice", () => {
    assert.deepEqual(placeholdersOf("{0} and {0}"), ["{0}", "{0}"]);
    assert.equal(placeholdersMatch("{0} and {0}", "{0}"), false);
    assert.equal(placeholdersMatch("{0} and {0}", "{0} und {0}"), true);
  });

  it("compares exact strings, so a format suffix matters", () => {
    assert.equal(placeholdersMatch("{1:N0}", "{1}"), false);
    assert.equal(placeholdersMatch("{user}", "{User}"), false);
    assert.equal(placeholdersMatch("{a} {b}", "{b} {a}"), true);
  });

  it("reports what is missing and what is extra", () => {
    assert.deepEqual(placeholderDiff("{a} {b}", "{a} {c}"), { missing: ["{b}"], extra: ["{c}"] });
    assert.deepEqual(placeholderDiff("{a}", "{a}"), { missing: [], extra: [] });
  });
});

describe("html tags", () => {
  it("lists tags regardless of case and spacing", () => {
    assert.deepEqual(htmlTagsOf("<B>x</B>"), ["</b>", "<b>"]);
    assert.deepEqual(htmlTagsOf('<a   href="/wiki"  >x</a>'), ['</a>', '<a href="/wiki">']);
    assert.deepEqual(htmlTagsOf("a < b and c > d"), []);
    assert.deepEqual(htmlTagsOf("<@123> and <br/>"), ["<br/>"]);
  });

  it("requires the same tags as the source", () => {
    assert.equal(htmlProblem("Open <b>settings</b>", "Einstellungen <b>offnen</b>"), null);
    assert.equal(htmlProblem("Open <b>settings</b>", "Einstellungen offnen"), "html_mismatch");
    assert.equal(htmlProblem("Open <b>settings</b>", "Einstellungen <i>offnen</i>"), "html_mismatch");
    assert.equal(htmlProblem("Open <b>settings</b>", "<b>a</b> <b>b</b>"), "html_mismatch");
    assert.equal(htmlProblem('<a href="/x">go</a>', '<a href="https://example.com">go</a>'), "html_mismatch");
    assert.equal(htmlProblem("plain", "plain text"), null);
  });

  it("rejects event attributes and script urls", () => {
    assert.equal(htmlProblem("<b>x</b>", '<b onclick="x()">x</b>'), "html_mismatch");
    assert.equal(htmlProblem("<b>x</b>", "<b/onmouseover=x>x</b>"), "html_mismatch");
    assert.equal(htmlProblem("<b>x</b>", "<b>javascript:alert(1)</b>"), "html_mismatch");
    assert.equal(htmlProblem("<b>x</b>", "<b>java script :alert(1)</b>"), "html_mismatch");
    assert.equal(htmlProblem("plain", "we often = think"), null);
  });

  it("applies only to the dashboard catalog", () => {
    assert.equal(isHtmlCatalog("dash"), true);
    assert.equal(isHtmlCatalog("bot"), false);
    assert.equal(structureProblem("bot", "Open <b>x</b>", "Open x"), null);
    assert.equal(structureProblem("dash", "Open <b>x</b>", "Open x"), "html_mismatch");
    assert.equal(structureProblem("bot", "{a}", "{b}"), "placeholders_mismatch");
    assert.equal(structureProblem("dash", "{a}", "{b}"), "placeholders_mismatch");
  });
});

describe("translation limits and cleaning", () => {
  it("normalises line endings, drops null characters and trims", () => {
    assert.equal(cleanTranslation("  a\r\nb\rc\u0000  "), "a\nb\nc");
    assert.equal(cleanTranslation(5), null);
    assert.equal(cleanTranslation(undefined), null);
  });

  it("rejects empty text", () => {
    assert.equal(translationProblem("bot", "x", "", null), "translation_empty");
    assert.equal(translationProblem("bot", "x", cleanTranslation("   ") ?? "", null), "translation_empty");
  });

  it("allows exactly 4000 characters and rejects one more", () => {
    assert.equal(translationLimits.textMax, 4000);
    assert.equal(translationProblem("bot", "x", "a".repeat(4000), null), null);
    assert.equal(translationProblem("bot", "x", "a".repeat(4001), null), "translation_too_long");
  });

  it("counts characters, not UTF-16 units", () => {
    assert.equal(translationProblem("bot", "x", "\u{1F600}".repeat(4000), null), null);
    assert.equal(translationProblem("bot", "x", "\u{1F600}".repeat(4001), null), "translation_too_long");
  });

  it("rejects text equal to the current translation", () => {
    assert.equal(translationProblem("bot", "x", "hallo", "hallo"), "translation_unchanged");
    assert.equal(translationProblem("bot", "x", "hallo", "hallo\n"), "translation_unchanged");
    assert.equal(translationProblem("bot", "x", "hallo", "hi"), null);
    assert.equal(translationProblem("bot", "x", "hallo", null), null);
  });

  it("checks placeholders after the basic limits", () => {
    assert.equal(translationProblem("bot", "{0} won", "{1} gewann", null), "placeholders_mismatch");
    assert.equal(translationProblem("bot", "{0} won", "{0} gewann", null), null);
  });

  it("allows 200 open suggestions per member and pages of 50", () => {
    assert.equal(translationLimits.openSuggestionsMax, 200);
    assert.equal(translationLimits.pageSize, 50);
  });

  it("escapes like wildcards", () => {
    assert.equal(escapeLike("50%_off\\"), "50\\%\\_off\\\\");
    assert.equal(escapeLike("plain"), "plain");
  });
});
