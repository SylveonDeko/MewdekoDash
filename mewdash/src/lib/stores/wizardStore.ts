// Wizard state management store
import { writable, derived, type Writable } from 'svelte/store';
import type { 
  WizardProgress, 
  WizardState, 
  WizardType, 
  PermissionCheckResponse,
  WizardFeature 
} from '$lib/types/wizard';
import { DefaultWizardFeatures } from '$lib/types/wizard';
import { browser } from '$app/environment';

// Core wizard progress store
export const wizardProgress: Writable<WizardProgress | null> = writable(null);

// Wizard state from server
export const wizardState: Writable<WizardState | null> = writable(null);

// Permission check results
export const permissionCheck: Writable<PermissionCheckResponse | null> = writable(null);

// Loading states
export const wizardLoading = writable(false);
export const permissionsLoading = writable(false);
export const setupLoading = writable(false);

// Error states
export const wizardError = writable<string | null>(null);

// Feature configuration
export const availableFeatures = writable<WizardFeature[]>(DefaultWizardFeatures);
export const selectedFeatures = writable<string[]>([]);
export const configuredFeatures = writable<string[]>([]);

// Wizard flow control
export const currentStep = writable(1);
export const completedSteps = writable<number[]>([]);
export const canProceedToNextStep = writable(false);

// Derived stores
export const isFirstTimeWizard = derived(
  wizardProgress,
  ($progress) => $progress?.wizardType === WizardType.FirstTime
);

export const isQuickSetup = derived(
  wizardProgress,
  ($progress) => $progress?.wizardType === WizardType.QuickSetup
);

export const hasSelectedFeatures = derived(
  selectedFeatures,
  ($features) => $features.length > 0
);

export const totalSteps = derived(
  wizardProgress,
  ($progress) => {
    if (!$progress) return 5;
    return $progress.wizardType === WizardType.FirstTime ? 5 : 4;
  }
);

export const wizardComplete = derived(
  [currentStep, totalSteps],
  ([$currentStep, $totalSteps]) => $currentStep >= $totalSteps
);

export const progressPercentage = derived(
  [currentStep, totalSteps],
  ([$currentStep, $totalSteps]) => Math.round(($currentStep / $totalSteps) * 100)
);

