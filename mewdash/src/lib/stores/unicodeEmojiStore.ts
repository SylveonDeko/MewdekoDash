/**
 * Store for Unicode emojis loaded from emotes.js
 * Loads once at app initialization and provides searchable emoji list
 */

import { writable } from "svelte/store";
import emotes from "$lib/emotes.js";

export interface UnicodeEmoji {
  name: string; // Display name (without colons), e.g., "100"
  unicode: string; // Actual emoji character, e.g., "💯"
  searchTerms: string[]; // All possible search names for this emoji
}

// Process the emotes dictionary into a searchable format
function processEmojis(): UnicodeEmoji[] {
  const emojiMap = new Map<string, UnicodeEmoji>();

  for (const [key, value] of Object.entries(emotes)) {
    // Remove colons from key, e.g., ":100:" -> "100"
    const name = key.replace(/^:/, "").replace(/:$/, "");

    const existing = emojiMap.get(value);
    if (existing) {
      // This emoji already exists, add this name as an alias
      if (!existing.searchTerms.includes(name)) {
        existing.searchTerms.push(name);
      }
    } else {
      // New emoji
      emojiMap.set(value, {
        name: name,
        unicode: value,
        searchTerms: [name],
      });
    }
  }

  return Array.from(emojiMap.values());
}

// Create the store with processed emojis
function createUnicodeEmojiStore() {
  const emojis = processEmojis();
  const { subscribe } = writable(emojis);

  // Create a Map for fast lookups by unicode character
  const emojiMap = new Map<string, UnicodeEmoji>();
  for (const emoji of emojis) {
    emojiMap.set(emoji.unicode, emoji);
  }

  return {
    subscribe,
    // Utility function to search emojis
    search: (query: string) => {
      if (!query.trim()) return emojis;

      const lowerQuery = query.toLowerCase();
      return emojis.filter((emoji) =>
        emoji.searchTerms.some((term) =>
          term.toLowerCase().includes(lowerQuery),
        ),
      );
    },
    // Get total count
    count: () => emojis.length,
    // Fast lookup by unicode character
    getByUnicode: (unicode: string) => emojiMap.get(unicode),
  };
}

export const unicodeEmojiStore = createUnicodeEmojiStore();
