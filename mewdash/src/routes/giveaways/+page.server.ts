// routes/giveaways/+page.server.ts
import type { PageServerLoad } from "./$types";
import type { DiscordUser } from "$lib/types/discord.ts";
import { botApiGet, findInstanceWithGuild } from "$lib/server/instances";

interface GiveawayPreview {
  prize: string;
  winners: number;
  endsAt: string;
  ended: boolean;
  guildName: string | null;
  guildIcon: string | null;
}

/** Loads the giveaway named in the query for the Discord link preview, or null when that fails. */
async function loadPreview(url: URL): Promise<GiveawayPreview | null> {
  const guildId = url.searchParams.get("guildId") ?? "";
  const giveawayId = url.searchParams.get("giveawayId") ?? "";
  if (!/^\d{1,20}$/.test(guildId) || !/^\d{1,10}$/.test(giveawayId)) return null;

  const found = await findInstanceWithGuild(guildId);
  if (!found) return null;

  const giveaway = await botApiGet<{
    serverId: string | number;
    item: string;
    winners: number;
    when: string;
    ended: number;
  }>(found.base, `giveaways/${giveawayId}`);
  if (!giveaway || String(giveaway.serverId) !== guildId) return null;

  return {
    prize: String(giveaway.item ?? "").slice(0, 300),
    winners: Number(giveaway.winners),
    endsAt: giveaway.when,
    ended: Number(giveaway.ended) === 1 || new Date(giveaway.when).getTime() <= Date.now(),
    guildName: found.guild.guildName ?? null,
    guildIcon: found.guild.iconUrl ?? null,
  };
}

export const load: PageServerLoad = async ({
  locals,
  url,
}): Promise<{ user?: DiscordUser; preview: GiveawayPreview | null }> => {
  const preview = await loadPreview(url);
  if (!locals.user) return { preview };
  return { user: locals.user, preview };
};
