// Wizard-related TypeScript type definitions

export interface WizardDecision {
  showWizard: boolean;
  showSuggestion: boolean;
  wizardType: WizardType;
  reason: string;
  context: WizardContext;
}

export interface WizardContext {
  experienceLevel: number;
  isFirstDashboardAccess: boolean;
  completedWizardCount: number;
  guildHasBasicSetup: boolean;
}

export interface WizardState {
  guildId: bigint;
  completed: boolean;
  skipped: boolean;
  completedAt?: string;
  completedByUserId?: bigint;
  hasBasicSetup: boolean;
  currentStep: number;
  configuredFeatures: string[];
}

export interface WizardStateUpdate {
  currentStep: number;
  configuredFeatures: string[];
  markCompleted: boolean;
  markSkipped: boolean;
  userId: bigint;
}

export interface WizardCompleteResponse {
  success: boolean;
  guildId: bigint;
  userId: bigint;
  configuredFeatures: string[];
  failedFeatures: FeatureConfigResult[];
  completedAt: string;
  newExperienceLevel: number;
  wasFirstWizard: boolean;
  nextSteps: string[];
  errorMessage?: string;
}

export interface FeatureConfigResult {
  featureId: string;
  featureName: string;
  success: boolean;
  errorMessage?: string;
  configurationApplied: Record<string, any>;
}

export interface PermissionCheckResponse {
  guildId: bigint;
  botId: bigint;
  hasAllRequiredPermissions: boolean;
  permissionResults: PermissionCheckResult[];
  missingCriticalPermissions: string[];
  missingRecommendedPermissions: string[];
  suggestedInviteUrl?: string;
  canFunction: boolean;
  healthStatus: PermissionHealthStatus;
}

export interface PermissionCheckResult {
  permission: string;
  permissionName: string;
  hasPermission: boolean;
  importance: PermissionImportance;
  description: string;
  requiredForFeatures: string[];
}

export interface UserPreferences {
  userId: bigint;
  prefersGuidedSetup: boolean;
  experienceLevel: number;
  hasCompletedAnyWizard: boolean;
  wizardCompletedCount: number;
  firstDashboardAccess?: string;
}

export interface UserPreferencesRequest {
  prefersGuidedSetup: boolean;
  preferredExperienceLevel?: number;
}

// Feature setup request types
export interface WelcomeSetupRequest {
  guildId: bigint;
  userId: bigint;
  featureId: string;
  channelId: bigint;
  welcomeMessage: string;
  sendDmGreeting: boolean;
  dmGreetingMessage: string;
  autoDelete: boolean;
  autoDeleteTimer: number;
}

export interface ModerationSetupRequest {
  guildId: bigint;
  userId: bigint;
  featureId: string;
  filterInvites: boolean;
  filterLinks: boolean;
  filterWords: boolean;
  customFilteredWords: string[];
  muteRoleId?: bigint;
  logChannelId?: bigint;
}

export interface XpSetupRequest {
  guildId: bigint;
  userId: bigint;
  featureId: string;
  textXpRate: number;
  xpTimeout: number;
  voiceXpRate: number;
  voiceXpTimeout: number;
  levelUpChannelId?: bigint;
  roleRewards: XpRoleReward[];
}

export interface XpRoleReward {
  level: number;
  roleId: bigint;
  removePrevious: boolean;
}

export interface StarboardSetupRequest {
  guildId: bigint;
  userId: bigint;
  featureId: string;
  channelId: bigint;
  threshold: number;
  starEmoji: string;
  allowBots: boolean;
  removeOnDelete: boolean;
}

// Wizard feature definitions
export interface WizardFeature {
  id: string;
  title: string;
  description: string;
  icon: string;
  recommended: boolean;
  setupTime: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  category: 'essential' | 'community' | 'moderation' | 'entertainment';
  requiredPermissions: string[];
  conflictsWith?: string[];
  dependsOn?: string[];
}

// Enums
export enum WizardType {
  None = 'none',
  FirstTime = 'first-time',
  QuickSetup = 'quick-setup'
}

export enum PermissionImportance {
  Critical = 'critical',
  Recommended = 'recommended',
  Optional = 'optional'
}

export enum PermissionHealthStatus {
  Excellent = 'Excellent',
  Good = 'Good',
  Warning = 'Warning',
  Poor = 'Poor'
}

export enum UserAction {
  CompletedFirstWizard = 'CompletedFirstWizard',
  ConfiguredMultipleFeatures = 'ConfiguredMultipleFeatures',
  UsedAdvancedFeatures = 'UsedAdvancedFeatures'
}

// Wizard step definitions
export const WizardSteps = {
  Welcome: 1,
  PermissionCheck: 2,
  FeatureSelection: 3,
  FeatureConfiguration: 4,
  Completion: 5
} as const;

// Available wizard features
export const WizardFeatures = {
  MultiGreets: 'multigreets',
  Moderation: 'moderation',
  XpSystem: 'xp',
  Starboard: 'starboard',
  Logging: 'logging',
  AutoRoles: 'autoroles',
  Protection: 'protection',
  Music: 'music'
} as const;

// Default wizard features configuration
export const DefaultWizardFeatures: WizardFeature[] = [
  {
    id: WizardFeatures.MultiGreets,
    title: 'Welcome Messages',
    description: 'Automatically greet new members when they join your server',
    icon: 'hand-metal',
    recommended: true,
    setupTime: '2 min',
    difficulty: 'easy',
    category: 'essential',
    requiredPermissions: ['SendMessages', 'ViewChannels']
  },
  {
    id: WizardFeatures.Moderation,
    title: 'Auto-Moderation',
    description: 'Filter spam, inappropriate content, and manage rule violations',
    icon: 'shield',
    recommended: true,
    setupTime: '3 min',
    difficulty: 'medium',
    category: 'moderation',
    requiredPermissions: ['ManageMessages', 'KickMembers', 'BanMembers']
  },
  {
    id: WizardFeatures.XpSystem,
    title: 'XP & Leveling',
    description: 'Reward active members with XP and level-based role rewards',
    icon: 'star',
    recommended: false,
    setupTime: '4 min',
    difficulty: 'medium',
    category: 'community',
    requiredPermissions: ['ManageRoles', 'SendMessages']
  },
  {
    id: WizardFeatures.Starboard,
    title: 'Starboard',
    description: 'Highlight popular messages that receive enough star reactions',
    icon: 'star',
    recommended: false,
    setupTime: '2 min',
    difficulty: 'easy',
    category: 'community',
    requiredPermissions: ['AddReactions', 'SendMessages', 'EmbedLinks']
  }
];

// Wizard progress tracking
export interface WizardProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  selectedFeatures: string[];
  configuredFeatures: string[];
  guildId: bigint;
  userId: bigint;
  wizardType: WizardType;
  startedAt: Date;
  lastUpdated: Date;
}