// lib/utils/embedMessage.ts

/**
 * The pieces a stored message breaks down into, matching the props PreviewCard
 * and FullscreenEmbedBuilder work with.
 */
export interface ParsedMessage {
  content: string;
  embeds: any[];
  componentRows: any[];
}

/**
 * Parses a message as the bot stores it into the object shape the embed builder
 * and preview expect. Messages are stored as the raw embed JSON the bot feeds to
 * SmartEmbed, so a plain string is treated as message content, and anything that
 * fails to parse falls back to itself rather than being dropped.
 *
 * Passing a stored string straight into FullscreenEmbedBuilder's `value` silently
 * loses it, since the builder reads `value.content` and `value.embeds`.
 */
export function parseStoredMessage(message: string | Record<string, any> | null | undefined): ParsedMessage {
  const empty: ParsedMessage = { content: "", embeds: [], componentRows: [] };
  if (!message) return empty;
  if (typeof message !== "string") return splitParsed(message);
  if (!message.trim().startsWith("{")) return { ...empty, content: message };

  try {
    return splitParsed(JSON.parse(message));
  } catch {
    return { ...empty, content: message };
  }
}

/**
 * Splits an already-parsed message object into content, embeds and component
 * rows, grouping flat components by their row index the way the builder does.
 */
function splitParsed(parsed: Record<string, any>): ParsedMessage {
  const rows = new Map<number, any[]>();

  if (Array.isArray(parsed.components)) {
    for (const component of parsed.components) {
      const rowIndex = component.row || 0;
      if (!rows.has(rowIndex)) rows.set(rowIndex, []);
      rows.get(rowIndex)!.push(component);
    }
  }

  return {
    content: typeof parsed.content === "string" ? parsed.content : "",
    embeds: Array.isArray(parsed.embeds) ? parsed.embeds : parsed.embed ? [parsed.embed] : [],
    componentRows: Array.from(rows.entries()).map(([rowIndex, components]) => ({
      rowKey: `row-${rowIndex}`,
      components
    }))
  };
}

/**
 * Parses a stored message into the object FullscreenEmbedBuilder binds to. Unlike
 * parseStoredMessage this keeps the builder's own key names, so it round-trips
 * through the builder unchanged.
 */
export function toBuilderValue(message: string | Record<string, any> | null | undefined): Record<string, any> {
  if (!message) return {};
  if (typeof message !== "string") return message;

  if (message.trim().startsWith("{")) {
    try {
      return JSON.parse(message);
    } catch {
      return { content: message };
    }
  }

  return { content: message };
}

/**
 * Serializes an embed builder value back into the string the bot stores. Plain
 * strings pass through and an empty builder becomes an empty message.
 */
export function serializeMessage(message: any): string {
  if (typeof message === "string") return message;
  return message && Object.keys(message).length > 0 ? JSON.stringify(message) : "";
}
