import { getLocale } from "$lib/i18n";

export type SiteStats = { commands: number; modules: number; servers: number };

/** Used when the bot API is unreachable; the home page otherwise loads live numbers from BotStatus. */
export const siteStats: SiteStats = {
  commands: 1082,
  modules: 34,
  servers: 11600,
};

export function siteStatParams(stats: SiteStats = siteStats): { commands: string; modules: string; servers: string } {
  const nf = new Intl.NumberFormat(getLocale());
  return {
    commands: nf.format(stats.commands),
    modules: nf.format(stats.modules),
    servers: nf.format(stats.servers),
  };
}
