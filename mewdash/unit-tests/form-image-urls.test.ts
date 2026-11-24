import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { collectFormImageUrls } from "../src/lib/utils/formImageUrls.ts";

describe("form picture addresses", () => {
  it("collects question pictures and Markdown pictures in text and descriptions", () => {
    const urls = collectFormImageUrls([
      { imageUrl: "https://a.example/one.png", questionText: "Look ![x](https://b.example/two.png) here", placeholder: null },
      { imageUrl: null, questionText: "Plain", placeholder: "![](https://c.example/three.gif)" }
    ]);

    assert.deepEqual(urls, ["https://a.example/one.png", "https://b.example/two.png", "https://c.example/three.gif"]);
  });

  it("lists each address once and skips empty values", () => {
    const urls = collectFormImageUrls([
      { imageUrl: "https://a.example/one.png", questionText: "![](https://a.example/one.png)" },
      { imageUrl: "", questionText: "", placeholder: undefined }
    ]);

    assert.deepEqual(urls, ["https://a.example/one.png"]);
  });

  it("ignores plain links and addresses that are not pictures in the text", () => {
    const urls = collectFormImageUrls([{ questionText: "See [this](https://evil.example/x.png) or https://evil.example/y.png" }]);

    assert.deepEqual(urls, []);
  });

  it("finds nothing in a form without questions", () => {
    assert.deepEqual(collectFormImageUrls([]), []);
  });
});
