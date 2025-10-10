// lib/api/wizard/models/Wizard.ts

/**
 * Wizard types
 */
export enum WizardType {
  FirstTime = 0,
  QuickSetup = 1,
  FeatureDiscovery = 2,
}

/**
 * Wizard context
 */
export interface WizardContext {
  experienceLevel: number;
  isFirstDashboardAccess: boolean;
  completedWizardCount: number;
  guildHasBasicSetup: boolean;
}

/**
 * Wizard decision response
 * Maps to Mewdeko.Controllers.Common.Wizard.WizardDecisionResponse
 */
export interface WizardDecisionResponse {
  showWizard: boolean;
  showSuggestion: boolean;
  wizardType: WizardType;
  reason: string;
  context: WizardContext;
}

/**
 * Wizard state response
 * Maps to Mewdeko.Controllers.Common.Wizard.WizardStateResponse
 */
export interface WizardStateResponse {
  guildId: bigint;
  completed: boolean;
  skipped: boolean;
  completedAt: string | null;
  completedByUserId: bigint | null;
  hasBasicSetup: boolean;
  currentStep: number;
  configuredFeatures: string[];
}

/**
 * Feature configuration result
 */
export interface FeatureConfigResult {
  featureId: string;
  featureName: string;
  success: boolean;
  errorMessage: string | null;
  configurationApplied: Record<string, any>;
}

/**
 * Wizard complete response
 * Maps to Mewdeko.Controllers.Common.Wizard.WizardCompleteResponse
 */
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
  errorMessage?: string | null;
}

/**
 * Wizard state update request
 */
export interface WizardStateUpdateRequest {
  userId: bigint;
  markCompleted?: boolean;
  markSkipped?: boolean;
  configuredFeatures?: string[];
}
