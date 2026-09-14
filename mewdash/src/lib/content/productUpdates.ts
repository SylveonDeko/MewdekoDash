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
    id: "wiki",
    label: "New everywhere",
    title: "A Wiki For Every Feature",
    summary: "Every module now has a plain English guide, and each dashboard page can open its own guide in a side panel without leaving the page.",
    details: [
      "Fifty one articles covering what a feature does, why you would want it, every dashboard tab and field, and a full command table with permissions.",
      "Press the How it works button on any dashboard page to read the matching guide beside your settings.",
      "Search the whole wiki by title, category or tag, and jump straight from an article into the right page for your server."
    ],
    href: "/wiki",
    action: "Browse the wiki"
  },
  {
    id: "utilities-page",
    label: "New page",
    title: "Utilities, All In One Place",
    summary: "Seven smaller features that only lived in commands now share one dashboard page.",
    details: [
      "Command aliases, server quotes with search and inline editing, and auto publishing for announcement channels with user and word blacklists.",
      "A role that follows members while they stream, an NSFW tag blocklist, and a role monitor that punishes anyone who hands out a blacklisted role or permission.",
      "The AI assistant: pick OpenAI, Claude or Groq, choose a model from a live list, write a system prompt, and switch on web search."
    ],
    href: "/dashboard/utility",
    action: "Open utilities"
  },
  {
    id: "polls-page",
    label: "New page",
    title: "Polls From The Dashboard",
    summary: "Create, schedule, template and analyse polls without touching a command.",
    details: [
      "Single choice, multiple choice, yes or no, anonymous or role restricted polls with up to twenty five options, a duration, and toggles for vote changes and live results.",
      "Schedule a poll for later, or save the form as a template to reuse, then close or delete polls from the same list with their live results.",
      "Thirty day analytics: polls created, votes cast, average votes per poll, the most used poll type, and a per day chart."
    ],
    href: "/dashboard/polls",
    action: "Open polls"
  },
  {
    id: "message-filters-page",
    label: "New page",
    title: "Message Filters",
    summary: "Word, invite and link filtering now has a home on the dashboard instead of a pile of commands.",
    details: [
      "Toggle the word, invite and link filters for the whole server, or turn any of them on for just the channels you pick.",
      "Keep a filtered word list and a separate auto ban list whose posters are removed on sight.",
      "Choose whether a filtered word or invite also warns the member on top of deleting the message."
    ],
    href: "/dashboard/filter",
    action: "Open message filters"
  },
  {
    id: "moderation-warnings",
    label: "New in moderation",
    title: "Warnings And The Punishment Ladder",
    summary: "Warn members, forgive them, and decide what happens at each warning count, all from the moderation page.",
    details: [
      "Issue a warning by user ID with a reason and see straight away whether a ladder punishment kicked in.",
      "Forgive one warning, forgive everything for a member at once, or delete a record, with search across users, reasons and moderators.",
      "Build the ladder on the new Punishments tab: mute, chat or voice mute, timeout, kick, softban, ban, add a role or strip every role, with durations for the timed ones."
    ],
    href: "/dashboard/moderation?tab=punishments",
    action: "Set up punishments"
  },
  {
    id: "tickets-tab",
    label: "New in tickets",
    title: "Work Tickets Without Opening Discord",
    summary: "The tickets page can now browse and act on every ticket, not just configure panels.",
    details: [
      "Filter by open, closed or archived and search by ticket, creator, channel, claimer or tag, sorted by last activity.",
      "Claim or release a ticket as yourself, set its priority, and add or remove tags.",
      "Close with a reason, archive, and leave staff notes that the whole team can see."
    ],
    href: "/dashboard/tickets?tab=tickets",
    action: "Open tickets"
  },
  {
    id: "forms-builder",
    label: "New in forms",
    title: "A Cleaner Form Builder",
    summary: "Pages, settings and appeals now behave the same whether you are creating a form or editing one.",
    details: [
      "Add, reorder and delete pages with their questions, and give each page its own heading and intro.",
      "Settings are grouped by who can submit, when the form is open, what happens on submit, and how reviews work, including reviewer roles and custom approve and reject emotes.",
      "Ban appeal forms get their own rules: appeal limits, cooldowns, a waiting period after the ban, and the invite sent on approval. Leaving with unsaved edits now asks first."
    ],
    href: "/dashboard/forms",
    action: "Open forms"
  },
  {
    id: "command-permissions",
    label: "New in administration",
    title: "Command Permissions You Can Read",
    summary: "Permission rules are built with pickers and shown as sentences instead of raw entries.",
    details: [
      "Allow or deny a whole module or a single command for the server, a role, a channel, a category or one user.",
      "Rules read like Deny command for role, with the protected default rule marked and up and down arrows for ordering since the first match wins.",
      "Server recovery lives on the Advanced tab: store a recovery key and a two factor key so an owner can regain control if their account is lost."
    ],
    href: "/dashboard/administration?tab=automation",
    action: "Open permissions"
  },
  {
    id: "counting-management",
    label: "New in counting",
    title: "Counting Channel Management",
    summary: "Bans, save points and milestones for counting channels are now on the dashboard.",
    details: [
      "Ban a member from a counting channel for a set time with a reason, and see who banned whom and when in the active bans list.",
      "Restore the count from a save point or delete old ones, and purge a channel's data entirely behind a typed confirmation.",
      "Set custom milestone numbers and write the announcement using user, number and channel placeholders."
    ],
    href: "/dashboard/counting?tab=management",
    action: "Open counting"
  },
  {
    id: "dashboard-quality-of-life",
    label: "Across the dashboard",
    title: "Smaller Things You Asked For",
    summary: "A round of additions to pages that already existed.",
    details: [
      "Adjust, set or reset a member's XP from the leaderboard, read a member's full reputation history, and give a starboard more than one star emote.",
      "Control the live music player: shuffle or clear the queue, switch repeat mode, and toggle eight audio filters. Server settings gained language, timezone, mute role and sniping options.",
      "Edit todo items and delete lists, quick edit repeater intervals and expiry, clean up inactive custom voice channels, disable every log channel at once, and see thirty days of joins and leaves under Invites."
    ],
    href: "/dashboard/music",
    action: "Open the player"
  },
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
