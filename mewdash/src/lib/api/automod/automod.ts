// lib/api/automod/automod.ts
import { apiRequest } from "../core";
import type {
  AutoModFollowUp,
  AutoModRule,
  AutoModRuleSpec,
  AutoModStatus,
} from "./models";

export const autoModApi = {
  getStatus: (guildId: bigint) =>
    apiRequest<AutoModStatus>(`AutoMod/${guildId}/status`),

  getRules: (guildId: bigint) =>
    apiRequest<AutoModRule[]>(`AutoMod/${guildId}/rules`),

  createRule: (guildId: bigint, spec: AutoModRuleSpec) =>
    apiRequest<AutoModRule>(`AutoMod/${guildId}/rules`, "POST", spec),

  updateRule: (guildId: bigint, ruleId: bigint, spec: AutoModRuleSpec) =>
    apiRequest<AutoModRule>(`AutoMod/${guildId}/rules/${ruleId}`, "PUT", spec),

  deleteRule: (guildId: bigint, ruleId: bigint) =>
    apiRequest<void>(`AutoMod/${guildId}/rules/${ruleId}`, "DELETE"),

  setFollowUp: (guildId: bigint, ruleId: bigint, followUp: AutoModFollowUp) =>
    apiRequest<AutoModFollowUp>(
      `AutoMod/${guildId}/followups/${ruleId}`,
      "PUT",
      followUp,
    ),

  deleteFollowUp: (guildId: bigint, ruleId: bigint) =>
    apiRequest<void>(`AutoMod/${guildId}/followups/${ruleId}`, "DELETE"),
};
