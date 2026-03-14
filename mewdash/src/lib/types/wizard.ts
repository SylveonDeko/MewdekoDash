export enum WizardType {
  FirstTime = "first_time",
  QuickSetup = "quick_setup",
}

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

export interface WizardState {
  guildId: bigint;
  isComplete: boolean;
  features: WizardFeature[];
}

export interface PermissionCheckResponse {
  hasPermissions: boolean;
  missingPermissions: string[];
}

export interface WizardFeature {
  id: string;
  name: string;
  description: string;
  category: string;
  recommended: boolean;
  setupTime: string;
  icon?: string;
  conflictsWith?: string[];
  dependsOn?: string[];
}

export const DefaultWizardFeatures: WizardFeature[] = [];
