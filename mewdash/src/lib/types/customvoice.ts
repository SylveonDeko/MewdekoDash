// Custom Voice Channel types
export interface CustomVoiceConfigurationResponse {
  enabled: boolean;
  hubVoiceChannelId: bigint;
  channelCategoryId: bigint;
  defaultNameFormat: string;
  defaultUserLimit: number;
  defaultBitrate: number;
  deleteWhenEmpty: boolean;
  emptyChannelTimeout: number;
  allowMultipleChannels: boolean;
  allowNameCustomization: boolean;
  allowUserLimitCustomization: boolean;
  allowBitrateCustomization: boolean;
  allowLocking: boolean;
  allowUserManagement: boolean;
  maxUserLimit: number;
  maxBitrate: number;
  persistUserPreferences: boolean;
  autoPermission: boolean;
  customVoiceAdminRoleId: bigint | null;
}

export interface CustomVoiceConfigurationRequest {
  hubVoiceChannelId: bigint;
  channelCategoryId: bigint;
  defaultNameFormat?: string;
  defaultUserLimit: number;
  defaultBitrate: number;
  deleteWhenEmpty: boolean;
  emptyChannelTimeout: number;
  allowMultipleChannels: boolean;
  allowNameCustomization: boolean;
  allowUserLimitCustomization: boolean;
  allowBitrateCustomization: boolean;
  allowLocking: boolean;
  allowUserManagement: boolean;
  maxUserLimit: number;
  maxBitrate: number;
  persistUserPreferences: boolean;
  autoPermission: boolean;
  customVoiceAdminRoleId: bigint | null;
}

export interface CustomVoiceChannelResponse {
  id: bigint;
  ownerId: bigint;
  ownerName: string;
  channelName: string;
  userCount: number;
  userLimit: number;
  bitrate: number;
  isLocked: boolean;
  createdAt: string;
  lastActivity: string;
}

export interface UpdateCustomVoiceChannelRequest {
  name?: string;
  userLimit?: number;
  bitrate?: number;
  isLocked?: boolean;
}

export interface CustomVoiceUserPreference {
  userId: bigint;
  guildId: bigint;
  channelName: string;
  userLimit: number;
  bitrate: number;
  isPrivate: boolean;
}