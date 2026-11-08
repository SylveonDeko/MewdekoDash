import { m } from "$lib/i18n";
import type { MinecraftServer, MinecraftStatus } from "$lib/api/index.ts";

export type Named = { id: string; name: string };

export type Notify = (message: string, type?: "success" | "error") => void;

export type Placeholder = { category: string; name: string; description: string };

export const TABS = ["servers", "history", "console"] as const;
export type TabId = (typeof TABS)[number];

export const DEFAULT_RCON_PORT = 25575;

export const EMPTY_STATUS: MinecraftStatus = {
  isOnline: false,
  motd: "",
  playersOnline: 0,
  playersMax: 0,
  playerList: [],
  playerUuids: {},
  version: "",
  latency: 0,
  map: null,
  gameMode: null,
  software: null,
  plugins: [],
  isQueryResponse: false
};

export function serverTypeLabel(type: number): string {
  if (type === 1) return m.minecraft.serverTypeBedrock();
  if (type === 2) return m.minecraft.serverTypeGeyser();
  return m.minecraft.serverTypeJava();
}

export function avatarUrl(player: string, size = 32): string {
  return `https://minotar.net/avatar/${encodeURIComponent(player)}/${size}`;
}

export const FALLBACK_AVATAR = "https://minotar.net/avatar/MHF_Steve/48";

export function channelIdOrNone(value: string | null): bigint {
  return value ? BigInt(value) : BigInt(0);
}

export function parseTemplates(raw: string | null): Record<string, string> {
  try {
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function errorText(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function serverPlaceholders(): Placeholder[] {
  const server = m.placeholders.categoryServer();
  const players = m.common.players();
  const query = m.minecraft.placeholderCategoryQuery();
  return [
    { category: server, name: "%mc.server.name%", description: m.placeholders.mcServerName() },
    { category: server, name: "%mc.server.address%", description: m.placeholders.mcServerAddress() },
    { category: server, name: "%mc.server.port%", description: m.placeholders.mcServerPort() },
    { category: server, name: "%mc.online%", description: m.placeholders.mcOnline() },
    { category: server, name: "%mc.version%", description: m.placeholders.mcVersion() },
    { category: server, name: "%mc.latency%", description: m.placeholders.mcLatency() },
    { category: server, name: "%mc.motd%", description: m.placeholders.mcMotd() },
    { category: server, name: "%mc.favicon%", description: m.placeholders.mcFavicon() },
    { category: server, name: "%mc.geyser%", description: m.placeholders.mcGeyser() },
    { category: players, name: "%mc.players.online%", description: m.placeholders.mcPlayersOnline() },
    { category: players, name: "%mc.players.max%", description: m.placeholders.mcPlayersMax() },
    { category: players, name: "%mc.player.list%", description: m.placeholders.mcPlayerList() },
    { category: query, name: "%mc.map%", description: m.placeholders.mcMap() },
    { category: query, name: "%mc.gamemode%", description: m.placeholders.mcGamemode() },
    { category: query, name: "%mc.software%", description: m.placeholders.mcSoftware() },
    { category: query, name: "%mc.plugins%", description: m.placeholders.mcPlugins() },
    { category: query, name: "%mc.query%", description: m.placeholders.mcQuery() }
  ];
}

export function eventPlaceholders(extra: Placeholder[]): Placeholder[] {
  return [...serverPlaceholders(), ...extra];
}

const MC_COLORS: Record<string, string> = {
  "0": "#000000", "1": "#0000AA", "2": "#00AA00", "3": "#00AAAA",
  "4": "#AA0000", "5": "#AA00AA", "6": "#FFAA00", "7": "#AAAAAA",
  "8": "#555555", "9": "#5555FF", a: "#55FF55", b: "#55FFFF",
  c: "#FF5555", d: "#FF55FF", e: "#FFFF55", f: "#FFFFFF"
};

function escapeChar(char: string): string {
  return char === "<" ? "&lt;" : char === ">" ? "&gt;" : char === "&" ? "&amp;" : char === '"' ? "&quot;" : char;
}

/** Renders text with section-sign colour codes to HTML spans. */
export function mcToHtml(raw: string): string {
  let result = "";
  let color = "#AAAAAA";
  let bold = false;
  let italic = false;
  let underline = false;
  let strike = false;
  const chars = [...raw];
  let i = 0;
  while (i < chars.length) {
    if (chars[i] === "§" && i + 1 < chars.length) {
      const code = chars[i + 1].toLowerCase();
      if (code === "x" && i + 13 < chars.length) {
        let hex = "#";
        for (let j = 0; j < 6; j++) hex += chars[i + 2 + j * 2 + 1] ?? "";
        if (/^#[0-9a-f]{6}$/i.test(hex)) color = hex;
        i += 14;
        continue;
      }
      if (MC_COLORS[code]) color = MC_COLORS[code];
      else if (code === "l") bold = true;
      else if (code === "o") italic = true;
      else if (code === "n") underline = true;
      else if (code === "m") strike = true;
      else if (code === "r") {
        color = "#AAAAAA";
        bold = italic = underline = strike = false;
      }
      i += 2;
      continue;
    }
    const decorations = [underline ? "underline" : "", strike ? "line-through" : ""].filter(Boolean).join(" ");
    let style = `color:${color};`;
    if (bold) style += "font-weight:bold;";
    if (italic) style += "font-style:italic;";
    if (decorations) style += `text-decoration:${decorations};`;
    result += `<span style="${style}">${escapeChar(chars[i])}</span>`;
    i++;
  }
  return result;
}

export function replaceServer(list: MinecraftServer[], next: MinecraftServer): MinecraftServer[] {
  return list.map(server => (server.name === next.name ? next : server));
}
