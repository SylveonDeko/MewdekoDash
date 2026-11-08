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
    id: "welcome-cards",
    label: "New setting",
    title: "Cards on welcome messages",
    summary: "Each welcome or goodbye message can have its own card, shown in the embed or attached.",
    details: [
      "Design the card right where you write the message.",
      "Role greets and boost messages can have cards too."
    ],
    href: "/dashboard/multigreets",
    action: "Add a card"
  },
  {
    id: "card-designs",
    label: "New feature",
    title: "Card designs members can wear",
    summary: "Sell rank and achievement card designs in the shop, or let members make their own.",
    details: [
      "Member designs wait for staff approval before anyone sees them.",
      "A design can also unlock at a level or with a role."
    ],
    href: "/dashboard/currency?tab=designs",
    action: "Open designs"
  },
  {
    id: "currency-setup",
    label: "New setting",
    title: "Guided currency setup",
    summary: "A short setup picks your coin emoji and daily reward.",
    details: [
      "Start from a preset that matches how competitive you want it.",
      "It opens the first time you visit Currency."
    ],
    href: "/dashboard/currency?tab=setup",
    action: "Start the setup"
  },
  {
    id: "xp-categories",
    label: "New setting",
    title: "XP multipliers for whole categories",
    summary: "Boost or reduce XP across every channel in a category at once.",
    details: [
      "A channel's own multiplier still wins over its category.",
      "Threads follow the channel they belong to."
    ],
    href: "/dashboard/xp",
    action: "Set a multiplier"
  },
  {
    id: "server-tools",
    label: "New page",
    title: "Server backups and channel tools",
    summary: "Back up your server and run channel actions straight from the dashboard.",
    details: [
      "Save templates and apply them to any server you manage.",
      "Lock, hide, clone, sync or purge many channels at once."
    ],
    href: "/dashboard/administration?tab=backups",
    action: "Open server tools"
  },
  {
    id: "bridges",
    label: "New page",
    title: "Bridge channels with Fluxer",
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
    title: "Remove members who never verify",
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
    title: "Bring your levels over from other bots",
    summary: "Import member levels and balances from the bot you used before.",
    details: [
      "Works with the popular leveling bots, or with any CSV file.",
      "Preview before anything is written, and undo within a day."
    ],
    href: "/dashboard/import",
    action: "Import your data"
  },
  {
    id: "nine-tailed-cat",
    label: "New look",
    title: "Meet the nine-tailed cat",
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
    title: "Achievements for everything your members do",
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
    title: "Activity stats for the whole server",
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
    title: "Roles that follow activity",
    summary: "Roles earned by recent activity and removed when it stops.",
    details: [
      "Base them on messages, voice time, games, invites or tenure.",
      "Preview who gains and loses before a rule runs."
    ],
    href: "/dashboard/roles?tab=stats",
    action: "Create a stat role"
  },
  {
    id: "invite-tracking-overhaul",
    label: "New in invites",
    title: "Invite tracking, rebuilt",
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
    title: "Boards that keep themselves current",
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
    title: "A wiki for every feature",
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
    title: "Utilities, all in one place",
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
    title: "Polls from the dashboard",
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
    title: "Message filters",
    summary: "Message filters have their own page now.",
    details: [
      "Turn each filter on everywhere or in chosen channels.",
      "Keep a word list and an instant ban list."
    ],
    href: "/dashboard/automod?tab=filters",
    action: "Open message filters"
  },
  {
    id: "moderation-warnings",
    label: "New in moderation",
    title: "Warnings and the punishment ladder",
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
    title: "Work tickets without opening Discord",
    summary: "Browse and act on every ticket.",
    details: [
      "Search by who opened or claimed a ticket.",
      "Claim, prioritise, close and leave staff notes."
    ],
    href: "/dashboard/tickets?tab=tickets",
    action: "Open tickets"
  },
  {
    id: "forms-builder",
    label: "New in forms",
    title: "A cleaner form builder",
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
    title: "Command permissions you can read",
    summary: "Permission rules use pickers and read as sentences.",
    details: [
      "Allow or deny commands for a role, channel, category or user.",
      "Recovery keys let an owner regain a lost server."
    ],
    href: "/dashboard/administration?tab=commands",
    action: "Open permissions"
  },
  {
    id: "counting-management",
    label: "New in counting",
    title: "Counting channel management",
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
    title: "Smaller things you asked for",
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
    title: "Triggers that know when to stay quiet",
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
    title: "Counters that keep up",
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
    title: "Ban purge rules",
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
    title: "Vote people into locked channels",
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
    title: "A real economy",
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
    title: "Music link conversion",
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
    title: "Image hash bans",
    summary: "Block known scam images before they spread.",
    details: [
      "Use the shared list or add your own images.",
      "Remove the post, warn, mute or ban."
    ],
    href: "/dashboard/automod?tab=protection",
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
