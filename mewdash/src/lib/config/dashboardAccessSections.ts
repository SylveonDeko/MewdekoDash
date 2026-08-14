// lib/config/dashboardAccessSections.ts
import { allDashboardFeatures, type NavigationItem } from "./navigationItems";

/**
 * Maps each dashboard nav item's href to the bot API controller name(s) (the "section" the
 * DashboardAccessEnforcementFilter checks) that back it. Used to present restricted access grants
 * grouped by dashboard feature instead of raw controller names.
 *
 * Items with no entry here (e.g. "Performance", which is global bot infrastructure rather than
 * per-guild data) are not grantable through the access picker.
 */
const sectionsByHref: Record<string, string[]> = {
  "/dashboard/administration": ["Administration", "Protection"],
  "/dashboard/afk": ["Afk"],
  "/dashboard/auditlog": ["AuditLog"],
  "/dashboard/birthday": ["Birthday"],
  "/dashboard/chatsaver": ["Chat"],
  "/dashboard/confessions": ["Confessions"],
  "/dashboard/counting": ["Counting"],
  "/dashboard/currency": ["Currency"],
  "/dashboard/minecraft": ["Minecraft"],
  "/dashboard/statchannels": ["StatChannel"],
  "/dashboard/customvoice": ["CustomVoice"],
  "/dashboard/embedbuilder": ["Embeds"],
  "/dashboard/feeds": ["Feeds"],
  "/dashboard/forms": ["Forms"],
  "/dashboard/giveaways": ["Giveaways"],
  "/dashboard/multigreets": ["MultiGreet"],
  "/dashboard/highlights": ["Highlights"],
  "/dashboard/invites": ["InviteTracking"],
  "/dashboard/logging": ["Logging"],
  "/dashboard/messagestats": ["MessageCount"],
  "/dashboard/moderation": ["Moderation", "Protection"],
  "/dashboard/music": ["Music"],
  "/dashboard/patreon": ["Patreon"],
  "/dashboard/repeaters": ["Repeaters"],
  "/dashboard/reputation": ["Reputation"],
  "/dashboard/rolegreets": ["RoleGreet"],
  "/dashboard/rolestates": ["RoleStates"],
  "/dashboard/settings": ["Guild"],
  "/dashboard/starboard": ["Starboard"],
  "/dashboard/statusroles": ["StatusRoles"],
  "/dashboard/streams": ["StreamNotifications"],
  "/dashboard/twitch": ["Twitch"],
  "/dashboard/suggestions": ["Suggestions"],
  "/dashboard/tickets": ["Ticket"],
  "/dashboard/todo": ["Todo"],
  "/dashboard/chat-triggers": ["ChatTriggers"],
  "/dashboard/votes": ["Votes"],
  "/dashboard/xp": ["Xp"],
};

export interface DashboardAccessSectionGroup {
  label: string;
  icon: string;
  category: string;
  /** Bot API controller name(s) this dashboard feature depends on. */
  sections: string[];
}

/**
 * The grantable dashboard sections, one entry per nav feature that maps to at least one bot API
 * controller. Grouped/ordered the same way the sidebar is.
 */
export const dashboardAccessSectionGroups: DashboardAccessSectionGroup[] = allDashboardFeatures
  .filter((item: NavigationItem) => !item.ownerOnly && sectionsByHref[item.href]?.length)
  .map((item: NavigationItem) => ({
    label: item.label,
    icon: item.icon,
    category: item.category,
    sections: sectionsByHref[item.href],
  }));
