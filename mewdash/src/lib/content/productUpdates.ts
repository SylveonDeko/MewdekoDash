export type ProductUpdate = {
  id: string;
  label: string;
  title: string;
  summary: string;
  details: string[];
  href: string;
  action: string;
};

// Keep the newest public update first. The landing page intentionally features one item at a time.
export const productUpdates: ProductUpdate[] = [
  {
    id: "chat-triggers-conditions",
    label: "New in chat triggers",
    title: "Triggers That Know When To Stay Quiet",
    summary: "Chat triggers can now read the rest of the bot, decide for themselves whether to fire, and tell you why when they don't.",
    details: [
      "Pull a member's level, balance, reputation or message count straight into a response, and keep your own counters that responses can read and add to.",
      "Gate a trigger on a cooldown, an XP level, a price, active hours, an expiry date or a use limit, and let one fire on a level up, a join, a boost or a giveaway win instead of a message.",
      "Test a trigger against a sample message before anyone sees it. If it would not fire, the dashboard names the exact rule stopping it."
    ],
    href: "/dashboard/chat-triggers",
    action: "Open chat triggers"
  },
  {
    id: "stat-channel-counters",
    label: "New in stat channels",
    title: "Counters That Keep Up",
    summary: "Stat channels can count almost anything now, and you pick how each one updates so Discord's rate limits stop holding them back.",
    details: [
      "Nearly sixty counters, including presence and join counts, boost tiers and emoji slots, Twitch viewers, subs and chat counters, Minecraft players, open tickets, giveaways and XP.",
      "Choose how the number reads: grouped, compact, zero padded, ordinal, percent, progress bar, emoji digits or roman numerals.",
      "Pick whether a channel updates by renaming or by recreating itself. Recreating sidesteps the two renames per ten minutes cap, so a live counter can refresh every minute."
    ],
    href: "/dashboard/statchannels",
    action: "Open stat channels"
  },
  {
    id: "ban-purge",
    label: "New in moderation",
    title: "Ban Purge Rules",
    summary: "Decide up front how much of a banned member's message history gets cleared, instead of choosing it again on every ban.",
    details: [
      "Set a default purge window for the whole server, from nothing at all up to seven days.",
      "Override it per category or per channel when one corner of the server needs a heavier clean.",
      "Give each moderation action its own purge, so an automated ban and a manual one can behave differently."
    ],
    href: "/dashboard/moderation?tab=banpurge",
    action: "Set up ban purge"
  },
  {
    id: "channel-access",
    label: "New in server setup",
    title: "Vote People Into Locked Channels",
    summary: "Members apply for a private channel, and the people already inside vote on whether to let them in.",
    details: [
      "Post an apply button anywhere and ask up to five questions on the application form.",
      "Approve at a threshold of votes, hand out a role or add the applicant to the channel directly, and set a deadline for the vote.",
      "Hide the applicant's name until the vote closes, require a minimum account age, and block repeat applicants."
    ],
    href: "/dashboard/channel-access",
    action: "Set up channel access"
  },
  {
    id: "currency-economy",
    label: "New in currency",
    title: "A Real Economy",
    summary: "Currency now has somewhere to go, ways to earn it, and numbers telling you whether any of it is working.",
    details: [
      "Open a shop selling roles, collectibles, or one-off rewards, and give balances a purpose beyond the leaderboard.",
      "Members can work, commit crimes, bank their savings out of reach of robbery, and pay each other.",
      "Tune every payout rate, cooldown and bet limit yourself, then check the analytics to see which games are quietly printing money."
    ],
    href: "/dashboard/currency",
    action: "Open economy settings"
  },
  {
    id: "music-link-conversion",
    label: "New in music",
    title: "Music Link Conversion",
    summary: "Drop an Apple Music, Spotify, or YouTube link and get every other platform back automatically.",
    details: [
      "Works with Apple Music, Spotify, YouTube, YouTube Music, Deezer, Tidal, and more.",
      "Auto-searches Spotify and YouTube Music when a link doesn't already have a match.",
      "Turn it on for any channel, not just the music channel."
    ],
    href: "/dashboard/music",
    action: "Set up music links"
  },
  {
    id: "image-hash-bans",
    label: "New in protection",
    title: "Image Hash Bans",
    summary: "Block known scam images before they spread through your server.",
    details: [
      "Turn on the maintained preset list for common scam images.",
      "Add your own images when a specific scam targets your community.",
      "Choose whether Mewdeko removes the post, warns, mutes, or bans."
    ],
    href: "/dashboard/administration?tab=protection",
    action: "Open protection settings"
  }
];

export const latestProductUpdate = productUpdates[0];

/** Key the id of the newest update a viewer has acknowledged is stored under. */
export const lastSeenUpdateKey = "product-updates:last-seen";

/**
 * The updates published since the one a viewer last acknowledged, newest first.
 *
 * A viewer who has never acknowledged anything sees nothing: someone opening the dashboard for
 * the first time should not be met with the entire changelog. The layout records the newest id
 * for them instead, so they start receiving updates from their next visit onwards.
 */
export function unseenProductUpdates(lastSeenId: string | null): ProductUpdate[] {
  if (!lastSeenId) return [];

  const index = productUpdates.findIndex((update) => update.id === lastSeenId);

  // An unknown id means the stored update was removed, so treat only the newest as unseen
  // rather than replaying everything.
  if (index === -1) return productUpdates.slice(0, 1);

  return productUpdates.slice(0, index);
}
