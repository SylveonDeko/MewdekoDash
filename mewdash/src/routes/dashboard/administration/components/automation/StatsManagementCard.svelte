<script lang="ts">
  import { fly } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { administrationApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { logger } from "$lib/logger";

  let {
    showConfirm,
    fetchAllData
  } = $props();

  let saving = $state(false);

  async function toggleStatsOptOut() {
    if (!$currentGuild?.id) return;

    try {
      saving = true;
      await administrationApi.toggleStatsOptOut($currentGuild.id);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to toggle stats opt-out:", err);
    } finally {
      saving = false;
    }
  }

  async function deleteAllStats() {
    if (!$currentGuild?.id) return;

    try {
      saving = true;
      await administrationApi.deleteStatsData($currentGuild.id);
      await fetchAllData();
    } catch (err) {
      logger.error("Failed to delete stats data:", err);
    } finally {
      saving = false;
    }
  }
</script>

<div class=" rounded-2xl border p-6 shadow-2xl transition-all"
     in:fly={{ y: 20, duration: 300, delay: 700 }}
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">

  <div class="flex items-center gap-4 mb-6">
    <div class="p-3 rounded-xl"
         style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);">
      <i class="fa-utility-duo fa-regular fa-chart-simple"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
    </div>
    <div>
      <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Statistics & Privacy</h2>
      <p class="text-sm" style="color: {$colorStore.muted}">Manage server statistics collection</p>
    </div>
  </div>

  <div class="space-y-4">
    <!-- Opt-out toggle -->
    <div class="p-4 rounded-xl border"
         style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}20;">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium" style="color: {$colorStore.text}">Statistics Collection</p>
          <p class="text-xs" style="color: {$colorStore.muted}">Opt out to stop collecting server statistics</p>
        </div>
        <button
          class="px-4 py-2 rounded-xl font-medium transition-all hover:scale-[1.02]"
          disabled={saving}
          onclick={toggleStatsOptOut}
          style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;"
        >
          {saving ? 'Processing...' : 'Toggle Opt-Out'}
        </button>
      </div>
    </div>

    <!-- Delete stats data -->
    <div class="p-4 rounded-xl border"
         style="background: {$colorStore.accent}05; border-color: {$colorStore.accent}30;">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p class="font-medium flex items-center gap-2" style="color: {$colorStore.text}">
            <i class="fa-solid fa-triangle-exclamation" style="color: {$colorStore.accent};"></i>
            Delete All Statistics Data
          </p>
          <p class="text-xs" style="color: {$colorStore.muted}">Permanently remove all collected statistics for this
            server</p>
        </div>
        <button
          class="px-4 py-2 rounded-xl font-medium transition-all hover:scale-[1.02] min-w-[120px]"
          disabled={saving}
          onclick={() => showConfirm("Delete All Stats", "This will permanently delete all statistics data for this server. This action cannot be undone!", deleteAllStats, "danger")}
          style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
        >
          Delete Stats
        </button>
      </div>
    </div>
  </div>
</div>
