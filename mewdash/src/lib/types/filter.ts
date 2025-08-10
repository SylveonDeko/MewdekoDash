// Content filtering types
export interface AutomodRule {
  id: number;
  guildId: bigint;
  name: string;
  enabled: boolean;
  triggerType: AutomodTriggerType;
  actionType: AutomodActionType;
  triggerData: string;
  exemptRoles: bigint[];
  exemptChannels: bigint[];
  exemptUsers: bigint[];
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

export enum AutomodTriggerType {
  Keyword = 0,
  Spam = 1,
  MassMention = 2,
  Repetition = 3,
  AllCaps = 4,
  Zalgo = 5,
  InviteLinks = 6,
  ExternalLinks = 7,
  BadWords = 8
}

export enum AutomodActionType {
  Delete = 0,
  Warn = 1,
  Mute = 2,
  Kick = 3,
  Ban = 4,
  AddRole = 5,
  RemoveRole = 6
}

export interface CreateAutomodRuleRequest {
  name: string;
  triggerType: AutomodTriggerType;
  actionType: AutomodActionType;
  triggerData: string;
  exemptRoles?: bigint[];
  exemptChannels?: bigint[];
  exemptUsers?: bigint[];
}

export interface FilterSettings {
  filterWords: boolean;
  filterInvites: boolean;
  filterLinks: boolean;
  warnOnFilteredWord: boolean;
  warnOnInvite: boolean;
  autoDelete: boolean;
  muteOnFilter: boolean;
  muteTime: number;
  exemptRoles: bigint[];
  exemptChannels: bigint[];
}

export interface ServerFilterSettingsRequest {
  filterWords: boolean;
  filterInvites: boolean;
  filterLinks: boolean;
}

export interface WarningSettingsRequest {
  warnOnFilteredWord?: boolean;
  warnOnInvite?: boolean;
}

export interface FilteredWord {
  word: string;
  severity: FilterSeverity;
  addedBy: bigint;
  addedAt: string;
}

export enum FilterSeverity {
  Low = 0,
  Medium = 1,
  High = 2,
  Extreme = 3
}

export interface FilterStats {
  totalWordsFiltered: number;
  totalInvitesFiltered: number;
  totalLinksFiltered: number;
  topFilteredWords: Array<{
    word: string;
    count: number;
  }>;
  recentActivity: Array<{
    userId: bigint;
    username: string;
    channelId: bigint;
    channelName: string;
    filterType: string;
    timestamp: string;
  }>;
}