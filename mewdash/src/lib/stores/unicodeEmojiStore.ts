/**
 * Store for Unicode emojis loaded from emotes.js
 *
 * The emoji table is around 360 KB, which is far too much to put on the initial load of every
 * route that happens to mount an emoji picker. It is fetched and processed the first time
 * something actually needs it, so a page carrying a picker nobody opens pays nothing.
 */

import { writable } from "svelte/store";

export interface UnicodeEmoji {
  name: string; // Display name (without colons), e.g., "100"
  unicode: string; // Actual emoji character, e.g., "💯"
  searchTerms: string[]; // All possible search names for this emoji
}

/** Turns the raw name-to-character dictionary into a searchable list, aliases merged. */
function processEmojis(emotes: Record<string, string>): UnicodeEmoji[] {
  const emojiMap = new Map<string, UnicodeEmoji>();

  for (const [key, value] of Object.entries(emotes)) {
    // Remove colons from key, e.g., ":100:" -> "100"
    const name = key.replace(/^:/, "").replace(/:$/, "");

    const existing = emojiMap.get(value);
    if (existing) {
      if (!existing.searchTerms.includes(name)) {
        existing.searchTerms.push(name);
      }
    } else {
      emojiMap.set(value, {
        name: name,
        unicode: value,
        searchTerms: [name],
      });
    }
  }

  return Array.from(emojiMap.values());
}

function createUnicodeEmojiStore() {
  const { subscribe, set } = writable<UnicodeEmoji[]>([]);

  let emojis: UnicodeEmoji[] = [];
  let emojiMap = new Map<string, UnicodeEmoji>();

  /** Held so concurrent callers share one download rather than starting several. */
  let loading: Promise<void> | null = null;

  async function load(): Promise<void> {
    if (emojis.length > 0) return;

    loading ??= (async () => {
      const module = await import("$lib/emotes.js");

      emojis = processEmojis(module.default as Record<string, string>);
      emojiMap = new Map(emojis.map((emoji) => [emoji.unicode, emoji]));

      set(emojis);
    })();

    await loading;
  }

  return {
    subscribe,

    /**
     * Fetches the emoji table if it is not already in memory. Call before searching or looking up,
     * and await it before showing a list.
     */
    load,

    /** Whether the table is in memory, so a caller can show a loading state for the first open. */
    isLoaded: () => emojis.length > 0,

    search: (query: string) => {
      if (!query.trim()) return emojis;

      const lowerQuery = query.toLowerCase();
      return emojis.filter((emoji) =>
        emoji.searchTerms.some((term) =>
          term.toLowerCase().includes(lowerQuery),
        ),
      );
    },

    count: () => emojis.length,

    getByUnicode: (unicode: string) => emojiMap.get(unicode),
  };
}

export const unicodeEmojiStore = createUnicodeEmojiStore();
