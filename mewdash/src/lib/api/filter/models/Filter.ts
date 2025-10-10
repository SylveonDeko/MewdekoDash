// lib/api/filter/models/Filter.ts

export interface ServerFilterSettingsRequest {
  filterWords: boolean;
  filterInvites: boolean;
  filterLinks: boolean;
}

export interface WarningSettingsRequest {
  warnOnFilteredWord?: boolean | null;
  warnOnInvite?: boolean | null;
}

export interface FilterSettings {
  serverSettings: {
    filterWords: boolean;
    filterInvites: boolean;
    filterLinks: boolean;
    warnOnFilteredWord: boolean;
    warnOnInvite: boolean;
  };
  filteredWords: string[];
  autoBanWords: string[];
  channelSettings: {
    wordFilterChannels: bigint[];
    inviteFilterChannels: bigint[];
    linkFilterChannels: bigint[];
  };
}

export interface AutomodRule {
  id: number;
  guildId: bigint;
  name: string;
  triggerType: number;
  triggerValue: string;
  action: number;
  actionDuration: number;
  enabled: boolean;
  ignoreRoles: string | null;
  ignoreChannels: string | null;
}

export interface CreateAutomodRuleRequest {
  name: string;
  triggerType: number;
  triggerValue: string;
  action: number;
  actionDuration?: number;
  ignoreRoles?: string | null;
  ignoreChannels?: string | null;
}

export interface FilterStats {
  totalFiltered: number;
  filteredByType: Record<string, number>;
  recentFilters: Array<{
    type: string;
    timestamp: string;
    userId: bigint;
  }>;
}
