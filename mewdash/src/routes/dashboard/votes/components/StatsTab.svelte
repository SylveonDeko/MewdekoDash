<script lang="ts">
  import { m } from "$lib/i18n";
  import { votesApi, type VoteLeaderboardEntry, type VoteSummary } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, formatDate, type Notify } from "./votesModel";

  interface Props {
    guildId: bigint;
    notify: Notify;
  }

  let { guildId, notify }: Props = $props();

  let summary = $state<VoteSummary | null>(null);
  let leaderboard: VoteLeaderboardEntry[] = $state([]);
  let loading = $state(true);

  const tiles = $derived(
    summary
      ? [
          { label: m.votes.pageStatTotal(), value: summary.totalVotes },
          { label: m.votes.thisMonth(), value: summary.votesThisMonth },
          { label: m.votes.voters(), value: summary.uniqueVoters }
        ]
      : []
  );

  function name(userId: bigint | string, username?: string | null): string {
    return username ?? m.common.userFallback({ id: String(userId) });
  }

  async function load() {
    const results = await Promise.allSettled([votesApi.getVoteSummary(guildId), votesApi.getVoteLeaderboard(guildId, 10)]);
    if (results[0].status === "fulfilled") summary = results[0].value;
    if (results[1].status === "fulfilled") leaderboard = results[1].value;
    for (const result of results) {
      if (result.status === "rejected") {
        logger.error("Failed to load vote stats:", result.reason);
        notify(errorText(result.reason, m.votes.pageErrorLoad()), "error");
        break;
      }
    }
    loading = false;
  }

  void load();
</script>

{#if loading}
  <div class="flex justify-center py-6">
    <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
  </div>
{:else if summary}
  <PluginCard title={m.common.statistics()} alwaysOpen>
    <div class="grid grid-cols-1 min-[420px]:grid-cols-3 gap-3">
      {#each tiles as tile (tile.label)}
        <div class="rounded-lg p-3 min-w-0" style="background: {$colorStore.primary}08;">
          <p class="text-xs" style="color: {$colorStore.muted}">{tile.label}</p>
          <p class="text-lg font-semibold tabular-nums" style="color: {$colorStore.text}">{tile.value}</p>
        </div>
      {/each}
    </div>
  </PluginCard>

  <PluginCard title={m.votes.pageLeaderboardTitle()} alwaysOpen>
    {#if leaderboard.length === 0}
      <p class="py-6 text-center" style="color: {$colorStore.muted}">{m.votes.pageLeaderboardEmptyTitle()}</p>
    {:else}
      <div class="space-y-2">
        {#each leaderboard as entry, index (String(entry.userId))}
          <div class="flex items-center gap-3 rounded-lg p-3 min-w-0" style="background: {$colorStore.primary}08;">
            <span class="w-6 shrink-0 text-sm tabular-nums" style="color: {$colorStore.muted}">{index + 1}</span>
            <span class="grow min-w-0 truncate text-sm" style="color: {$colorStore.text}">{name(entry.userId, entry.username)}</span>
            <span class="shrink-0 text-sm tabular-nums" style="color: {$colorStore.muted}">
              {entry.voteCount === 1 ? m.common.votesOne({ count: entry.voteCount }) : m.common.votesOther({ count: entry.voteCount })}
            </span>
          </div>
        {/each}
      </div>
    {/if}
  </PluginCard>

  {#if summary.recent.length > 0}
    <PluginCard title={m.votes.recentTitle()} alwaysOpen>
      <div class="space-y-2">
        {#each summary.recent as vote, index (`${vote.userId}:${index}`)}
          <div class="flex items-center justify-between gap-3 rounded-lg p-3 min-w-0" style="background: {$colorStore.primary}08;">
            <span class="min-w-0 truncate text-sm" style="color: {$colorStore.text}">{name(vote.userId, vote.username)}</span>
            <span class="shrink-0 text-xs" style="color: {$colorStore.muted}">{formatDate(vote.dateAdded)}</span>
          </div>
        {/each}
      </div>
    </PluginCard>
  {/if}
{/if}
