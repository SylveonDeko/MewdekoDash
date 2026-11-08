<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { clientApi, reputationApi } from "$lib/api/index.ts";
  import type { RepStats } from "$lib/api/reputation/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import StatTile from "$lib/components/analytics/StatTile.svelte";
  import { formatNumber, idString, utcDate, type Notify } from "./repModel";

  interface Props {
    guildId: bigint;
    notify: Notify;
  }

  let { guildId, notify }: Props = $props();

  let stats = $state<RepStats | null>(null);
  let loaded = $state(false);
  let names = $state(new Map<string, string>());

  function nameOf(id: unknown): string {
    const key = idString(id);
    return names.get(key) ?? m.common.userFallback({ id: key });
  }

  onMount(() => {
    reputationApi
      .getReputationStats(guildId)
      .then((value) => (stats = value))
      .catch((err) => {
        logger.error("Failed to load reputation stats:", err);
        notify(m.reputation.errorLoad(), "error");
      })
      .finally(() => (loaded = true));
    clientApi
      .getMembers(guildId)
      .then((list) => (names = new Map(list.map((x) => [idString(x.id), x.username ?? idString(x.id)]))))
      .catch(() => {});
  });
</script>

<div class="space-y-4 min-w-0">
  {#if stats}
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
      <StatTile label={m.common.totalUsers()} value={formatNumber(stats.totalUsers)} sub={m.reputation.statUsersSubtitle()} />
      <StatTile label={m.reputation.statGiven()} value={formatNumber(stats.totalRepGiven)} sub={m.common.allTimeLower()} />
      <StatTile label={m.common.transactions()} value={formatNumber(stats.totalTransactions)} sub={m.reputation.statTransactionsSubtitle()} />
      <StatTile label={m.reputation.statAverage()} value={formatNumber(stats.averageRepPerUser)} sub={m.reputation.statAverageSubtitle()} />
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
      <PluginCard title={m.reputation.recentTitle()} alwaysOpen>
        {#each stats.recentActivity as item (`${idString(item.fromUserId)}-${idString(item.toUserId)}-${item.timestamp}`)}
          <div class="p-3 rounded-lg text-sm min-w-0" style="background: {$colorStore.primary}08;">
            <div class="flex items-center justify-between gap-3">
              <span class="truncate" style="color: {$colorStore.text}">{m.reputation.recentLine({ from: nameOf(item.fromUserId), to: nameOf(item.toUserId) })}</span>
              <span class="font-semibold tabular-nums shrink-0" style="color: {$colorStore.text}">{item.amount > 0 ? "+" : ""}{item.amount}</span>
            </div>
            {#if item.reason}
              <div class="text-xs mt-0.5 break-words" style="color: {$colorStore.muted}">{item.reason}</div>
            {/if}
            <div class="text-xs mt-1" style="color: {$colorStore.muted}">{utcDate(item.timestamp).toLocaleString()}</div>
          </div>
        {:else}
          <p class="text-sm" style="color: {$colorStore.muted}">{m.reputation.historyEmpty()}</p>
        {/each}
      </PluginCard>

      <PluginCard title={m.reputation.giversTitle()} alwaysOpen>
        {#each stats.topGivers as giver, index (idString(giver.userId))}
          <div class="flex items-center gap-3 p-3 rounded-lg min-w-0" style="background: {$colorStore.primary}08;">
            <span class="w-6 text-center text-sm font-semibold shrink-0" style="color: {$colorStore.muted}">{index + 1}</span>
            <span class="grow min-w-0 truncate text-sm" style="color: {$colorStore.text}">{nameOf(giver.userId)}</span>
            <span class="text-sm font-semibold tabular-nums shrink-0" style="color: {$colorStore.text}">{formatNumber(giver.totalGiven)}</span>
          </div>
        {:else}
          <p class="text-sm" style="color: {$colorStore.muted}">{m.reputation.historyEmpty()}</p>
        {/each}
      </PluginCard>
    </div>
  {:else if loaded}
    <p class="text-sm px-1" style="color: {$colorStore.muted}">{m.reputation.statsEmptyHint()}</p>
  {/if}
</div>
