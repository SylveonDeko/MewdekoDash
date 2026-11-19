import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { catalogHash, type CatalogEntry } from "../src/lib/server/translations/hash.ts";

const entry = (key: string, source: string, baselines: Record<string, string> = {}): CatalogEntry => ({ key, group: "g", source, baselines });

describe("catalog hash", () => {
  it("is a sha256 in hex", () => {
    assert.match(catalogHash([entry("a.b", "x")]), /^[0-9a-f]{64}$/);
  });

  it("does not depend on the order of keys or languages", () => {
    const one = [entry("a.one", "1", { "de-DE": "eins", "fr-FR": "un" }), entry("b.two", "2")];
    const two = [entry("b.two", "2"), entry("a.one", "1", { "fr-FR": "un", "de-DE": "eins" })];
    assert.equal(catalogHash(one), catalogHash(two));
  });

  it("changes with a key, a source text or a built-in translation", () => {
    const base = catalogHash([entry("a.one", "1", { "de-DE": "eins" })]);
    assert.notEqual(base, catalogHash([entry("a.uno", "1", { "de-DE": "eins" })]));
    assert.notEqual(base, catalogHash([entry("a.one", "1!", { "de-DE": "eins" })]));
    assert.notEqual(base, catalogHash([entry("a.one", "1", { "de-DE": "eins!" })]));
    assert.notEqual(base, catalogHash([entry("a.one", "1", { "de-DE": "eins", "fr-FR": "un" })]));
    assert.notEqual(base, catalogHash([entry("a.one", "1"), entry("a.two", "2")]));
  });

  it("does not confuse text that moves between fields", () => {
    assert.notEqual(catalogHash([entry("ab", "c")]), catalogHash([entry("a", "bc")]));
    assert.notEqual(catalogHash([entry("a", "x", { "de-DE": "y" })]), catalogHash([entry("a", "xy")]));
  });

  it("ignores the group", () => {
    assert.equal(catalogHash([{ key: "a", group: "one", source: "x", baselines: {} }]), catalogHash([{ key: "a", group: "two", source: "x", baselines: {} }]));
  });

  it("hashes an empty catalog", () => {
    assert.match(catalogHash([]), /^[0-9a-f]{64}$/);
  });
});
