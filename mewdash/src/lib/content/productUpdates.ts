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
    id: "bridges",
    label: "New page",
    title: "Bridge Channels With Fluxer",
    summary: "Messages relay between a channel here and a Fluxer channel.",
    details: [
      "Link a Fluxer community once to connect any of its channels.",
      "Each bridge can run one way or skip certain roles."
    ],
    href: "/dashboard/bridges",
    action: "Bridge a channel"
  },
  {
    id: "join-role-timeout",
    label: "New setting",
    title: "Remove Members Who Never Verify",
    summary: "Kick members who still lack a verified role after a set time.",
    details: [
      "Ban, give a role or time them out instead.",
      "Warn them by DM first and log each action."
    ],
    href: "/dashboard/administration",
    action: "Set it up"
  },
  {
    id: "import-from-other-bots",
    label: "New page",
    title: "Bring Your Levels Over From Other Bots",
    summary: "Import XP, levels and balances from the bot you used before.",
    details: [
      "Works with MEE6, Lurkr, Amari, Tatsu and more, or any CSV.",
      "Preview before anything is written, and undo within a day."
    ],
    href: "/dashboard/import",
    action: "Import your data"
  },
  {
    id: "nine-tailed-cat",
    label: "New look",
    title: "Meet The Nine-Tailed Cat",
    summary: "Mewdeko has a mascot now, with a tool on every tail.",
    details: [
      "The home page tours the bot one tail at a time.",
      "Her fur takes on your server's colors."
    ],
    href: "/",
    action: "See the home page"
  },
  {
    id: "achievements",
    label: "New page",
    title: "Achievements For Everything Your Members Do",
    summary: "Members unlock achievements and wear them as badges.",
    details: [
      "Make your own with custom icons and rewards.",
      "Unlocks can give XP if you turn it on."
    ],
    href: "/dashboard/achievements",
    action: "Set up achievements"
  },
  {
    id: "activity-stats",
    label: "New page",
    title: "Activity Stats For The Whole Server",
    summary: "Messages, voice time, games and growth over up to ninety days.",
    details: [
      "Rank members and channels, then export to CSV.",
      "Members can opt out with one command."
    ],
    href: "/dashboard/serverstats",
    action: "Open activity stats"
  },
  {
    id: "stat-roles",
    label: "New page",
    title: "Roles That Follow Activity",
    summary: "Roles earned by recent activity and removed when it stops.",
    details: [
      "Base them on messages, voice time, games, invites or tenure.",
      "Preview who gains and loses before a rule runs."
    ],
    href: "/dashboard/statroles",
    action: "Create a stat role"
  },
  {
    id: "invite-tracking-overhaul",
    label: "New in invites",
    title: "Invite Tracking, Rebuilt",
    summary: "Every join is tied to an invite, and you can see who stays.",
    details: [
      "Fake invites are caught and left uncounted.",
      "Label codes and give members personal invite links."
    ],
    href: "/dashboard/invites",
    action: "Open invites"
  },
  {
    id: "live-boards",
    label: "New page",
    title: "Boards That Keep Themselves Current",
    summary: "Pin a leaderboard or chart and the bot keeps it updated.",
    details: [
      "Boards refresh as often as every five minutes.",
      "Schedule a recurring server report."
    ],
    href: "/dashboard/liveboards",
    action: "Add a live board"
  },
  {
    id: "wiki",
    label: "New everywhere",
    title: "A Wiki For Every Feature",
    summary: "Every feature has a guide, and each page opens its own.",
    details: [
      "Press How it works on any page to read it beside your settings.",
      "Search the wiki by title or tag."
    ],
    href: "/wiki",
    action: "Browse the wiki"
  },
  {
    id: "utilities-page",
    label: "New page",
    title: "Utilities, All In One Place",
    summary: "Command-only features now share one page.",
    details: [
      "Aliases, quotes, auto publishing and a streaming role.",
      "The AI assistant, with your choice of provider and model."
    ],
    href: "/dashboard/utility",
    action: "Open utilities"
  },
  {
    id: "polls-page",
    label: "New page",
    title: "Polls From The Dashboard",
    summary: "Create and schedule polls without a command.",
    details: [
      "Anonymous and role-limited polls with up to twenty five options.",
      "Save a poll as a template to reuse."
    ],
    href: "/dashboard/polls",
    action: "Open polls"
  },
  {
    id: "message-filters-page",
    label: "New page",
    title: "Message Filters",
    summary: "Message filters have their own page now.",
    details: [
      "Turn each filter on everywhere or in chosen channels.",
      "Keep a word list and an instant ban list."
    ],
    href: "/dashboard/filter",
    action: "Open message filters"
  },
  {
    id: "moderation-warnings",
    label: "New in moderation",
    title: "Warnings And The Punishment Ladder",
    summary: "Warn members and set what happens at each warning count.",
    details: [
      "Forgive one warning or all of them.",
      "Mute, kick, ban or change roles at each step."
    ],
    href: "/dashboard/moderation?tab=punishments",
    action: "Set up punishments"
  },
  {
    id: "tickets-tab",
    label: "New in tickets",
    title: "Work Tickets Without Opening Discord",
    summary: "Browse and act on every ticket.",
    details: [
      "Search by creator, claimer or tag.",
      "Claim, prioritise, close and leave staff notes."
    ],
    href: "/dashboard/tickets?tab=tickets",
    action: "Open tickets"
  },
  {
    id: "forms-builder",
    label: "New in forms",
    title: "A Cleaner Form Builder",
    summary: "Creating and editing a form now work the same way.",
    details: [
      "Give each page its own heading and intro.",
      "Ban appeal forms get their own limits and cooldowns."
    ],
    href: "/dashboard/forms",
    action: "Open forms"
  },
  {
    id: "command-permissions",
    label: "New in administration",
    title: "Command Permissions You Can Read",
    summary: "Permission rules use pickers and read as sentences.",
    details: [
      "Allow or deny commands for a role, channel, category or user.",
      "Recovery keys let an owner regain a lost server."
    ],
    href: "/dashboard/administration?tab=automation",
    action: "Open permissions"
  },
  {
    id: "counting-management",
    label: "New in counting",
    title: "Counting Channel Management",
    summary: "Manage counting channels from the dashboard.",
    details: [
      "Ban members from counting and restore from a save point.",
      "Set milestones with your own announcement."
    ],
    href: "/dashboard/counting?tab=management",
    action: "Open counting"
  },
  {
    id: "dashboard-quality-of-life",
    label: "Across the dashboard",
    title: "Smaller Things You Asked For",
    summary: "Additions to pages that already existed.",
    details: [
      "Adjust a member's XP straight from the leaderboard.",
      "Shuffle the music queue and toggle audio filters."
    ],
    href: "/dashboard/music",
    action: "Open the player"
  },
  {
    id: "chat-triggers-conditions",
    label: "New in chat triggers",
    title: "Triggers That Know When To Stay Quiet",
    summary: "Triggers check conditions first and tell you why they didn't fire.",
    details: [
      "Use a member's level or balance in responses.",
      "Test a trigger against a sample message."
    ],
    href: "/dashboard/chat-triggers",
    action: "Open chat triggers"
  },
  {
    id: "stat-channel-counters",
    label: "New in stat channels",
    title: "Counters That Keep Up",
    summary: "Nearly sixty counters, updating as often as every minute.",
    details: [
      "Pick how numbers read, from compact to roman numerals.",
      "Recreate channels instead of renaming them to skip rate limits."
    ],
    href: "/dashboard/statchannels",
    action: "Open stat channels"
  },
  {
    id: "ban-purge",
    label: "New in moderation",
    title: "Ban Purge Rules",
    summary: "Set once how much history a ban clears.",
    details: [
      "Override the default per channel.",
      "Give automated bans their own purge."
    ],
    href: "/dashboard/moderation?tab=banpurge",
    action: "Set up ban purge"
  },
  {
    id: "channel-access",
    label: "New in server setup",
    title: "Vote People Into Locked Channels",
    summary: "Members apply to a locked channel and the people inside vote.",
    details: [
      "Ask applicants up to five questions.",
      "Hide names until the vote ends."
    ],
    href: "/dashboard/channel-access",
    action: "Set up channel access"
  },
  {
    id: "currency-economy",
    label: "New in currency",
    title: "A Real Economy",
    summary: "Currency has a shop and more ways to earn.",
    details: [
      "Members can work and bank money away from robbers.",
      "Tune payouts and see which games pay too much."
    ],
    href: "/dashboard/currency",
    action: "Open economy settings"
  },
  {
    id: "music-link-conversion",
    label: "New in music",
    title: "Music Link Conversion",
    summary: "Post a music link and get it on every other platform.",
    details: [
      "Works with Spotify, Apple Music, YouTube, Tidal and more.",
      "Turn it on in any channel."
    ],
    href: "/dashboard/music",
    action: "Set up music links"
  },
  {
    id: "image-hash-bans",
    label: "New in protection",
    title: "Image Hash Bans",
    summary: "Block known scam images before they spread.",
    details: [
      "Use the shared list or add your own images.",
      "Remove the post, warn, mute or ban."
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
