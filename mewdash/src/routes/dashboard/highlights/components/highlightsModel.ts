export type TabId = "members" | "disabled" | "stats";

export const TABS: TabId[] = ["members", "disabled", "stats"];

export type Named = { id: string; name: string; color?: number };

export type Notify = (message: string, type?: "success" | "error") => void;

export interface HighlightRow {
  id: number;
  userId: bigint | string;
  username?: string | null;
  word: string;
  dateAdded: string | null;
}

export interface Member {
  userId: string;
  username: string | null;
  words: HighlightRow[];
}

export interface DisabledUser {
  userId: bigint | string;
  username?: string | null;
  ignoredChannelsCount: number;
  ignoredUsersCount: number;
}

export interface HighlightStats {
  totalHighlights: number;
  totalUsers: number;
  topHighlightedWords: Array<{ word: string; count: number }>;
  topUsers: Array<{ userId: bigint | string; highlightCount: number }>;
  recentHighlights: Array<{ word: string; userId: bigint | string; dateAdded: string | null }>;
}

export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function knownName(name: string | null | undefined): string | null {
  return name && name !== "Unknown" ? name : null;
}

export function groupByMember(rows: HighlightRow[]): Member[] {
  const groups = new Map<string, Member>();
  for (const row of rows) {
    const key = String(row.userId);
    let member = groups.get(key);
    if (!member) {
      member = { userId: key, username: knownName(row.username), words: [] };
      groups.set(key, member);
    }
    member.words.push(row);
  }
  return [...groups.values()];
}

export function formatDate(value: string | null): string {
  return value ? new Date(value).toLocaleDateString() : "";
}
