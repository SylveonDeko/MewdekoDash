<script lang="ts">
  import { m } from "$lib/i18n";
  import { pollApi, type PollAnalyticsResponse } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import StatTile from "$lib/components/analytics/StatTile.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { typeLabel } from "./pollModel";

  interface Props {
    guildId: bigint;
    version: number;
  }

  let { guildId, version }: Props = $props();

  let analytics: PollAnalyticsResponse | null = $state(null);
  let loaded = $state(false);

  const days = $derived.by(() => {
    const current = analytics as PollAnalyticsResponse | null;
    return current ? Object.entries(current.pollsCreatedByDay).sort(([a], [b]) => a.localeCompare(b)) : [];
  });
  const max = $derived(Math.max(1, ...days.map(([, count]) => Number(count))));

  async function load() {
    try {
      analytics = await pollApi.getAnalytics(guildId, "month");
    } catch (err) {
      logger.error("Failed to load poll analytics:", err);
    } finally {
      loaded = true;
    }
  }

  $effect(() => {
    void version;
    void load();
  });
</script>

<PluginCard title={m.features.analyticsName()} alwaysOpen>
  {#if analytics}
    <div class="grid grid-cols-2 gap-3">
      <StatTile label={m.polls.analyticsPolls()} value={String(analytics.totalPolls)} sub={m.common.activeCount({ count: analytics.activePolls })} />
      <StatTile label={m.polls.analyticsVotes()} value={String(analytics.totalVotes)} />
      <StatTile label={m.polls.analyticsAvg()} value={String(Math.round(analytics.averageVotesPerPoll * 10) / 10)} />
      <StatTile label={m.polls.analyticsFavourite()} value={typeLabel(analytics.mostPopularPollType)} />
    </div>
    {#if days.length > 0}
      <div class="space-y-2">
        <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.polls.analyticsPerDay()}</h4>
        <div class="flex items-end gap-1 h-32" role="img" aria-label={m.polls.analyticsPerDay()}>
          {#each days as [day, count] (day)}
            <div class="flex-1 min-w-[4px] rounded-t-sm" title={`${new Date(day).toLocaleDateString()}: ${count}`} style="height: {Math.max(4, (count / max) * 100)}%; background: {$colorStore.selectedBorder};"></div>
          {/each}
        </div>
      </div>
    {/if}
  {:else if loaded}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.polls.analyticsEmpty()}</p>
  {/if}
</PluginCard>
