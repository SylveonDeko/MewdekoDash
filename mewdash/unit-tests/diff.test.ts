import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { collapseDiff, diffLines, diffStats, diffVersions } from "../src/lib/wiki/diff.ts";

const kinds = (ops: ReturnType<typeof diffLines>) => ops.map((op) => `${op.kind}:${op.text}`);

describe("line diff", () => {
  it("reports identical text as all unchanged", () => {
    assert.deepEqual(kinds(diffLines("a\nb", "a\nb")), ["same:a", "same:b"]);
  });

  it("finds an added line", () => {
    assert.deepEqual(kinds(diffLines("a\nc", "a\nb\nc")), ["same:a", "add:b", "same:c"]);
  });

  it("finds a deleted line", () => {
    assert.deepEqual(kinds(diffLines("a\nb\nc", "a\nc")), ["same:a", "del:b", "same:c"]);
  });

  it("shows a replaced line as a delete and an add", () => {
    assert.deepEqual(kinds(diffLines("a\nb\nc", "a\nx\nc")), ["same:a", "del:b", "add:x", "same:c"]);
  });

  it("handles empty sides", () => {
    assert.deepEqual(kinds(diffLines("", "a\nb")), ["add:a", "add:b"]);
    assert.deepEqual(kinds(diffLines("a\nb", "")), ["del:a", "del:b"]);
    assert.deepEqual(diffLines("", ""), []);
  });

  it("aligns changes in the middle with a common subsequence", () => {
    const ops = diffLines("1\n2\n3\n4\n5", "1\n3\n4\n6\n5");
    assert.deepEqual(kinds(ops), ["same:1", "del:2", "same:3", "same:4", "add:6", "same:5"]);
    assert.deepEqual(diffStats(ops), { added: 1, deleted: 1 });
  });

  it("replays to the new text", () => {
    const before = "intro\nalpha\nbeta\ngamma\nend";
    const after = "intro\nbeta\ndelta\ngamma\nextra\nend";
    const ops = diffLines(before, after);
    assert.equal(ops.filter((op) => op.kind !== "del").map((op) => op.text).join("\n"), after);
    assert.equal(ops.filter((op) => op.kind !== "add").map((op) => op.text).join("\n"), before);
  });

  it("falls back to one replaced block when the texts are too large to align", () => {
    const a = Array.from({ length: 2500 }, (_, i) => `a${i}`).join("\n");
    const b = Array.from({ length: 2500 }, (_, i) => `b${i}`).join("\n");
    const ops = diffLines(a, b);
    assert.equal(ops.length, 5000);
    assert.deepEqual(diffStats(ops), { added: 2500, deleted: 2500 });
  });
});

describe("collapsed diff", () => {
  it("keeps context around changes and drops the rest", () => {
    const lines = Array.from({ length: 20 }, (_, i) => `line${i}`);
    const changed = [...lines];
    changed[10] = "changed";
    const chunks = collapseDiff(diffLines(lines.join("\n"), changed.join("\n")), 2);
    assert.equal(chunks.length, 1);
    assert.deepEqual(kinds(chunks[0]), ["same:line8", "same:line9", "del:line10", "add:changed", "same:line11", "same:line12"]);
  });

  it("splits distant changes into separate chunks", () => {
    const lines = Array.from({ length: 30 }, (_, i) => `line${i}`);
    const changed = [...lines];
    changed[2] = "x";
    changed[27] = "y";
    assert.equal(collapseDiff(diffLines(lines.join("\n"), changed.join("\n")), 1).length, 2);
  });
});

describe("version diff", () => {
  const base = { title: "T", summary: "S", tags: ["a"], markdown: "one\ntwo" };

  it("returns only the fields that changed", () => {
    const result = diffVersions(base, { ...base, title: "T2", markdown: "one\nthree" });
    assert.deepEqual(result.map((d) => d.field), ["title", "markdown"]);
  });

  it("returns nothing for identical versions", () => {
    assert.deepEqual(diffVersions(base, { ...base }), []);
  });

  it("treats a missing older version as empty", () => {
    const result = diffVersions(null, base);
    assert.deepEqual(result.map((d) => d.field), ["title", "summary", "tags", "markdown"]);
  });

  it("compares tags as a list", () => {
    const result = diffVersions(base, { ...base, tags: ["a", "b"] });
    assert.deepEqual(result.map((d) => d.field), ["tags"]);
    assert.deepEqual(kinds(result[0].ops), ["del:a", "add:a, b"]);
  });
});
