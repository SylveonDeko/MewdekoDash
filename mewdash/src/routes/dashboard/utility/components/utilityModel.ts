export type Named = { id: string; name: string };

export const TABS = ["aliases", "quotes", "autopublish", "streamrole", "ai", "nsfw", "rolemonitor"] as const;
export type TabId = (typeof TABS)[number];

export interface TabProps {
  guildId: bigint;
  onerror: (message: string) => void;
  onsuccess: (message: string) => void;
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
 * Names a member or role for display, falling back to its id.
 * @param list The known names
 * @param id The id to look up
 */
export function nameOf(list: Named[], id: bigint | string | null | undefined): string {
  if (id === null || id === undefined) return "";
  const key = id.toString();
  return list.find((x) => x.id === key)?.name ?? key;
}
