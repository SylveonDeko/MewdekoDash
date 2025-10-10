// lib/api/customvoice/models/CustomVoice.ts

export interface CustomVoiceConfigurationResponse {
  enabled: boolean;
  hubVoiceChannelId: bigint;
  channelCategoryId: bigint | null;
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
  channelCategoryId?: bigint | null;
  defaultNameFormat?: string | null;
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
  customVoiceAdminRoleId?: bigint | null;
}

export interface CustomVoiceChannelResponse {
  channelId: bigint;
  ownerId: bigint;
  createdAt: string;
  lastActive: string;
  isLocked: boolean;
  keepAlive: boolean;
  allowedUsers: bigint[];
  deniedUsers: bigint[];
}

export interface UpdateCustomVoiceChannelRequest {
  isLocked?: boolean | null;
  keepAlive?: boolean | null;
  allowedUsers?: bigint[] | null;
  deniedUsers?: bigint[] | null;
}

export interface CustomVoiceUserPreference {
  userId: bigint;
  guildId: bigint;
  defaultName: string | null;
  defaultUserLimit: number | null;
  defaultBitrate: number | null;
}
