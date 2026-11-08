<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { reputationApi } from "$lib/api/index.ts";
  import type { RepLeaderboardEntry } from "$lib/api/reputation/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import HistorySheet from "./HistorySheet.svelte";
  import { formatNumber, idString, type Notify } from "./repModel";

  interface Props {
    guildId: bigint;
    adminId: string | null;
    notify: Notify;
  }

  let { guildId, adminId, notify }: Props = $props();

  const pageSize = 20;
  let entries = $state<RepLeaderboardEntry[]>([]);
  let page = $state(1);
  let loading = $state(true);
  let viewing = $state<RepLeaderboardEntry | null>(null);

  const outline = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function load(next: number) {
    if (next < 1) return;
    loading = true;
    try {
      entries = (await reputationApi.getLeaderboard(guildId, next, pageSize)) ?? [];
      page = next;
    } catch (err) {
      logger.error("Failed to load the reputation leaderboard:", err);
      notify(m.common.failedToLoadLeaderboard(), "error");
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    void load(1);
  });
</script>

<div class="space-y-4 min-w-0">
  <PluginCard title={m.reputation.leaderboardHeading()} alwaysOpen>
    {#if !loading && entries.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.reputation.leaderboardEmptyTitle()}</p>
    {/if}

    <ol class="space-y-2">
      {#each entries as entry (idString(entry.userId))}
        <li class="flex items-center gap-3 p-2 pl-3 rounded-lg min-w-0" style="background: {$colorStore.primary}08;">
          <span class="w-8 text-center text-sm font-semibold shrink-0" style="color: {$colorStore.muted}">{entry.rank}</span>
          <div class="grow min-w-0">
            <div class="truncate text-sm font-medium" style="color: {$colorStore.text}">{entry.username}</div>
            <div class="text-xs" style="color: {$colorStore.muted}">{formatNumber(entry.reputation)} {m.reputation.reputationUnit()}</div>
          </div>
          <button
            type="button"
            class="rounded-lg min-h-[44px] min-w-[44px] shrink-0"
            style={outline}
            aria-label={m.reputation.viewHistoryAria({ username: entry.username })}
            title={m.reputation.viewHistory()}
            onclick={() => (viewing = entry)}
          >
            <i class="fa-solid fa-clock-rotate-left" aria-hidden="true"></i>
          </button>
        </li>
      {/each}
    </ol>

    {#if entries.length > 0 || page > 1}
      <div class="flex items-center justify-between gap-3">
        <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm disabled:opacity-40" style={outline} disabled={page <= 1 || loading} onclick={() => load(page - 1)}>{m.common.previous()}</button>
        <span class="text-sm" style="color: {$colorStore.muted}">{m.common.pageNumber({ page })}</span>
        <button type="button" class="px-4 rounded-lg min-h-[44px] text-sm disabled:opacity-40" style={outline} disabled={entries.length < pageSize || loading} onclick={() => load(page + 1)}>{m.common.next()}</button>
      </div>
    {/if}
  </PluginCard>
</div>

{#if viewing}
  <HistorySheet {guildId} entry={viewing} {adminId} {notify} onclose={() => (viewing = null)} onchanged={() => load(page)} />
{/if}
