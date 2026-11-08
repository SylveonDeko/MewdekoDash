export type Named = { id: string; name: string; color?: number };

export type SourceId = "twitch" | "streams" | "feeds" | "games";

export const SOURCES: SourceId[] = ["twitch", "streams", "feeds", "games"];

export type Notify = (message: string, type?: "success" | "error") => void;

export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function channelName(channels: Named[], id: bigint | string): string {
  return channels.find(channel => String(channel.id) === String(id))?.name ?? String(id);
}
