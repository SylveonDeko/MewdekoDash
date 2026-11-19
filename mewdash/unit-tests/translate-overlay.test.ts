import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickTemplate, pluralVariant, resolveTemplate } from "../src/lib/i18n/lookup.ts";
import { buildOverlays, splitDashKey } from "../src/lib/translate/overlay.ts";

describe("overlay lookup", () => {
  const builtin = { save: "Speichern", cancel: "Abbrechen" };
  const overlay = { save: "Sichern" };

  it("prefers the overlay, then the built-in text, then English", () => {
    assert.equal(pickTemplate("de-DE", builtin, overlay, "save", "Save"), "Sichern");
    assert.equal(pickTemplate("de-DE", builtin, overlay, "cancel", "Cancel"), "Abbrechen");
    assert.equal(pickTemplate("de-DE", builtin, overlay, "close", "Close"), "Close");
    assert.equal(pickTemplate("de-DE", undefined, undefined, "save", "Save"), "Save");
    assert.equal(pickTemplate("de-DE", undefined, overlay, "save", "Save"), "Sichern");
  });

  it("ignores inherited properties", () => {
    assert.equal(pickTemplate("de-DE", builtin, {}, "constructor", "Fallback"), "Fallback");
    assert.equal(pickTemplate("de-DE", builtin, {}, "toString", "Fallback"), "Fallback");
  });

  it("picks plural forms from the overlay by the language's rules", () => {
    const pl = { item_one: "1 rzecz", item_few: "{count} rzeczy", item_many: "{count} rzeczy", item_other: "{count} rzeczy" };
    assert.equal(pluralVariant(pl, "pl-PL", "item_other", { count: 3 }), "{count} rzeczy");
    assert.equal(pickTemplate("de-DE", undefined, { item_one: "{count} Sache", item_other: "{count} Sachen" }, "item_other", "x", { count: 1 }), "{count} Sache");
    assert.equal(pickTemplate("de-DE", undefined, { item_other: "{count} Sachen" }, "item_other", "x", { count: 4 }), "{count} Sachen");
  });

  it("lets an overlay entry win over a built-in plural form", () => {
    const text = pickTemplate("de-DE", { item_one: "alt", item_other: "alt" }, { item_other: "neu" }, "item_other", "x", { count: 2 });
    assert.equal(text, "neu");
  });

  it("falls back to the English text when reading the entries throws", () => {
    const text = resolveTemplate(
      () => {
        throw new Error("overlay is broken");
      },
      "save",
      "Save",
    );
    assert.equal(text, "Save");
  });

  it("falls back when choosing throws", () => {
    const hostile = new Proxy({}, { get: () => { throw new Error("no"); } }) as Record<string, string>;
    assert.equal(resolveTemplate(() => ({ locale: "de-DE", overlay: hostile }), "save", "Save"), "Save");
  });

  it("reads through when nothing fails", () => {
    assert.equal(resolveTemplate(() => ({ locale: "de-DE", builtin, overlay }), "save", "Save"), "Sichern");
  });
});

describe("building overlays", () => {
  it("splits keys at the first dot", () => {
    assert.deepEqual(splitDashKey("music.queue_empty"), { module: "music", key: "queue_empty" });
    assert.deepEqual(splitDashKey("_common.save"), { module: "_common", key: "save" });
    assert.equal(splitDashKey("nodot"), null);
    assert.equal(splitDashKey(".key"), null);
    assert.equal(splitDashKey("module."), null);
  });

  it("groups overrides by language and module", () => {
    const overlays = buildOverlays([
      { key: "music.play", locale: "de-DE", text: "Abspielen", sourceText: "Play" },
      { key: "music.stop", locale: "de-DE", text: "Stopp", sourceText: "Stop" },
      { key: "_common.save", locale: "de-DE", text: "Sichern", sourceText: "Save" },
      { key: "music.play", locale: "fr-FR", text: "Lire", sourceText: "Play" },
    ]);
    assert.deepEqual([...overlays.keys()].sort(), ["de-DE", "fr-FR"]);
    assert.equal(overlays.get("de-DE")?.music.play, "Abspielen");
    assert.equal(overlays.get("de-DE")?.music.stop, "Stopp");
    assert.equal(overlays.get("de-DE")?._common.save, "Sichern");
    assert.equal(overlays.get("fr-FR")?.music.play, "Lire");
  });

  it("leaves out overrides that no longer fit the current source text", () => {
    const overlays = buildOverlays([
      { key: "a.greet", locale: "de-DE", text: "Hallo {name}", sourceText: "Hello {user}" },
      { key: "a.bold", locale: "de-DE", text: "Fett", sourceText: "<b>Bold</b>" },
      { key: "a.fine", locale: "de-DE", text: "Gut {name}", sourceText: "Good {name}" },
      { key: "broken", locale: "de-DE", text: "x", sourceText: "x" },
    ]);
    const de = overlays.get("de-DE");
    assert.equal(de?.a.greet, undefined);
    assert.equal(de?.a.bold, undefined);
    assert.equal(de?.a.fine, "Gut {name}");
  });

  it("produces nothing for no rows", () => {
    assert.equal(buildOverlays([]).size, 0);
  });
});
