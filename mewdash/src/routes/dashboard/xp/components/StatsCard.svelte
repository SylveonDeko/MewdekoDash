<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { xpApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, formatDate, formatNumber, idString } from "./xpModel";

  interface Props {
    guildId: bigint;
    onerror: (message: string) => void;
  }

  let { guildId, onerror }: Props = $props();

  type Stats = Awaited<ReturnType<typeof xpApi.getXpServerStats>>;
  let stats = $state<Stats | null>(null);

  onMount(async () => {
    try {
      stats = await xpApi.getXpServerStats(guildId);
    } catch (err) {
      logger.error("Failed to load XP stats:", err);
      onerror(errorText(err, m.xp.errorLoadStats()));
    }
  });

  const tiles = $derived(
    stats
      ? [
          { label: m.xp.statMembers(), value: formatNumber(stats.totalUsers) },
          { label: m.xp.statTotalXp(), value: formatNumber(stats.totalXp) },
          { label: m.xp.statAverageLevel(), value: String(stats.averageLevel) },
          { label: m.xp.statHighestLevel(), value: formatNumber(stats.highestLevel) }
        ]
      : []
  );
</script>

{#if stats}
  <PluginCard title={m.xp.cardOverviewTitle()} alwaysOpen>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {#each tiles as tile (tile.label)}
        <div class="rounded-lg p-3 min-w-0" style="background: {$colorStore.primary}08;">
          <p class="text-xs" style="color: {$colorStore.muted}">{tile.label}</p>
          <p class="text-lg font-semibold truncate tabular-nums" style="color: {$colorStore.text}">{tile.value}</p>
        </div>
      {/each}
    </div>

    {#if stats.recentActivity.length > 0}
      <div class="space-y-2">
        <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.xp.recentActivity()}</h4>
        {#each stats.recentActivity.slice(0, 5) as activity (idString(activity.userId))}
          <div class="flex items-center gap-3 rounded-lg p-2 min-w-0" style="background: {$colorStore.primary}08;">
            {#if activity.avatarUrl}
              <img src={activity.avatarUrl} alt="" class="w-8 h-8 rounded-full shrink-0" loading="lazy" />
            {/if}
            <span class="grow min-w-0 truncate text-sm" style="color: {$colorStore.text}">{activity.username}</span>
            <span class="text-xs shrink-0" style="color: {$colorStore.muted}">{formatDate(activity.timestamp)}</span>
          </div>
        {/each}
      </div>
    {/if}
  </PluginCard>
{/if}
