// stores/inviteStore.ts
import { writable } from "svelte/store";
import { api } from "$lib/api";
import { logger } from "$lib/logger";

interface InviteStats {
  totalInvites: number;
  topInviters: Array<{
    userId: string;
    username: string;
    inviteCount: number;
  }>;
  averageJoins: number;
}

interface InviteSettings {
  isEnabled: boolean;
  removeOnLeave: boolean;
  removeInviteOnLeave: boolean;
  minAccountAge: string;
}

interface InviteStoreState {
  stats: InviteStats | null;
  settings: InviteSettings | null;
  loading: boolean;
  error: string | null;
}

function createInviteStore() {
  const { subscribe, set, update } = writable<InviteStoreState>({
    stats: null,
    settings: null,
    loading: false,
    error: null
  });

  async function fetchInviteStats(guildId: bigint) {
    update(state => ({ ...state, loading: true }));

    try {
      const [leaderboard, averageJoins, settings] = await Promise.all([
        api.getInviteLeaderboard(guildId, 1, 5),
        api.getAverageJoins(guildId),
        api.getInviteSettings(guildId)
      ]);

      update(state => ({
        ...state,
        loading: false,
        error: null,
        stats: {
          totalInvites: leaderboard.reduce((sum, entry) => sum + entry.inviteCount, 0),
          topInviters: leaderboard,
          averageJoins
        },
        settings: {
          ...settings,
          removeOnLeave: settings.removeInviteOnLeave
        }
      }));
    } catch (err) {
      logger.error("Failed to fetch invite stats:", err);
      update(state => ({
        ...state,
        loading: false,
        error: err instanceof Error ? err.message : "Unknown error"
      }));
    }
  }

  async function updateSettings(guildId: bigint, settings: Partial<InviteSettings>) {
    try {
      let updated = false;

      if ("isEnabled" in settings && settings.isEnabled !== undefined) {
        await api.toggleInviteTracking(guildId, settings.isEnabled);
        updated = true;
      }

      if ("removeOnLeave" in settings && settings.removeOnLeave !== undefined) {
        await api.setRemoveOnLeave(guildId, settings.removeOnLeave);
        updated = true;
      }

      if ("minAccountAge" in settings && settings.minAccountAge !== undefined) {
        await api.setMinAccountAge(guildId, settings.minAccountAge);
        updated = true;
      }

      if (updated) {
        await fetchInviteStats(guildId);
      }
    } catch (err) {
      logger.error("Failed to update invite settings:", err);
      update(state => ({
        ...state,
        error: err instanceof Error ? err.message : "Unknown error"
      }));
    }
  }

  return {
    subscribe,
    fetchStats: fetchInviteStats,
    updateSettings
  };
}

export const inviteStore = createInviteStore();