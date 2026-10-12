/**
 * Builders for Discord component embeds: the components v2 subset a page can declare in its head so
 * Discord renders it instead of the Open Graph card when the link is pasted. Only link buttons are
 * allowed, images must be absolute http(s) URLs and the whole payload may not exceed 3,000 bytes.
 */

export const COMPONENT_EMBED_MAX_BYTES = 3000;

export const SITE_ORIGIN = "https://mewdeko.tech";

export type EmbedComponent =
  | { type: 1; components: EmbedButton[] }
  | { type: 9; components: EmbedText[]; accessory: EmbedThumbnail }
  | EmbedText
  | { type: 12; items: { media: { url: string } }[] }
  | { type: 14; divider?: boolean; spacing?: 1 | 2 };

export interface EmbedText {
  type: 10;
  content: string;
}

export interface EmbedButton {
  type: 2;
  style: 5;
  label: string;
  url: string;
}

export interface EmbedThumbnail {
  type: 11;
  media: { url: string };
}

export interface ComponentEmbed {
  component: {
    type: 17;
    accent_color?: number;
    components: EmbedComponent[];
  };
}

export const EMBED_ACCENT = 0x9f7aea;

export function text(content: string): EmbedText {
  return { type: 10, content };
}

export function separator(spacing: 1 | 2 = 1): EmbedComponent {
  return { type: 14, divider: true, spacing };
}

export function linkButton(label: string, url: string): EmbedButton {
  return { type: 2, style: 5, label, url };
}

export function buttons(...items: (EmbedButton | null | false)[]): EmbedComponent | null {
  const list = items.filter((item): item is EmbedButton => !!item && isWebUrl(item.url));
  return list.length ? { type: 1, components: list } : null;
}

/** A heading with an optional thumbnail beside it, falling back to plain text when there is no usable image. */
export function header(content: string, image: string | null | undefined): EmbedComponent {
  return isWebUrl(image)
    ? { type: 9, components: [text(content)], accessory: { type: 11, media: { url: image } } }
    : text(content);
}

export function gallery(image: string | null | undefined): EmbedComponent | null {
  return isWebUrl(image) ? { type: 12, items: [{ media: { url: image } }] } : null;
}

export function container(...components: (EmbedComponent | null | false)[]): ComponentEmbed {
  return {
    component: {
      type: 17,
      accent_color: EMBED_ACCENT,
      components: components.filter((component): component is EmbedComponent => !!component)
    }
  };
}

/**
 * Builds an embed whose text component lists the given rows, dropping rows from the end until the
 * payload fits the size cap. The lines are joined with newlines inside one text display.
 */
export function withRows(build: (rows: string[]) => ComponentEmbed, rows: string[]): ComponentEmbed {
  let embed = build(rows);
  while (rows.length > 1 && byteLength(embed) > COMPONENT_EMBED_MAX_BYTES) {
    rows = rows.slice(0, -1);
    embed = build(rows);
  }
  return embed;
}

export function fits(embed: ComponentEmbed): boolean {
  return byteLength(embed) <= COMPONENT_EMBED_MAX_BYTES;
}

/** Escapes Discord markdown and neutralises mentions so a user-chosen name renders literally. */
export function plain(value: string | null | undefined): string {
  return (value ?? "")
    .replace(/<[^>]+>/g, "")
    .replace(/[\\*_~`|>#[\]]/g, "\\$&")
    .replace(/@(everyone|here)/gi, "@​$1")
    .replace(/<(@[!&]?|#|a?:)/g, "<​$1")
    .replace(/\s+/g, " ")
    .trim();
}

/** The inline script tag that declares the embed, or null when it does not fit. */
export function embedScript(embed: ComponentEmbed | null | undefined): string | null {
  if (!embed || !fits(embed)) return null;
  const json = JSON.stringify(embed).replace(/</g, "\\u003c");
  return `<script id="discord:component-embed" type="application/json">${json}<\/script>`;
}

function byteLength(embed: ComponentEmbed): number {
  return new TextEncoder().encode(JSON.stringify(embed)).length;
}

export function isWebUrl(value: string | null | undefined): value is string {
  return !!value && /^https?:\/\//i.test(value) && value.length <= 2048;
}
