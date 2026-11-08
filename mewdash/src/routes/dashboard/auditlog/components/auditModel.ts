import { m } from "$lib/i18n";
import { AuditAction, type AuditChangeSet, type AuditLogEntry } from "$lib/api/auditlog/models";

export interface ChangeRow {
  label: string;
  before?: string;
  after: string;
}

export type Tone = "primary" | "secondary" | "accent";

export interface AuditFilters {
  action: string | null;
  section: string | null;
  userId: string | null;
  from: string;
  to: string;
  pageSize: number;
}

export const PAGE_SIZES = [25, 50, 100, 200];

/**
 * Turns a raw property name (PascalCase, camelCase or snake_case) into a spaced, capitalised label.
 * @param key The raw name
 */
export function humanizeKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^./, (c) => c.toUpperCase());
}

/**
 * Display names for each bot controller.
 */
export function sectionLabels(): Record<string, string> {
  return {
    Administration: m.features.administrationName(),
    Afk: m.features.afkName(),
    AuditLog: m.features.auditlogName(),
    Birthday: m.features.birthdayName(),
    BotConfig: m.auditlog.sectionBotConfig(),
    BotStatus: m.common.botStatus(),
    Chat: m.features.chatsaverName(),
    ChatTriggers: m.features.chatTriggersName(),
    ClientOperations: m.auditlog.sectionClientOperations(),
    Confessions: m.features.confessionsName(),
    Counting: m.features.countingName(),
    CustomVoice: m.features.customvoiceName(),
    Feeds: m.features.feedsName(),
    Filter: m.common.wordFilter(),
    Forms: m.features.formsName(),
    Giveaways: m.features.giveawaysName(),
    Guild: m.features.categoryServer(),
    GuildConfig: m.common.serverSettings(),
    Highlights: m.features.highlightsName(),
    InstanceManagement: m.auditlog.sectionInstanceManagement(),
    InviteTracking: m.features.invitesName(),
    JoinLeave: m.auditlog.sectionJoinLeave(),
    LastFm: m.auditlog.sectionLastFm(),
    Logging: m.features.loggingName(),
    Me: m.auditlog.sectionMe(),
    MessageCount: m.features.messagestatsName(),
    Minecraft: m.features.minecraftName(),
    MinecraftBridge: m.auditlog.sectionMinecraftBridge(),
    Moderation: m.features.categoryModeration(),
    MultiGreets: m.features.multigreetsName(),
    Music: m.features.musicName(),
    Ownership: m.auditlog.sectionOwnership(),
    Patreon: m.features.patreonName(),
    Performance: m.features.performanceName(),
    Permissions: m.common.permissions(),
    Poll: m.features.pollsName(),
    Protection: m.common.protection(),
    Repeaters: m.features.repeatersName(),
    Reputation: m.features.reputationName(),
    Reviews: m.common.reviews(),
    RoleGreet: m.features.rolegreetsName(),
    RoleStates: m.features.rolestatesName(),
    Starboard: m.features.starboardName(),
    StatChannel: m.features.statchannelsName(),
    StatusRoles: m.features.statusrolesName(),
    StreamNotifications: m.common.streams(),
    Suggestions: m.features.suggestionsName(),
    SystemInfo: m.auditlog.sectionSystemInfo(),
    Ticket: m.features.ticketsName(),
    Todo: m.features.todoName(),
    Votes: m.features.votesName(),
    Webhook: m.auditlog.sectionWebhook(),
    Wizard: m.common.setupWizard(),
    Xp: m.features.xpName()
  };
}

/**
 * How each action is shown: its label, icon and colour.
 */
export function actionMeta(): Record<AuditAction, { label: string; icon: string; tone: Tone }> {
  return {
    [AuditAction.View]: { label: m.auditlog.pageActionViewed(), icon: "fa-eye", tone: "secondary" },
    [AuditAction.Create]: { label: m.common.created(), icon: "fa-plus", tone: "primary" },
    [AuditAction.Update]: { label: m.auditlog.pageActionUpdated(), icon: "fa-pen", tone: "primary" },
    [AuditAction.Delete]: { label: m.auditlog.pageActionDeleted(), icon: "fa-trash", tone: "accent" },
    [AuditAction.Access]: {
      label: m.auditlog.pageActionAccessed(),
      icon: "fa-arrow-right-to-bracket",
      tone: "secondary"
    }
  };
}

/**
 * Renders a UTC audit timestamp in the viewer's timezone.
 * @param value The timestamp
 */
export function formatDate(value: string): string {
  if (!value) return m.common.unknown();
  const utc = /[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`;
  return new Date(utc).toLocaleString();
}

/**
 * The resource path a request hit, without the method prefix and the API root.
 * @param entry The log entry
 */
export function describeEndpoint(entry: AuditLogEntry): string {
  let path = entry.endpoint ?? "";
  const space = path.indexOf(" ");
  if (space !== -1) path = path.slice(space + 1);
  return path.replace(/^\/?botapi\//i, "").replace(/^\//, "");
}

function humanizeValue(value: unknown): string {
  if (value === null || value === undefined) return m.common.noneLower();
  if (typeof value === "boolean") return value ? m.common.on() : m.common.off();
  if (typeof value === "number" || typeof value === "bigint") return value.toString();
  if (typeof value === "string") return value.length ? value : m.auditlog.pageValueEmpty();
  if (Array.isArray(value)) {
    if (!value.length) return m.common.noneLower();
    return value.length === 1 ? m.common.itemsOne({ count: value.length }) : m.common.itemsOther({ count: value.length });
  }
  if (typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return m.auditlog.pageValueObject();
    }
  }
  return String(value);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function flattenSet(obj: Record<string, unknown>): ChangeRow[] {
  const rows: ChangeRow[] = [];
  for (const [key, value] of Object.entries(obj)) {
    if (isPlainObject(value)) {
      for (const [innerKey, innerValue] of Object.entries(value)) {
        rows.push({ label: humanizeKey(innerKey), after: humanizeValue(innerValue) });
      }
    } else {
      rows.push({ label: humanizeKey(key), after: humanizeValue(value) });
    }
  }
  return rows;
}

/**
 * Turns the raw before/after document into readable field changes.
 * @param changes The entry's change set
 */
export function summarizeChanges(changes: AuditChangeSet | null): ChangeRow[] {
  if (!changes) return [];
  const before: unknown = changes.before;
  const after: unknown = changes.after;
  const changedKeys = Array.isArray(changes.changed) ? changes.changed : null;

  if (isPlainObject(before) && isPlainObject(after)) {
    const keys = changedKeys ?? [...new Set([...Object.keys(before), ...Object.keys(after)])];
    return keys.map((key) => ({
      label: humanizeKey(key),
      before: humanizeValue(before[key]),
      after: humanizeValue(after[key])
    }));
  }
  if (before !== undefined && after !== undefined) {
    return [{ label: m.common.value(), before: humanizeValue(before), after: humanizeValue(after) }];
  }
  if (isPlainObject(after)) return flattenSet(after);
  if (after !== undefined) return [{ label: m.common.value(), after: humanizeValue(after) }];
  return [];
}
