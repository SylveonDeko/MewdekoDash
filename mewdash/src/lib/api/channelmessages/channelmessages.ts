// lib/api/channelmessages/channelmessages.ts
import { apiRequest } from "../core";

/** A sticky message. Maps to Mewdeko.Controllers.Common.UtilityExtras.StickyDto */
export interface Sticky {
  channelId: bigint | string;
  content: string;
  messages: number;
  seconds: number;
}

/** A sticky template. Maps to Mewdeko.Controllers.Common.UtilityExtras.StickyTemplateDto */
export interface StickyTemplate {
  name: string;
  content: string;
}

export type AutoReactionMessageType = "Any" | "Text" | "Images" | "Videos" | "Media" | "Links";

/** An auto reaction rule. Maps to Mewdeko.Controllers.Common.AutoReactions.AutoReactionDto */
export interface AutoReaction {
  id: number;
  channelId: bigint | string;
  emojis: string[];
  messageTypes: AutoReactionMessageType;
  ignoreBots: boolean;
  ignoreWebhooks: boolean;
  ignoreReplies: boolean;
  allowedRoleIds: Array<bigint | string>;
  ignoredRoleIds: Array<bigint | string>;
  ignoredUserIds: Array<bigint | string>;
  skipWords: string[];
  requiredWords: string[];
  priority: number;
  deleteNonMatching: boolean;
  enabled: boolean;
}

/** The rules and limits. Maps to Mewdeko.Controllers.Common.AutoReactions.AutoReactionListResponse */
export interface AutoReactionList {
  rules: AutoReaction[];
  maxEmojis: number;
  maxWords: number;
  maxWordLength: number;
  managerRoleId: bigint | string | null;
}

/** Maps to Mewdeko.Controllers.StickiesController */
export const stickiesApi = {
  list: (guildId: bigint) => apiRequest<Sticky[]>(`Stickies/${guildId}`),

  /** Sticks a message to a channel, replacing the channel's sticky */
  set: (guildId: bigint, sticky: Sticky) =>
    apiRequest<Sticky>(`Stickies/${guildId}`, "PUT", { ...sticky, channelId: BigInt(String(sticky.channelId)) }),

  remove: (guildId: bigint, channelId: bigint | string) =>
    apiRequest<void>(`Stickies/${guildId}/${channelId}`, "DELETE"),

  clear: (guildId: bigint) => apiRequest<number>(`Stickies/${guildId}`, "DELETE"),

  templates: (guildId: bigint) => apiRequest<StickyTemplate[]>(`Stickies/${guildId}/templates`),

  saveTemplate: (guildId: bigint, template: StickyTemplate) =>
    apiRequest<StickyTemplate>(`Stickies/${guildId}/templates`, "PUT", template),

  deleteTemplate: (guildId: bigint, name: string) =>
    apiRequest<void>(`Stickies/${guildId}/templates/${encodeURIComponent(name)}`, "DELETE"),

  useTemplate: (guildId: bigint, name: string, channelId: bigint) =>
    apiRequest<void>(`Stickies/${guildId}/templates/${encodeURIComponent(name)}/use`, "POST", { channelId }),
};

function toWire(rule: Omit<AutoReaction, "id" | "priority"> & Partial<Pick<AutoReaction, "id" | "priority">>) {
  const ids = (list: Array<bigint | string>) => list.map((id) => BigInt(String(id)));
  return {
    ...rule,
    channelId: BigInt(String(rule.channelId)),
    allowedRoleIds: ids(rule.allowedRoleIds),
    ignoredRoleIds: ids(rule.ignoredRoleIds),
    ignoredUserIds: ids(rule.ignoredUserIds),
  };
}

/** Maps to Mewdeko.Controllers.AutoReactionsController */
export const autoReactionsApi = {
  list: (guildId: bigint) => apiRequest<AutoReactionList>(`AutoReactions/${guildId}`),

  create: (guildId: bigint, rule: Omit<AutoReaction, "id" | "priority">) =>
    apiRequest<AutoReaction>(`AutoReactions/${guildId}`, "POST", toWire(rule)),

  update: (guildId: bigint, rule: AutoReaction) =>
    apiRequest<AutoReaction>(`AutoReactions/${guildId}/${rule.id}`, "PUT", toWire(rule)),

  remove: (guildId: bigint, id: number) => apiRequest<void>(`AutoReactions/${guildId}/${id}`, "DELETE"),

  reorder: (guildId: bigint, ruleIds: number[]) =>
    apiRequest<AutoReaction[]>(`AutoReactions/${guildId}/order`, "PUT", { ruleIds }),

  setManagerRole: (guildId: bigint, roleId: bigint | null) =>
    apiRequest<{ roleId: bigint | null }>(`AutoReactions/${guildId}/manager-role`, "PUT", { roleId }),
};
