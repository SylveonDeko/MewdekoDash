import type { TtsVcSetting } from "$lib/api/music/models";

export type Named = { id: string; name: string };

export type TabId = "music" | "tts";
export const TAB_IDS: TabId[] = ["music", "tts"];

export const AUTO_DISCONNECT = { none: 0, voice: 1, queue: 2, either: 3 } as const;
export const AUTOPLAY_MAX = 5;
export const TTS_QUEUE_MAX = 50;

export const FILTER_KEYS = [
  "bassboost",
  "nightcore",
  "vaporwave",
  "karaoke",
  "tremolo",
  "vibrato",
  "rotation",
  "distortion"
] as const;

export const PLAYER_PLAYING = 2;

export interface QueueEntry {
  index: number;
  title: string;
  author: string;
}

export interface PlayerView {
  title: string;
  author: string;
  artwork: string | null;
  playing: boolean;
  repeat: number | null;
  channelName: string | null;
  queue: QueueEntry[];
  filters: Record<string, boolean>;
}

function pick(source: any, ...keys: string[]): any {
  if (!source) return undefined;
  for (const key of keys) if (source[key] !== undefined) return source[key];
  return undefined;
}

function entryOf(raw: any, position: number): QueueEntry {
  const track = pick(raw, "track", "Track");
  return {
    index: Number(pick(raw, "index", "Index") ?? position),
    title: String(pick(track, "title", "Title") ?? ""),
    author: String(pick(track, "author", "Author") ?? "")
  };
}

/** Reads the player status whichever casing the bot answered in. Returns null when nothing is playing. */
export function readPlayer(status: any): { view: PlayerView; playingTrack: boolean } | null {
  if (!status) return null;
  const current = pick(status, "currentTrack", "CurrentTrack");
  const queueRaw: any[] = pick(status, "queue", "Queue") ?? [];
  const filtersRaw = pick(status, "filters", "Filters") ?? {};
  const filters: Record<string, boolean> = {};
  for (const [name, value] of Object.entries(filtersRaw)) filters[name.toLowerCase()] = Boolean(value);

  const track = pick(current, "track", "Track");
  const currentIndex = current ? entryOf(current, -1).index : null;
  const queue = currentIndex === null ? [] : queueRaw.map(entryOf).filter(entry => entry.index > currentIndex);

  return {
    playingTrack: Boolean(current),
    view: {
      title: String(pick(track, "title", "Title") ?? ""),
      author: String(pick(track, "author", "Author") ?? ""),
      artwork: pick(track, "artworkUri", "ArtworkUri") ?? null,
      playing: Number(pick(status, "state", "State")) === PLAYER_PLAYING,
      repeat: pick(status, "repeatMode", "RepeatMode") ?? null,
      channelName: pick(status, "channelName", "ChannelName") ?? null,
      queue,
      filters
    }
  };
}

export function idString(value: bigint | string | number | null | undefined): string {
  return value === null || value === undefined ? "" : value.toString();
}

export function nameOf(list: Named[], id: bigint | string | null | undefined, fallback: string): string {
  const key = idString(id);
  return list.find(item => idString(item.id) === key)?.name ?? fallback;
}

export function vcPayload(vc: TtsVcSetting) {
  return {
    voiceChannelId: vc.voiceChannelId,
    enabled: vc.enabled,
    linkedTextChannelId: vc.linkedTextChannelId,
    announceJoinLeave: vc.announceJoinLeave,
    joinFormat: vc.joinFormat,
    leaveFormat: vc.leaveFormat,
    autoJoin: vc.autoJoin
  };
}
