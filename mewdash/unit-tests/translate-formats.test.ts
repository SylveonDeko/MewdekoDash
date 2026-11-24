import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { csvCellText, csvCellValue, readCsv, readJson, resourceFiles, writeCsv, writeJson } from "../src/lib/translate/formats.ts";
import { buildZip } from "../src/lib/translate/zip.ts";

const entries = [
  { key: "a.hello", group: "a", source: "Hello {0}", text: "Hallo {0}" },
  { key: "a.formula", group: "a", source: "=1+1", text: "=SUM(A1)" },
  { key: "b.quote", group: "b", source: 'Say "hi", {0}', text: "Sag \"hallo\",\nzeile" },
  { key: "b.none", group: "b", source: "Nothing", text: null },
];

describe("csv cells", () => {
  it("marks anything a spreadsheet could read as a formula", () => {
    for (const value of ["=1+1", "+1", "-1", "@SUM(A1)", "\tx", "\rx"]) assert.equal(csvCellText(value).startsWith("'"), true, value);
    assert.equal(csvCellText("plain"), "plain");
    assert.equal(csvCellText("Hello = world"), "Hello = world");
  });

  it("gives back the exact text it was given", () => {
    for (const value of ["=1+1", "'=1+1", "''-x", "plain", "'plain", "-", "@"]) assert.equal(csvCellValue(csvCellText(value)), value, value);
  });

  it("writes no cell that starts with a formula character", () => {
    const text = writeCsv(entries);
    for (const line of text.split("\r\n").slice(1)) {
      for (const cell of line.split(",")) assert.equal(/^"?[=+\-@]/.test(cell), false, cell);
    }
  });
});

describe("csv and json round trips", () => {
  it("reads back what the csv export wrote", () => {
    const file = readCsv(writeCsv(entries));
    assert.ok(file);
    assert.deepEqual(file.entries.map((e) => [e.key, e.source, e.text]), entries.map((e) => [e.key, e.source, e.text]));
  });

  it("reads back what the json export wrote", () => {
    const file = readJson(writeJson("bot", "de-DE", entries));
    assert.ok(file);
    assert.equal(file.catalog, "bot");
    assert.equal(file.locale, "de-DE");
    assert.deepEqual(file.entries.map((e) => [e.key, e.text]), entries.map((e) => [e.key, e.text]));
  });

  it("reads a flat object and a list", () => {
    assert.deepEqual(readJson('{"a.x":"X","a.y":null}')?.entries.map((e) => [e.key, e.text]), [["a.x", "X"], ["a.y", null]]);
    assert.deepEqual(readJson('[{"key":"k","text":"T"}]')?.entries.map((e) => [e.key, e.text]), [["k", "T"]]);
  });

  it("refuses files it cannot read", () => {
    assert.equal(readJson("not json"), null);
    assert.equal(readJson("3"), null);
    assert.equal(readJson('[{"text":"no key"}]'), null);
    assert.equal(readCsv('key,translation\r\n"open,quote'), null);
    assert.equal(readCsv("a,b\r\n1,2"), null);
  });
});

describe("resource files", () => {
  it("writes one flat sorted file per group in a folder named for the language", () => {
    const files = resourceFiles("dash", "de-DE", entries);
    assert.deepEqual(files.map((f) => f.path), ["de-DE/a.json", "de-DE/b.json"]);
    assert.deepEqual(JSON.parse(files[0].content), { formula: "=SUM(A1)", hello: "Hallo {0}" });
    assert.deepEqual(JSON.parse(files[1].content), { quote: "Sag \"hallo\",\nzeile" });
  });

  it("keeps the whole key for the bot", () => {
    const files = resourceFiles("bot", "de-DE", [{ key: "abrole_add", group: "administration", source: "x", text: "y" }]);
    assert.deepEqual(JSON.parse(files[0].content), { abrole_add: "y" });
  });
});

describe("zip", () => {
  it("starts with a local header and ends with the directory record", () => {
    const zip = buildZip([{ path: "de-DE/a.json", content: "{}" }]);
    const view = new DataView(zip.buffer);
    assert.equal(view.getUint32(0, true), 0x04034b50);
    assert.equal(view.getUint32(zip.length - 22, true), 0x06054b50);
    assert.equal(view.getUint16(zip.length - 12, true), 1);
  });
});