// Wizard actions
export const wizardActions = {
  /**
   * Initialize a new wizard session
   */
  startWizard: (guildId: bigint, userId: bigint, wizardType: WizardType) => {
    const progress: WizardProgress = {
      currentStep: 1,
      totalSteps: wizardType === WizardType.FirstTime ? 5 : 4,
      completedSteps: [],
      selectedFeatures: [],
      configuredFeatures: [],
      guildId,
      userId,
      wizardType,
      startedAt: new Date(),
      lastUpdated: new Date()
    };

    wizardProgress.set(progress);
    currentStep.set(1);
    completedSteps.set([]);
    selectedFeatures.set([]);
    configuredFeatures.set([]);
    wizardError.set(null);

    // Save to localStorage for persistence
    if (browser) {
      try {
        localStorage.setItem(`wizard_progress_${guildId}`, JSON.stringify(progress));
      } catch (err) {
        console.warn('Failed to save wizard progress to localStorage:', err);
      }
    }
  },

  /**
   * Move to the next step
   */
  nextStep: () => {
    wizardProgress.update(progress => {
      if (!progress) return progress;
      
      const newStep = Math.min(progress.currentStep + 1, progress.totalSteps);
      const newProgress = {
        ...progress,
        currentStep: newStep,
        completedSteps: [...progress.completedSteps, progress.currentStep],
        lastUpdated: new Date()
      };

      currentStep.set(newStep);
      completedSteps.update(steps => [...steps, progress.currentStep]);

      // Save to localStorage
      if (browser) {
        try {
          localStorage.setItem(`wizard_progress_${progress.guildId}`, JSON.stringify(newProgress));
        } catch (err) {
          console.warn('Failed to save wizard progress:', err);
        }
      }

      return newProgress;
    });
  },

  /**
   * Move to the previous step
   */
  previousStep: () => {
    wizardProgress.update(progress => {
      if (!progress) return progress;
      
      const newStep = Math.max(progress.currentStep - 1, 1);
      const newProgress = {
        ...progress,
        currentStep: newStep,
        lastUpdated: new Date()
      };

      currentStep.set(newStep);

      // Save to localStorage
      if (browser) {
        try {
          localStorage.setItem(`wizard_progress_${progress.guildId}`, JSON.stringify(newProgress));
        } catch (err) {
          console.warn('Failed to save wizard progress:', err);
        }
      }

      return newProgress;
    });
  },

  /**
   * Toggle feature selection
   */
  toggleFeature: (featureId: string) => {
    selectedFeatures.update(features => {
      const newFeatures = features.includes(featureId)
        ? features.filter(f => f !== featureId)
        : [...features, featureId];

      // Update wizard progress
      wizardProgress.update(progress => {
        if (!progress) return progress;
        
        const newProgress = {
          ...progress,
          selectedFeatures: newFeatures,
          lastUpdated: new Date()
        };

        // Save to localStorage
        if (browser) {
          try {
            localStorage.setItem(`wizard_progress_${progress.guildId}`, JSON.stringify(newProgress));
          } catch (err) {
            console.warn('Failed to save wizard progress:', err);
          }
        }

        return newProgress;
      });

      return newFeatures;
    });
  },

  /**
   * Mark feature as configured
   */
  markFeatureConfigured: (featureId: string) => {
    configuredFeatures.update(features => {
      if (features.includes(featureId)) return features;
      
      const newFeatures = [...features, featureId];

      // Update wizard progress
      wizardProgress.update(progress => {
        if (!progress) return progress;
        
        const newProgress = {
          ...progress,
          configuredFeatures: newFeatures,
          lastUpdated: new Date()
        };

        // Save to localStorage
        if (browser) {
          try {
            localStorage.setItem(`wizard_progress_${progress.guildId}`, JSON.stringify(newProgress));
          } catch (err) {
            console.warn('Failed to save wizard progress:', err);
          }
        }

        return newProgress;
      });

      return newFeatures;
    });
  },

  /**
   * Set wizard error
   */
  setError: (error: string | null) => {
    wizardError.set(error);
  },

  /**
   * Clear wizard error
   */
  clearError: () => {
    wizardError.set(null);
  },

  /**
   * Set loading state
   */
  setLoading: (loading: boolean) => {
    wizardLoading.set(loading);
  },

  /**
   * Complete the wizard
   */
  completeWizard: () => {
    wizardProgress.update(progress => {
      if (!progress) return progress;
      
      const newProgress = {
        ...progress,
        currentStep: progress.totalSteps,
        completedSteps: Array.from({ length: progress.totalSteps }, (_, i) => i + 1),
        lastUpdated: new Date()
      };

      currentStep.set(progress.totalSteps);
      completedSteps.set(Array.from({ length: progress.totalSteps }, (_, i) => i + 1));

      return newProgress;
    });
  },

  /**
   * Reset wizard state
   */
  resetWizard: () => {
    wizardProgress.set(null);
    wizardState.set(null);
    permissionCheck.set(null);
    currentStep.set(1);
    completedSteps.set([]);
    selectedFeatures.set([]);
    configuredFeatures.set([]);
    wizardError.set(null);
    wizardLoading.set(false);
    permissionsLoading.set(false);
    setupLoading.set(false);
  },

  /**
   * Restore wizard progress from localStorage
   */
  restoreProgress: (guildId: bigint) => {
    if (!browser) return false;

    try {
      const stored = localStorage.getItem(`wizard_progress_${guildId}`);
      if (!stored) return false;

      const progress: WizardProgress = JSON.parse(stored);
      
      // Validate the stored data
      if (progress.guildId !== guildId) return false;
      
      // Check if progress is stale (older than 1 hour)
      const lastUpdated = new Date(progress.lastUpdated);
      const isStale = Date.now() - lastUpdated.getTime() > 60 * 60 * 1000;
      
      if (isStale) {
        localStorage.removeItem(`wizard_progress_${guildId}`);
        return false;
      }

      // Restore state
      wizardProgress.set(progress);
      currentStep.set(progress.currentStep);
      completedSteps.set(progress.completedSteps);
      selectedFeatures.set(progress.selectedFeatures);
      configuredFeatures.set(progress.configuredFeatures);

      return true;
    } catch (err) {
      console.warn('Failed to restore wizard progress:', err);
      return false;
    }
  },

  /**
   * Clear wizard progress from localStorage
   */
  clearStoredProgress: (guildId: bigint) => {
    if (!browser) return;
    
    try {
      localStorage.removeItem(`wizard_progress_${guildId}`);
    } catch (err) {
      console.warn('Failed to clear stored wizard progress:', err);
    }
  }
};

// Feature helpers
export const featureHelpers = {
  getFeatureById: (featureId: string): WizardFeature | undefined => {
    return DefaultWizardFeatures.find(f => f.id === featureId);
  },

  getRecommendedFeatures: (): WizardFeature[] => {
    return DefaultWizardFeatures.filter(f => f.recommended);
  },

  getFeaturesByCategory: (category: string): WizardFeature[] => {
    return DefaultWizardFeatures.filter(f => f.category === category);
  },

  getFeatureSetupTime: (featureIds: string[]): number => {
    return featureIds.reduce((total, id) => {
      const feature = DefaultWizardFeatures.find(f => f.id === id);
      if (!feature) return total;
      
      const minutes = parseInt(feature.setupTime.replace(/\D/g, '')) || 0;
      return total + minutes;
    }, 0);
  },

  validateFeatureSelection: (featureIds: string[]): { valid: boolean; conflicts: string[]; missing: string[] } => {
    const conflicts: string[] = [];
    const missing: string[] = [];

    for (const featureId of featureIds) {
      const feature = DefaultWizardFeatures.find(f => f.id === featureId);
      if (!feature) continue;

      // Check for conflicts
      if (feature.conflictsWith) {
        const hasConflict = feature.conflictsWith.some(conflict => featureIds.includes(conflict));
        if (hasConflict) {
          conflicts.push(featureId);
        }
      }

      // Check for missing dependencies
      if (feature.dependsOn) {
        const missingDeps = feature.dependsOn.filter(dep => !featureIds.includes(dep));
        missing.push(...missingDeps);
      }
    }

    return {
      valid: conflicts.length === 0 && missing.length === 0,
      conflicts: [...new Set(conflicts)],
      missing: [...new Set(missing)]
    };
  }
};