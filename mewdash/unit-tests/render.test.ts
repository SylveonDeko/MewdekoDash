import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { renderMarkdown } from "../src/lib/wiki/renderCore.ts";
import { safeUrl, sanitizeHtml } from "../src/lib/wiki/sanitize.ts";

const render = (markdown: string) => renderMarkdown(markdown, (kind) => kind.toLowerCase()).html;

describe("rendering untrusted Markdown", () => {
  it("shows raw HTML as text", () => {
    const html = render('<script>alert(1)</script>\n\n<img src=x onerror=alert(1)>\n\n<iframe src="https://x"></iframe>');
    assert.ok(!/<script/i.test(html));
    assert.ok(!/<iframe/i.test(html));
    assert.ok(!/<img/i.test(html));
    assert.ok(html.includes("&lt;script&gt;"));
  });

  it("drops script-style link targets", () => {
    for (const href of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "  javascript:alert(1)", "data:text/html,<b>x</b>", "vbscript:x", "java&#x09;script:alert(1)", "&#106;avascript:alert(1)"]) {
      const html = render(`[click](${href})`);
      assert.ok(!/href=/i.test(html) || !/(javascript|data|vbscript):/i.test(html), `${href} -> ${html}`);
    }
  });

  it("drops script-style image sources", () => {
    const html = render("![x](javascript:alert(1))");
    assert.ok(!/javascript:/i.test(html), html);
  });

  it("keeps normal links and marks external ones", () => {
    const html = render("[docs](https://example.com/a?b=1&c=2) and [home](/wiki/xp) and [top](#top) and [mail](mailto:a@b.c)");
    assert.ok(html.includes('href="https://example.com/a?b=1&amp;c=2"'));
    assert.ok(html.includes('target="_blank" rel="noopener noreferrer"'));
    assert.ok(html.includes('href="/wiki/xp"'));
    assert.ok(html.includes('href="#top"'));
    assert.ok(html.includes('href="mailto:a@b.c"'));
    assert.equal(html.match(/target="_blank"/g)?.length, 1);
  });

  it("does not let an attribute break out of its quotes", () => {
    const html = render('[x](https://a.com/"onmouseover="alert(1))');
    assert.ok(!/onmouseover=/.test(html.replace(/&quot;/g, "")) || !/\sonmouseover=/.test(html), html);
  });

  it("renders the usual Markdown features", () => {
    const html = render("## Title\n\n**bold** `code`\n\n- a\n- b\n\n| h |\n| - |\n| c |\n\n```js\nlet a = 1 < 2;\n```");
    assert.ok(html.includes('<h2 id="title">'));
    assert.ok(html.includes("<strong>bold</strong>"));
    assert.ok(html.includes("<li>a</li>"));
    assert.ok(html.includes('<div class="wiki-table"><table>'));
    assert.ok(html.includes('<code class="language-js">'));
    assert.ok(html.includes("1 &lt; 2"));
  });

  it("builds callouts and escapes their label", () => {
    const html = renderMarkdown("> [!TIP]\n> Remember this", () => "<b>Tip</b>").html;
    assert.ok(html.includes('<div class="wiki-callout wiki-callout-tip">'));
    assert.ok(html.includes("&lt;b&gt;Tip&lt;/b&gt;"));
  });

  it("collects headings for the table of contents", () => {
    const { headings } = renderMarkdown("## One\n\n### Two\n\n## One", () => "");
    assert.deepEqual(headings.map((h) => h.id), ["one", "two", "one-2"]);
  });

  it("shows <id> style placeholders as text", () => {
    assert.ok(render("Use <id> here").includes("&lt;id&gt;"));
  });
});

describe("html sanitiser", () => {
  it("removes tags and attributes that are not allowed", () => {
    assert.equal(sanitizeHtml('<p onclick="x()" style="color:red">hi</p>'), "<p>hi</p>");
    assert.equal(sanitizeHtml("<script>alert(1)</script>"), "alert(1)");
    assert.equal(sanitizeHtml('<div class="evil">x</div>'), "<div>x</div>");
    assert.equal(sanitizeHtml('<a href="javascript:alert(1)">x</a>'), "<a>x</a>");
    assert.equal(sanitizeHtml('<img src="javascript:alert(1)" onerror="x">'), '<img loading="lazy" decoding="async" referrerpolicy="no-referrer">');
  });

  it("drops protocol relative addresses", () => {
    assert.equal(safeUrl("//evil.example/x.png", false), null);
    assert.equal(safeUrl("/\\evil.example/x.png", false), null);
    assert.equal(safeUrl("/cdn/wiki/a.png", false), "/cdn/wiki/a.png");
  });

  it("lets the caller rewrite or drop image sources and keeps images lazy and without referrer", () => {
    const html = sanitizeHtml('<img src="https://a.example/x.png" alt="a">', (src) => `/proxy?u=${src}`);
    assert.equal(html, '<img src="/proxy?u=https://a.example/x.png" alt="a" loading="lazy" decoding="async" referrerpolicy="no-referrer">');
    assert.ok(!sanitizeHtml('<img src="https://a.example/x.png">', () => null).includes("src="));
  });

  it("shows text that is too complex to parse as plain text", () => {
    const html = render("#\n".repeat(1100));
    assert.ok(html.startsWith("<pre><code>"));
    assert.ok(!html.includes("<h1"));
  });

  it("escapes a stray less-than sign and broken tags", () => {
    assert.equal(sanitizeHtml("1 < 2"), "1 &lt; 2");
    assert.equal(sanitizeHtml("<p <em>x"), "&lt;p <em>x");
    assert.equal(sanitizeHtml('<a href="x'), '&lt;a href="x');
  });

  it("ignores names that exist on Object.prototype", () => {
    assert.equal(sanitizeHtml("<constructor>x</constructor><toString>y</toString><hasOwnProperty>z</hasOwnProperty>"), "xyz");
  });

  it("only allows checkbox inputs", () => {
    assert.equal(sanitizeHtml('<input type="checkbox" checked disabled>'), '<input type="checkbox" checked disabled>');
    assert.equal(sanitizeHtml('<input type="text" value="x">'), "");
  });

  it("allows only http, https and mailto addresses plus relative ones", () => {
    assert.equal(safeUrl("https://a.b", true), "https://a.b");
    assert.equal(safeUrl("/wiki/x", true), "/wiki/x");
    assert.equal(safeUrl("mailto:a@b.c", true), "mailto:a@b.c");
    assert.equal(safeUrl("mailto:a@b.c", false), null);
    assert.equal(safeUrl("javascript:x", true), null);
    assert.equal(safeUrl("ja\nva\tscript:x", true), null);
    assert.equal(safeUrl("&#x6a;avascript:x", true), null);
    assert.equal(safeUrl("", true), null);
  });
});
