import { m } from "$lib/i18n";
import { ApiError } from "$lib/api/core";
import type {
  Automation,
  AutomationError,
  AutomationNode,
  AutomationNodeSpec,
  AutomationRequest,
  AutomationSchema,
} from "$lib/api/index.ts";
import type { GuildEmojiInfo } from "$lib/api/client/models";

export type Named = { id: string; name: string };
export type Notify = (message: string, type?: "success" | "error") => void;

/** Everything the editor needs to describe and fill in a node. */
export interface EditorContext {
  schema: AutomationSchema;
  channels: Named[];
  allChannels: Named[];
  roles: Named[];
  members: Named[];
  emojis: GuildEmojiInfo[];
}

export const BUTTON_STYLES = ["Primary", "Secondary", "Success", "Danger"];

type Catalog = Record<string, (() => string) | undefined>;

/**
 * Looks up a label by key, such as `triggerMessageSent`, and falls back to the bot's own text when
 * the dashboard has no translation for it yet.
 * @param key The message accessor name
 * @param fallback What to show when there is no such message
 */
export function label(key: string, fallback: string): string {
  return (m.automations as unknown as Catalog)[key]?.() ?? fallback;
}

/**
 * Turns an id the API returned, which may be a big number object, into a string.
 * @param value The id
 */
export function idString(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

/**
 * Reads an error's own message, which is the bot's when it gave one.
 * @param err The thrown value
 * @param fallback What to say when there is no message
 */
export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

/**
 * Reads the list of problems the bot sends back when an automation fails its checks.
 * @param err The thrown value
 */
export function validationErrors(err: unknown): AutomationError[] {
  if (!(err instanceof ApiError) || err.status !== 400) return [];
  const body = err.body as { errors?: AutomationError[]; Errors?: AutomationError[] } | null;
  return body?.errors ?? body?.Errors ?? [];
}

/**
 * Formats a date and time for a list row.
 * @param value An ISO date string; the bot sends UTC without a zone
 */
export function formatDate(value: string): string {
  const date = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/**
 * Builds the starting values of a new automation.
 * @param trigger The trigger it starts with
 */
export function emptyRequest(trigger: string): AutomationRequest {
  return {
    name: "",
    enabled: true,
    trigger,
    conditions: [],
    actions: [],
    cooldownSeconds: 0,
    cooldownScope: "User",
    retryOnFailure: false,
    ignoreBots: true,
    allowMassMentions: false,
  };
}

/**
 * Copies a stored automation into an editable request, with every id as a string.
 * @param automation The stored automation
 */
export function toRequest(automation: Automation): AutomationRequest {
  return {
    name: automation.name,
    enabled: automation.enabled,
    trigger: automation.trigger,
    conditions: automation.conditions.map(cleanNode),
    actions: automation.actions.map(cleanNode),
    cooldownSeconds: automation.cooldownSeconds,
    cooldownScope: automation.cooldownScope,
    retryOnFailure: automation.retryOnFailure,
    ignoreBots: automation.ignoreBots,
    allowMassMentions: automation.allowMassMentions,
  };
}

function cleanNode(node: AutomationNode): AutomationNode {
  return plain(node) as AutomationNode;
}

function plain(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(plain);
  if (isBig(value)) return String(value);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, plain(item)]));
  }
  return value;
}

function isBig(value: unknown): boolean {
  return typeof value === "object" && value !== null && typeof (value as { toFixed?: unknown }).toFixed === "function";
}

/**
 * Builds a node of a type with the default of each field filled in.
 * @param spec The condition or action type
 */
export function defaultNode(spec: AutomationNodeSpec): AutomationNode {
  const node: AutomationNode = { type: spec.type };
  for (const field of spec.fields) {
    if (field.default !== null && field.default !== undefined) node[field.name] = field.default;
  }
  return node;
}

/**
 * Checks whether a node type has both a text and an embed field, which the editor shows as one message.
 * @param spec The condition or action type
 */
export function hasMessagePair(spec: AutomationNodeSpec): boolean {
  const kinds = new Map(spec.fields.map((x) => [x.name, x.kind]));
  return kinds.get("text") === "LongText" && kinds.get("embed") === "EmbedJson";
}

/**
 * Reads the message of a node as the single string the message editor works with.
 * @param node The node
 */
export function readMessage(node: AutomationNode): string {
  return String(node.embed ?? node.text ?? "");
}

/**
 * Stores a message from the message editor in the text or the embed field of a node.
 * @param node The node
 * @param message The message as the editor serialised it
 */
export function writeMessage(node: AutomationNode, message: string) {
  const trimmed = message.trim();
  delete node.text;
  delete node.embed;
  if (!trimmed) return;
  if (trimmed.startsWith("{")) node.embed = message;
  else node.text = message;
}

/**
 * Finds the display name of an emoji stored as a mention, an id or unicode.
 * @param emoji The stored emoji
 * @param emojis The emojis of the guilds the member can use
 */
export function emojiLabel(emoji: string, emojis: GuildEmojiInfo[]): string {
  const mention = /^<a?:([^:]+):\d+>$/.exec(emoji);
  if (mention) return `:${mention[1]}:`;
  if (/^\d{15,21}$/.test(emoji)) {
    for (const guild of emojis) {
      const found = guild.emojis.find((x) => x.id === emoji);
      if (found) return `:${found.name}:`;
    }
  }
  return emoji;
}

/**
 * Lists the specs that can be used with a trigger.
 * @param specs Every condition or action type
 * @param trigger The trigger type
 */
export function availableFor(specs: AutomationNodeSpec[], trigger: string): AutomationNodeSpec[] {
  return specs.filter((x) => x.triggers.includes(trigger));
}
