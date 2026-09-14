<!-- lib/components/analytics/GuildCardView.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { analyticsApi } from "$lib/api/analytics/analytics";
  import type { GuildCard } from "$lib/api/analytics/models";
  import { analyticsFilters, analyticsRefreshTick, timeParams } from "$lib/stores/analyticsFilters";
  import { ago, n, pct, stamp } from "./format";
  import Pill from "./Pill.svelte";
  import BreakdownBar from "./BreakdownBar.svelte";

  interface Props {
    guildId: string;
  }

  let { guildId }: Props = $props();

  let card = $state<GuildCard | null>(null);
  let loading = $state(true);
  let failed = $state(false);
  let seq = 0;

  let featureRows = $derived((card?.features ?? []).map((f) => ({ name: f.feature, value: f.count })));
  let featureErrors = $derived((card?.features ?? []).reduce((a, f) => a + f.errors, 0));
  let featureUses = $derived((card?.features ?? []).reduce((a, f) => a + f.count, 0));

  async function load() {
    const my = ++seq;
    loading = true;
    failed = false;
    try {
      const result = await analyticsApi.guildCard(guildId, timeParams($analyticsFilters));
      if (my !== seq) return;
      card = result ?? null;
    } catch (err) {
      if (my !== seq) return;
      logger.warn("Guild card failed", err);
      card = null;
      failed = true;
    } finally {
      if (my === seq) loading = false;
    }
  }

  $effect(() => {
    void [$analyticsFilters, $analyticsRefreshTick, guildId];
    void load();
  });
</script>

{#if loading && !card}
  <div class="space-y-2">
    {#each [0, 1, 2] as _}
      <div class="h-3 rounded animate-pulse" style="background: {$colorStore.primary}20"></div>
    {/each}
  </div>
{:else if failed || !card}
  <p class="text-xs py-2" style="color: {$colorStore.muted}">No card for {guildId}</p>
{:else}
  <div class="space-y-3">
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-base font-semibold" style="color: {$colorStore.text}">{card.name ?? "unknown"}</span>
      <span class="text-xs font-mono" style="color: {$colorStore.muted}">{card.guildId}</span>
      <Pill tone={card.present ? "ok" : "muted"} text={card.present ? "present" : "gone"} />
      {#if card.shard !== null}<Pill tone="muted" text="shard {card.shard}" />{/if}
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
      <div>
        <p class="text-xs" style="color: {$colorStore.muted}">Members</p>
        <p class="tabular-nums" style="color: {$colorStore.text}">{n(card.memberCount)}</p>
      </div>
      <div>
        <p class="text-xs" style="color: {$colorStore.muted}">Joined</p>
        <p style="color: {$colorStore.text}" title={stamp(card.joinedAt)}>{card.joinedAt ? ago(card.joinedAt) : "—"}</p>
      </div>
      <div>
        <p class="text-xs" style="color: {$colorStore.muted}">Commands in range</p>
        <p class="tabular-nums" style="color: {$colorStore.text}">{n(card.commands)}</p>
      </div>
      <div>
        <p class="text-xs" style="color: {$colorStore.muted}">Events in range</p>
        <p class="tabular-nums" style="color: {$colorStore.text}">{n(card.events)}</p>
      </div>
    </div>
    <div>
      <p class="text-xs uppercase tracking-wide mb-1" style="color: {$colorStore.muted}">
        Features used · {n(featureUses)} uses · {pct(featureUses ? (featureErrors / featureUses) * 100 : 0)} err
      </p>
      <BreakdownBar rows={featureRows} max={12} empty="No feature use in range" />
    </div>
  </div>
{/if}
