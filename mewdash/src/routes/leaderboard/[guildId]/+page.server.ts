// routes/leaderboard/[guildId]/+page.server.ts
import type { PageServerLoad } from "./$types";
import { botApiGet, findInstanceWithGuild } from "$lib/server/instances";

interface PreviewEntry {
  rank: number;
  username: string;
  level: number;
}

/** Loads the guild and its top ten for the Discord link preview; every field is null when that fails. */
export const load: PageServerLoad = async ({ params }) => {
  const empty = { preview: { guildName: null, guildIcon: null, top: null as PreviewEntry[] | null } };
  if (!/^\d{1,20}$/.test(params.guildId)) return empty;

  const found = await findInstanceWithGuild(params.guildId);
  if (!found) return empty;

  const board = await botApiGet<Array<{ rank: number; username: string; level: number }>>(
    found.base,
    `xp/${params.guildId}/leaderboard?page=1&pageSize=10`,
  );

  return {
    preview: {
      guildName: found.guild.guildName ?? null,
      guildIcon: found.guild.iconUrl ?? null,
      top: Array.isArray(board)
        ? board.map((e) => ({ rank: Number(e.rank), username: String(e.username ?? ""), level: Number(e.level) }))
        : null,
    },
  };
};
