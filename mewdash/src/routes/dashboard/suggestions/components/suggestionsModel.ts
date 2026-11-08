import { suggestionsApi } from "$lib/api/index.ts";

export type Named = { id: string; name: string };

export interface Cfg {
  suggestChannel: string | null;
  acceptChannel: string | null;
  denyChannel: string | null;
  considerChannel: string | null;
  implementChannel: string | null;
  buttonChannel: string | null;
  minLength: number;
  maxLength: number;
  anonymous: boolean;
  voteColor: number;
  threadType: number;
  emoteMode: number;
  buttonColor: number;
  style1: number;
  style2: number;
  style3: number;
  style4: number;
  style5: number;
  suggestEmotes: string[];
  buttonEmote: string | null;
  buttonLabel: string;
  suggestionMessage: string;
  acceptMessage: string;
  denyMessage: string;
  considerMessage: string;
  implementMessage: string;
  buttonMessage: string;
  archiveOnAccept: boolean;
  archiveOnDeny: boolean;
  archiveOnConsider: boolean;
  archiveOnImplement: boolean;
}

export type SaveMode = "now" | "typing";
export type Change = <K extends keyof Cfg>(key: K, value: Cfg[K], mode?: SaveMode) => void;

export const MAX_LENGTH = 2000;

type Senders = { [K in keyof Cfg]: (guildId: bigint, value: Cfg[K]) => Promise<unknown> };

const channel = (value: string | null) => (value ? BigInt(value) : 0n);
const message = (value: string) => (value.trim() ? value : null);

export const senders: Senders = {
  suggestChannel: (g, v) => suggestionsApi.setSuggestChannel(g, channel(v)),
  acceptChannel: (g, v) => suggestionsApi.setAcceptChannel(g, channel(v)),
  denyChannel: (g, v) => suggestionsApi.setDenyChannel(g, channel(v)),
  considerChannel: (g, v) => suggestionsApi.setConsiderChannel(g, channel(v)),
  implementChannel: (g, v) => suggestionsApi.setImplementChannel(g, channel(v)),
  buttonChannel: (g, v) => suggestionsApi.setSuggestButtonChannel(g, channel(v)),
  minLength: (g, v) => suggestionsApi.setMinLength(g, v),
  maxLength: (g, v) => suggestionsApi.setMaxLength(g, v),
  anonymous: (g, v) => suggestionsApi.setAnonymous(g, v),
  voteColor: (g, v) => suggestionsApi.setVoteColor(g, v),
  threadType: (g, v) => suggestionsApi.setSuggestThreadsType(g, v),
  emoteMode: (g, v) => suggestionsApi.setEmoteMode(g, v),
  buttonColor: (g, v) => suggestionsApi.setSuggestButtonColor(g, v),
  style1: (g, v) => suggestionsApi.setEmoteButtonStyle(g, 1, v),
  style2: (g, v) => suggestionsApi.setEmoteButtonStyle(g, 2, v),
  style3: (g, v) => suggestionsApi.setEmoteButtonStyle(g, 3, v),
  style4: (g, v) => suggestionsApi.setEmoteButtonStyle(g, 4, v),
  style5: (g, v) => suggestionsApi.setEmoteButtonStyle(g, 5, v),
  suggestEmotes: (g, v) => suggestionsApi.setSuggestEmotes(g, v.length ? v.join(",") : null),
  buttonEmote: (g, v) => suggestionsApi.setSuggestButtonEmote(g, v),
  buttonLabel: (g, v) => suggestionsApi.setSuggestButtonLabel(g, v.trim() || null),
  suggestionMessage: (g, v) => suggestionsApi.setSuggestionMessage(g, message(v)),
  acceptMessage: (g, v) => suggestionsApi.setAcceptMessage(g, message(v)),
  denyMessage: (g, v) => suggestionsApi.setDenyMessage(g, message(v)),
  considerMessage: (g, v) => suggestionsApi.setConsiderMessage(g, message(v)),
  implementMessage: (g, v) => suggestionsApi.setImplementMessage(g, message(v)),
  buttonMessage: (g, v) => suggestionsApi.setSuggestButtonMessage(g, message(v)),
  archiveOnAccept: (g, v) => suggestionsApi.setArchiveOnAccept(g, v),
  archiveOnDeny: (g, v) => suggestionsApi.setArchiveOnDeny(g, v),
  archiveOnConsider: (g, v) => suggestionsApi.setArchiveOnConsider(g, v),
  archiveOnImplement: (g, v) => suggestionsApi.setArchiveOnImplement(g, v)
};

