/**
 * Allow-list sanitiser for rendered wiki HTML. It works on strings, so it runs the same on the
 * server and in the browser. Every tag that is not listed is dropped, every attribute that is
 * not listed for its tag is dropped, links and image sources are limited to safe schemes, and a
 * `<` that does not start a well formed tag is escaped.
 */

const voidTags = new Set(["br", "hr", "img", "input"]);

const allowedAttributes: Record<string, readonly string[]> = {
  a: ["href", "title", "class", "aria-hidden"],
  blockquote: [],
  br: [],
  code: ["class"],
  del: [],
  div: ["class"],
  em: [],
  h1: ["id"],
  h2: ["id"],
  h3: ["id"],
  h4: ["id"],
  h5: ["id"],
  h6: ["id"],
  hr: [],
  img: ["src", "alt", "title"],
  input: ["type", "checked", "disabled"],
  li: [],
  ol: ["start"],
  p: [],
  pre: [],
  strong: [],
  table: [],
  tbody: [],
  td: ["align"],
  th: ["align"],
  thead: [],
  tr: [],
  ul: [],
};

const classPatterns: Record<string, RegExp> = {
  a: /^wiki-anchor$/,
  code: /^language-[a-z0-9_+#.-]{1,30}$/,
  div: /^(wiki-table|wiki-callout wiki-callout-(tip|note|warning|permission|example)|wiki-callout-label|wiki-example|wiki-example-card|wiki-example-row|wiki-example-label|wiki-example-part wiki-example-part-(message|author|title|description|field|image|thumbnail|footer|color|button|trigger|select))$/,
};

const tagPattern =
  /<(\/?)([A-Za-z][A-Za-z0-9-]*)((?:\s+[^\s"'<>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/y;
const attributePattern = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

const namedEntities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/**
 * Escapes text for use inside a double quoted attribute or as element text.
 *
 * @param value Plain text.
 */
export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function decodeEntities(value: string): string {
  return value.replace(/&(#x[0-9a-fA-F]{1,6}|#[0-9]{1,7}|[a-zA-Z]{2,6});?/g, (whole, body: string) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : "";
    }
    return namedEntities[body.toLowerCase()] ?? whole;
  });
}

function withoutInvisible(text: string): string {
  let out = "";
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    const invisible =
      code <= 0x20 ||
      (code >= 0x7f && code <= 0x9f) ||
      code === 0xad ||
      (code >= 0x200b && code <= 0x200f) ||
      code === 0x2028 ||
      code === 0x2029 ||
      code === 0xfeff;
    if (!invisible) out += char;
  }
  return out;
}

/**
 * Decides whether a link or image address is safe to emit.
 *
 * @param value The attribute value, with or without HTML entities.
 * @param allowMail Whether `mailto:` is allowed, which it is for links and not for images.
 * @returns The cleaned address, or null when it must be dropped.
 */
export function safeUrl(value: string, allowMail: boolean): string | null {
  const decoded = decodeEntities(value).trim();
  const probe = withoutInvisible(decoded).toLowerCase();
  if (!probe) return null;
  const scheme = /^([a-z][a-z0-9+.-]*):/.exec(probe);
  if (scheme) {
    if (scheme[1] === "http" || scheme[1] === "https") return decoded;
    if (scheme[1] === "mailto" && allowMail) return decoded;
    return null;
  }
  return decoded;
}

function readAttributes(source: string): Array<[string, string]> {
  const attributes: Array<[string, string]> = [];
  attributePattern.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = attributePattern.exec(source)) !== null) {
    const raw = match[2] ?? match[3] ?? match[4] ?? "";
    attributes.push([match[1].toLowerCase(), decodeEntities(raw)]);
  }
  return attributes;
}

function rebuildTag(name: string, attributes: Array<[string, string]>): string | null {
  if (!Object.hasOwn(allowedAttributes, name)) return null;
  const allowed = allowedAttributes[name];

  const kept = new Map<string, string>();
  for (const [key, value] of attributes) {
    if (!allowed.includes(key) || kept.has(key)) continue;

    if (key === "href") {
      const href = safeUrl(value, true);
      if (href !== null) kept.set(key, href);
    } else if (key === "src") {
      const src = safeUrl(value, false);
      if (src !== null) kept.set(key, src);
    } else if (key === "class") {
      if (classPatterns[name]?.test(value)) kept.set(key, value);
    } else if (key === "id") {
      if (/^[a-z0-9][a-z0-9-]{0,99}$/.test(value)) kept.set(key, value);
    } else if (key === "type") {
      if (name === "input" && value === "checkbox") kept.set(key, value);
    } else if (key === "align") {
      if (/^(left|right|center)$/.test(value)) kept.set(key, value);
    } else if (key === "start") {
      if (/^\d{1,6}$/.test(value)) kept.set(key, value);
    } else if (key === "aria-hidden") {
      if (value === "true") kept.set(key, value);
    } else if (key === "checked" || key === "disabled") {
      kept.set(key, "");
    } else {
      kept.set(key, value);
    }
  }

  if (name === "input" && kept.get("type") !== "checkbox") return null;
  if (name === "a") {
    const href = kept.get("href");
    if (href !== undefined && /^https?:/i.test(href.trim())) {
      kept.set("target", "_blank");
      kept.set("rel", "noopener noreferrer");
    }
  }

  let out = `<${name}`;
  for (const [key, value] of kept) {
    out += key === "checked" || key === "disabled" ? ` ${key}` : ` ${key}="${escapeHtml(value)}"`;
  }
  return out + ">";
}

/**
 * Sanitises rendered HTML.
 *
 * @param html HTML produced by the Markdown renderer.
 * @returns HTML containing only the allowed tags and attributes.
 */
export function sanitizeHtml(html: string): string {
  let out = "";
  let cursor = 0;
  while (cursor < html.length) {
    const next = html.indexOf("<", cursor);
    if (next === -1) {
      out += html.slice(cursor);
      break;
    }
    out += html.slice(cursor, next);

    tagPattern.lastIndex = next;
    const match = tagPattern.exec(html);
    if (!match) {
      out += "&lt;";
      cursor = next + 1;
      continue;
    }

    cursor = next + match[0].length;
    const closing = match[1] === "/";
    const name = match[2].toLowerCase();
    if (!Object.hasOwn(allowedAttributes, name)) continue;

    if (closing) {
      if (!voidTags.has(name)) out += `</${name}>`;
      continue;
    }
    const tag = rebuildTag(name, readAttributes(match[3]));
    if (tag !== null) out += tag;
  }
  return out;
}
