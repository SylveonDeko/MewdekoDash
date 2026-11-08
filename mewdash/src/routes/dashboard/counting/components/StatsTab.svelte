<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import {
    countingApi,
    LeaderboardType,
    type CountingStatsResponse,
    type CountingUserStatsResponse
  } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import StatTile from "$lib/components/analytics/StatTile.svelte";
  import { formatNumber, timeAgo, type Notify } from "./countingModel";

  interface Props {
    guildId: bigint;
    channelId: bigint;
    notify: Notify;
  }

  let { guildId, channelId, notify }: Props = $props();

  let stats = $state<CountingStatsResponse | null>(null);
  let entries = $state<CountingUserStatsResponse[]>([]);
  let type = $state(LeaderboardType.Contributions);
  let limit = $state(20);
  let loadingBoard = $state(false);

  const typeOptions = $derived([
    { id: String(LeaderboardType.Contributions), name: m.counting.leaderboardContributions() },
    { id: String(LeaderboardType.Streak), name: m.counting.leaderboardHighestStreak() },
    { id: String(LeaderboardType.Accuracy), name: m.counting.leaderboardAccuracy() },
    { id: String(LeaderboardType.TotalNumbers), name: m.counting.leaderboardTotalNumbers() }
  ]);
  const limitOptions = [10, 20, 50, 100].map((n) => ({ id: String(n), name: String(n) }));

  const tiles = $derived(
    stats
      ? [
          { label: m.counting.statsCurrentNumber(), value: formatNumber(stats.channel.currentNumber) },
          { label: m.counting.statsHighestNumber(), value: formatNumber(stats.channel.highestNumber) },
          { label: m.counting.statsTotalParticipants(), value: formatNumber(stats.totalParticipants) },
          { label: m.common.totalErrors(), value: formatNumber(stats.totalErrors) },
          { label: m.counting.statsMilestonesReached(), value: formatNumber(stats.milestonesReached) },
          { label: m.counting.statsAverageAccuracy(), value: `${stats.averageAccuracy.toFixed(1)}%` },
          { label: m.counting.statsLastActivity(), value: timeAgo(stats.lastActivity) },
          { label: m.counting.statsTopContributor(), value: stats.topContributor?.username ?? m.common.none() }
        ]
      : []
  );

  function metric(entry: CountingUserStatsResponse): string {
    switch (type) {
      case LeaderboardType.Streak: return formatNumber(entry.highestStreak);
      case LeaderboardType.Accuracy: return `${entry.accuracy.toFixed(1)}%`;
      case LeaderboardType.TotalNumbers: return formatNumber(entry.totalNumbersCounted);
      default: return formatNumber(entry.contributionsCount);
    }
  }

  async function loadStats() {
    try {
      stats = await countingApi.getCountingStats(guildId, channelId);
    } catch (err) {
      logger.error("Failed to load counting stats:", err);
      notify(m.counting.notifyDetailsFailed(), "error");
    }
  }

  async function loadBoard() {
    loadingBoard = true;
    try {
      entries = (await countingApi.getLeaderboard(guildId, channelId, type, limit)).entries ?? [];
    } catch (err) {
      logger.error("Failed to load the counting leaderboard:", err);
      notify(m.common.failedToLoadLeaderboard(), "error");
    } finally {
      loadingBoard = false;
    }
  }

  onMount(() => {
    void loadStats();
    void loadBoard();
  });
</script>

<div class="space-y-4 min-w-0">
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
    {#each tiles as tile (tile.label)}
      <StatTile label={tile.label} value={tile.value} />
    {/each}
  </div>

  <PluginCard title={m.common.leaderboard()} alwaysOpen>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <DiscordSelector
        type="custom"
        options={typeOptions}
        selected={String(type)}
        searchable={false}
        clearable={false}
        customIcon="fa-sort"
        ariaLabel={m.common.sortBy()}
        onchange={({ selected }) => {
          type = Number(selected) as LeaderboardType;
          void loadBoard();
        }}
      />
      <DiscordSelector
        type="custom"
        options={limitOptions}
        selected={String(limit)}
        searchable={false}
        clearable={false}
        customIcon="fa-list-ul"
        ariaLabel={m.counting.leaderboardLimit()}
        onchange={({ selected }) => {
          limit = Number(selected);
          void loadBoard();
        }}
      />
    </div>

    {#if !loadingBoard && entries.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.counting.leaderboardEmptyTitle()}</p>
    {:else}
      <ol class="space-y-2">
        {#each entries as entry (String(entry.userId))}
          <li class="flex items-center gap-3 p-3 rounded-lg min-w-0" style="background: {$colorStore.primary}08;">
            <span class="w-8 text-center text-sm font-semibold shrink-0" style="color: {$colorStore.muted}">{entry.rank ?? "-"}</span>
            {#if entry.avatarUrl}
              <img src={entry.avatarUrl} alt="" class="w-9 h-9 rounded-full shrink-0" />
            {:else}
              <span class="w-9 h-9 rounded-full shrink-0" style="background: {$colorStore.primary}20;"></span>
            {/if}
            <div class="grow min-w-0">
              <div class="truncate text-sm font-medium" style="color: {$colorStore.text}">{entry.username ?? m.common.unknownUser()}</div>
              <div class="text-xs truncate" style="color: {$colorStore.muted}">
                {m.counting.statContributions({ count: formatNumber(entry.contributionsCount) })} · {m.counting.statBestStreak({ count: formatNumber(entry.highestStreak) })}
              </div>
            </div>
            <span class="text-sm font-semibold tabular-nums shrink-0" style="color: {$colorStore.text}">{metric(entry)}</span>
          </li>
        {/each}
      </ol>
    {/if}
  </PluginCard>
</div>
