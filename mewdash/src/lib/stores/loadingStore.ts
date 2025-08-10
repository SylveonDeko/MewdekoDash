import { writable, derived, get } from "svelte/store";
import { browser } from "$app/environment";
import { navigating } from "$app/stores";

// Types
export type LoadingType = "navigation" | "api" | "operation" | "critical";

export interface LoadingState {
  id: string;
  type: LoadingType;
  message?: string;
  progress?: number;
  timestamp: number;
  minDisplayTime?: number;
}

interface LoadingStoreState {
  states: Map<string, LoadingState>;
  isLoading: boolean;
  primaryMessage: string;
  showSpinner: boolean;
}

// Constants
const DEFAULT_MIN_DISPLAY_TIME = 500; // Minimum time to show loading (prevents flash)
const NAVIGATION_DEBOUNCE = 100; // Debounce navigation loading
const CRITICAL_PRIORITY = 1000;

function createLoadingStore() {
  const initialState: LoadingStoreState = {
    states: new Map(),
    isLoading: false,
    primaryMessage: "",
    showSpinner: false
  };

  const { subscribe, set, update } = writable<LoadingStoreState>(initialState);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let minDisplayTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  // Helper to determine if we should show loading
  function shouldShowLoading(states: Map<string, LoadingState>): boolean {
    if (states.size === 0) return false;
    
    // Always show for critical operations
    for (const [, state] of states) {
      if (state.type === "critical") return true;
    }
    
    // Show if any non-navigation operations or navigation taking too long
    const now = Date.now();
    for (const [, state] of states) {
      if (state.type !== "navigation") return true;
      if (now - state.timestamp > NAVIGATION_DEBOUNCE) return true;
    }
    
    return false;
  }

  // Helper to get primary message
  function getPrimaryMessage(states: Map<string, LoadingState>): string {
    if (states.size === 0) return "";
    
    // Priority order: critical > operation > api > navigation
    const priorities = { critical: 4, operation: 3, api: 2, navigation: 1 };
    
    let primaryState: LoadingState | null = null;
    let highestPriority = 0;
    
    for (const [, state] of states) {
      const priority = priorities[state.type];
      if (priority > highestPriority) {
        highestPriority = priority;
        primaryState = state;
      }
    }
    
    if (primaryState?.message) return primaryState.message;
    
    // Default messages by type
    switch (primaryState?.type) {
      case "critical": return "Processing...";
      case "operation": return "Working...";
      case "api": return "Loading...";
      case "navigation": return "Navigating...";
      default: return "Loading...";
    }
  }

  // Update store state
  function updateState() {
    update(state => {
      const shouldShow = shouldShowLoading(state.states);
      const message = getPrimaryMessage(state.states);
      
      return {
        ...state,
        isLoading: state.states.size > 0,
        showSpinner: shouldShow,
        primaryMessage: message
      };
    });
  }

  // Start loading
  function startLoading(
    id: string,
    type: LoadingType = "operation",
    message?: string,
    options: { progress?: number; minDisplayTime?: number } = {}
  ) {
    if (!browser) return;

    const loadingState: LoadingState = {
      id,
      type,
      message,
      progress: options.progress,
      timestamp: Date.now(),
      minDisplayTime: options.minDisplayTime ?? DEFAULT_MIN_DISPLAY_TIME
    };

    update(state => {
      const newStates = new Map(state.states);
      newStates.set(id, loadingState);
      return { ...state, states: newStates };
    });

    // Clear any existing timer for this ID
    if (minDisplayTimers.has(id)) {
      clearTimeout(minDisplayTimers.get(id)!);
      minDisplayTimers.delete(id);
    }

    updateState();
  }

  // Stop loading
  function stopLoading(id: string, force = false) {
    if (!browser) return;

    const currentState = get({ subscribe });
    const loadingState = currentState.states.get(id);
    
    if (!loadingState) return;

    const elapsed = Date.now() - loadingState.timestamp;
    const minTime = loadingState.minDisplayTime ?? DEFAULT_MIN_DISPLAY_TIME;

    if (!force && elapsed < minTime) {
      // Wait for minimum display time
      const remainingTime = minTime - elapsed;
      const timer = setTimeout(() => {
        update(state => {
          const newStates = new Map(state.states);
          newStates.delete(id);
          return { ...state, states: newStates };
        });
        minDisplayTimers.delete(id);
        updateState();
      }, remainingTime);
      
      minDisplayTimers.set(id, timer);
    } else {
      // Remove immediately
      update(state => {
        const newStates = new Map(state.states);
        newStates.delete(id);
        return { ...state, states: newStates };
      });
      updateState();
    }
  }

  // Update loading progress
  function updateProgress(id: string, progress: number, message?: string) {
    if (!browser) return;

    update(state => {
      const newStates = new Map(state.states);
      const existing = newStates.get(id);
      if (existing) {
        newStates.set(id, {
          ...existing,
          progress: Math.max(0, Math.min(100, progress)),
          message: message ?? existing.message
        });
      }
      return { ...state, states: newStates };
    });

    updateState();
  }

  // Clear all loading states
  function clearAll() {
    if (!browser) return;

    // Clear all timers
    minDisplayTimers.forEach(timer => clearTimeout(timer));
    minDisplayTimers.clear();

    update(state => ({
      ...state,
      states: new Map()
    }));

    updateState();
  }

  // Handle navigation loading with debounce
  function handleNavigation(isNavigating: boolean) {
    if (!browser) return;

    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }

    if (isNavigating) {
      debounceTimer = setTimeout(() => {
        startLoading("navigation", "navigation", "Navigating...", { 
          minDisplayTime: 200 // Shorter for navigation
        });
      }, NAVIGATION_DEBOUNCE);
    } else {
      stopLoading("navigation");
    }
  }

  // Auto-track SvelteKit navigation
  if (browser) {
    navigating.subscribe(nav => {
      handleNavigation(!!nav);
    });
  }

  return {
    subscribe,
    
    // Start/stop loading
    start: startLoading,
    stop: stopLoading,
    
    // Update progress
    updateProgress,
    
    // Bulk operations
    clearAll,
    
    // Convenience methods for common patterns
    async wrap<T>(
      id: string,
      operation: () => Promise<T>,
      type: LoadingType = "operation",
      message?: string
    ): Promise<T> {
      try {
        startLoading(id, type, message);
        const result = await operation();
        return result;
      } finally {
        stopLoading(id);
      }
    },

    // API call wrapper
    async apiCall<T>(
      id: string,
      operation: () => Promise<T>,
      message = "Loading..."
    ): Promise<T> {
      return this.wrap(id, operation, "api", message);
    },

    // Critical operation wrapper
    async critical<T>(
      id: string,
      operation: () => Promise<T>,
      message = "Processing..."
    ): Promise<T> {
      return this.wrap(id, operation, "critical", message);
    }
  };
}

export const loadingStore = createLoadingStore();

// Derived stores for common use cases
export const isLoading = derived(loadingStore, $loading => $loading.isLoading);
export const showSpinner = derived(loadingStore, $loading => $loading.showSpinner);
export const loadingMessage = derived(loadingStore, $loading => $loading.primaryMessage);