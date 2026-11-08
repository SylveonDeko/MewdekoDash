import { safeUrl } from "$lib/utils/sanitize";
import type { ChatLogMessage } from "$lib/api/index.ts";

export type Named = { id: string; name: string };

export type Notify = (message: string, type?: "success" | "error") => void;

export type TimeUnit = "minutes" | "hours" | "days";

export const TABS = ["fetch", "saved"] as const;
export type TabId = (typeof TABS)[number];

export interface MentionNames {
  users: Map<string, string>;
  channels: Map<string, string>;
  roles: Map<string, string>;
  unknownUser: string;
  unknownChannel: string;
  unknownRole: string;
}

const GROUP_GAP_MS = 5 * 60 * 1000;

export function maxTimeAmount(unit: TimeUnit): number {
  return unit === "days" ? 3 : unit === "hours" ? 72 : 4320;
}

export function afterDate(amount: number, unit: TimeUnit): string {
  const minutes = unit === "days" ? amount * 1440 : unit === "hours" ? amount * 60 : amount;
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function parseDate(value: string): Date {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

export function formatDateTime(value: string): string {
  return parseDate(value).toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric"
  });
}

export function formatDay(value: string): string {
  return parseDate(value).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

export function formatSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function isImageUrl(url: string): boolean {
  return /\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i.test(url);
}

export function escapeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const INLINE =
  /\[([^\]\n]+)\]\((https?:\/\/[^)\s]+)\)|(https?:\/\/(?:[^\s<&]|&amp;)+[^\s<.,:;"')\]&])|&lt;@!?(\d+)&gt;|&lt;@&amp;(\d+)&gt;|&lt;#(\d+)&gt;|\*\*([^*\n]+)\*\*|\*([^*\n]+)\*|__([^_\n]+)__|(?<!\w)_([^_\n]+)_(?!\w)|~~([^~\n]+)~~/g;

function renderInline(escaped: string, names: MentionNames): string {
  return escaped.replace(
    INLINE,
    (
      _match,
      label: string | undefined,
      linkUrl: string | undefined,
      bareUrl: string | undefined,
      userId: string | undefined,
      roleId: string | undefined,
      channelId: string | undefined,
      bold: string | undefined,
      italicStar: string | undefined,
      underline: string | undefined,
      italicUnderscore: string | undefined,
      strike: string | undefined
    ) => {
      if (label !== undefined && linkUrl) {
        return `<a href="${safeUrl(linkUrl)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
      }
      if (bareUrl) return `<a href="${safeUrl(bareUrl)}" target="_blank" rel="noopener noreferrer">${bareUrl}</a>`;
      if (userId) {
        const name = names.users.get(userId);
        return `<span class="mention">${name ? `@${escapeText(name)}` : escapeText(names.unknownUser)}</span>`;
      }
      if (roleId) {
        const name = names.roles.get(roleId);
        return `<span class="mention">${name ? `@${escapeText(name)}` : escapeText(names.unknownRole)}</span>`;
      }
      if (channelId) {
        const name = names.channels.get(channelId);
        return `<span class="mention">${name ? `#${escapeText(name)}` : escapeText(names.unknownChannel)}</span>`;
      }
      if (bold !== undefined) return `<strong>${bold}</strong>`;
      if (italicStar !== undefined) return `<em>${italicStar}</em>`;
      if (underline !== undefined) return `<u>${underline}</u>`;
      if (italicUnderscore !== undefined) return `<em>${italicUnderscore}</em>`;
      if (strike !== undefined) return `<del>${strike}</del>`;
      return _match;
    }
  );
}

/** Renders Discord markdown to HTML. */
export function renderMarkdown(text: string | null | undefined, names: MentionNames): string {
  if (!text) return "";
  const escaped = escapeText(text);
  const code = /```(?:[\w+-]*\n)?([\s\S]*?)```|`([^`\n]+)`/g;
  let out = "";
  let last = 0;
  for (const match of escaped.matchAll(code)) {
    out += renderInline(escaped.slice(last, match.index), names);
    out += match[1] !== undefined ? `<pre class="code-block"><code>${match[1]}</code></pre>` : `<code>${match[2]}</code>`;
    last = match.index + match[0].length;
  }
  out += renderInline(escaped.slice(last), names);
  return out.replace(/\n/g, "<br>");
}

export function groupByAuthor(messages: ChatLogMessage[]): ChatLogMessage[][] {
  const groups: ChatLogMessage[][] = [];
  for (const message of messages) {
    const group = groups[groups.length - 1];
    const previous = group?.[group.length - 1];
    const sameRun =
      previous &&
      previous.author?.id === message.author?.id &&
      parseDate(message.timestamp).getTime() - parseDate(previous.timestamp).getTime() < GROUP_GAP_MS;
    if (sameRun) group.push(message);
    else groups.push([message]);
  }
  return groups;
}

export function groupByDay(messages: ChatLogMessage[]): Array<{ day: string; messages: ChatLogMessage[] }> {
  const days = new Map<string, ChatLogMessage[]>();
  for (const message of messages) {
    const key = parseDate(message.timestamp).toDateString();
    const list = days.get(key);
    if (list) list.push(message);
    else days.set(key, [message]);
  }
  return [...days.entries()].map(([day, list]) => ({
    day,
    messages: list.sort((a, b) => parseDate(a.timestamp).getTime() - parseDate(b.timestamp).getTime())
  }));
}

export function matchesQuery(message: ChatLogMessage, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return (
    (message.content ?? "").toLowerCase().includes(needle) ||
    (message.author?.username ?? "").toLowerCase().includes(needle) ||
    (message.attachments ?? []).some(attachment => attachment.filename.toLowerCase().includes(needle)) ||
    (message.embeds ?? []).some(
      embed => (embed.title ?? "").toLowerCase().includes(needle) || (embed.description ?? "").toLowerCase().includes(needle)
    )
  );
}