function unwrap(value: unknown): unknown {
  return value && typeof value === "object" && "data" in value ? (value as { data: unknown }).data : value;
}

function text(value: unknown): string {
  const inner = unwrap(value);
  return typeof inner === "string" && inner !== "-" && inner !== "disabled" ? inner : "";
}

function num(value: unknown, fallback: number): number {
  const inner = unwrap(value);
  const parsed = typeof inner === "number" ? inner : typeof inner === "string" ? parseInt(inner, 10) : NaN;
  return Number.isNaN(parsed) ? fallback : parsed;
}

function id(value: unknown): string | null {
  const inner = unwrap(value);
  const raw = inner === null || inner === undefined ? "" : String(inner);
  return raw && raw !== "0" ? raw : null;
}

export async function loadConfig(guildId: bigint): Promise<Cfg> {
  const api = suggestionsApi;
  const [
    suggestChannel,
    acceptChannel,
    denyChannel,
    considerChannel,
    implementChannel,
    buttonChannel,
    minLength,
    maxLength,
    anonymous,
    voteColor,
    threadType,
    emoteMode,
    buttonColor,
    style1,
    style2,
    style3,
    style4,
    style5,
    suggestEmotes,
    buttonEmote,
    buttonLabel,
    suggestionMessage,
    acceptMessage,
    denyMessage,
    considerMessage,
    implementMessage,
    buttonMessage,
    archiveOnAccept,
    archiveOnDeny,
    archiveOnConsider,
    archiveOnImplement
  ] = await Promise.all([
    api.getSuggestChannel(guildId),
    api.getAcceptChannel(guildId),
    api.getDenyChannel(guildId),
    api.getConsiderChannel(guildId),
    api.getImplementChannel(guildId),
    api.getSuggestButtonChannel(guildId),
    api.getMinLength(guildId),
    api.getMaxLength(guildId),
    api.getAnonymous(guildId),
    api.getVoteColor(guildId),
    api.getSuggestThreadsType(guildId),
    api.getEmoteMode(guildId),
    api.getSuggestButtonColor(guildId),
    api.getEmoteButtonStyle(guildId, 1),
    api.getEmoteButtonStyle(guildId, 2),
    api.getEmoteButtonStyle(guildId, 3),
    api.getEmoteButtonStyle(guildId, 4),
    api.getEmoteButtonStyle(guildId, 5),
    api.getSuggestEmotes(guildId),
    api.getSuggestButtonEmote(guildId),
    api.getSuggestButtonLabel(guildId),
    api.getSuggestionMessage(guildId),
    api.getAcceptMessage(guildId),
    api.getDenyMessage(guildId),
    api.getConsiderMessage(guildId),
    api.getImplementMessage(guildId),
    api.getSuggestButtonMessage(guildId),
    api.getArchiveOnAccept(guildId),
    api.getArchiveOnDeny(guildId),
    api.getArchiveOnConsider(guildId),
    api.getArchiveOnImplement(guildId)
  ]);

  return {
    suggestChannel: id(suggestChannel),
    acceptChannel: id(acceptChannel),
    denyChannel: id(denyChannel),
    considerChannel: id(considerChannel),
    implementChannel: id(implementChannel),
    buttonChannel: id(buttonChannel),
    minLength: num(minLength, 0),
    maxLength: num(maxLength, MAX_LENGTH),
    anonymous: unwrap(anonymous) === true,
    voteColor: num(voteColor, 0),
    threadType: num(threadType, 0),
    emoteMode: num(emoteMode, 0),
    buttonColor: num(buttonColor, 1),
    style1: num(style1, 1),
    style2: num(style2, 1),
    style3: num(style3, 1),
    style4: num(style4, 1),
    style5: num(style5, 1),
    suggestEmotes: text(suggestEmotes)
      .split(",")
      .map(emote => emote.trim())
      .filter(Boolean),
    buttonEmote: text(buttonEmote) || null,
    buttonLabel: text(buttonLabel),
    suggestionMessage: text(suggestionMessage),
    acceptMessage: text(acceptMessage),
    denyMessage: text(denyMessage),
    considerMessage: text(considerMessage),
    implementMessage: text(implementMessage),
    buttonMessage: text(buttonMessage),
    archiveOnAccept: unwrap(archiveOnAccept) === true,
    archiveOnDeny: unwrap(archiveOnDeny) === true,
    archiveOnConsider: unwrap(archiveOnConsider) === true,
    archiveOnImplement: unwrap(archiveOnImplement) === true
  };
}

export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
