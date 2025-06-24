// lib/stores/dashboardStore.ts
import { writable } from "svelte/store";

// Define the store's state type
interface DashboardState {
  lastUpdated: Date | null;
  isCustomizing: boolean;
}

// Create initial state
const initialState: DashboardState = {
  lastUpdated: null,
  isCustomizing: false
};

// Create the store with helper functions
function createDashboardStore() {
  const { subscribe, update } = writable<DashboardState>(initialState);

  return {
    subscribe,

    // Set the last updated timestamp
    setLastUpdated: (date: Date) => update(state => ({ ...state, lastUpdated: date })),

    // Toggle customization mode
    // Reset the store state
    reset: () => update(() => initialState)
  };
}

export const dashboardStore = createDashboardStore();