<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { countingApi, type CountingViolationStats } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import StatTile from "$lib/components/analytics/StatTile.svelte";
  import { formatNumber, idString, timeAgo, type Notify } from "./countingModel";

  interface Props {
    guildId: bigint;
    channelId: bigint;
    moderatorId: bigint;
    members: Array<{ id: string; name: string }>;
    notify: Notify;
  }

  let { guildId, channelId, moderatorId, members, notify }: Props = $props();

  let stats = $state<CountingViolationStats | null>(null);
  let hours = $state(24);
  let picked = $state<string | null>(null);
  let pickedCount = $state<number | null>(null);
  let busy = $state(false);

  const windows = $derived([
    { id: "24", name: m.counting.windowDay() },
    { id: "168", name: m.counting.windowWeek() },
    { id: "720", name: m.counting.windowMonth() }
  ]);
  const names = $derived(new Map(members.map((x) => [x.id, x.name])));
  const outline = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function load() {
    try {
      stats = await countingApi.getViolationStats(guildId, channelId, hours);
    } catch (err) {
      logger.error("Failed to load violation stats:", err);
      notify(m.counting.notifyViolationsFailed(), "error");
    }
  }

  async function pick(id: string | null) {
    picked = id;
    pickedCount = null;
    if (!id) return;
    try {
      pickedCount = (await countingApi.getWrongCount(guildId, channelId, BigInt(id))).wrongCount;
    } catch (err) {
      logger.error("Failed to load a wrong count:", err);
    }
  }

  async function clear(id: string) {
    busy = true;
    try {
      await countingApi.clearWrongCount(guildId, channelId, BigInt(id), moderatorId);
      notify(m.counting.notifyWrongCountCleared());
      if (picked === id) pickedCount = 0;
    } catch (err) {
      logger.error("Failed to clear a wrong count:", err);
      notify(m.counting.notifyWrongCountFailed(), "error");
    } finally {
      busy = false;
    }
  }

  onMount(() => {
    void load();
  });
</script>

<PluginCard title={m.counting.violationsTitle()} alwaysOpen>
  <DiscordSelector
    type="custom"
    options={windows}
    selected={String(hours)}
    searchable={false}
    clearable={false}
    customIcon="fa-clock"
    ariaLabel={m.common.window()}
    onchange={({ selected }) => {
      hours = Number(selected);
      void load();
    }}
  />

  {#if stats}
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
      <StatTile label={m.common.total()} value={formatNumber(stats.totalViolations)} />
      <StatTile label={m.counting.violationsWrong()} value={formatNumber(stats.wrongNumberCount)} />
      <StatTile label={m.counting.violationsTimeouts()} value={formatNumber(stats.timeoutCount)} />
      <StatTile label={m.counting.violationsBans()} value={formatNumber(stats.banCount)} />
    </div>

    {#each stats.topViolators as entry (idString(entry.userId))}
      <div class="flex items-center gap-3 rounded-xl border p-2 pl-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <div class="grow min-w-0">
          <div class="text-sm font-medium truncate" style="color: {$colorStore.text}">{names.get(idString(entry.userId)) ?? m.common.userFallback({ id: idString(entry.userId) })}</div>
          <div class="text-xs" style="color: {$colorStore.muted}">{m.counting.violationsCount({ count: entry.violationCount })} · {timeAgo(entry.lastViolation)}</div>
        </div>
        <button type="button" class="px-3 rounded-lg min-h-[44px] text-sm shrink-0 disabled:opacity-50" style={outline} disabled={busy} onclick={() => clear(idString(entry.userId))}>
          {m.counting.clearWrongCount()}
        </button>
      </div>
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.counting.violationsEmpty()}</p>
    {/each}
  {/if}

  <div class="flex gap-3 items-stretch">
    <div class="grow min-w-0">
      <DiscordSelector type="user" options={members} selected={picked} ariaLabel={m.common.member()} onchange={({ selected }) => void pick((selected as string) ?? null)} />
    </div>
    <button
      type="button"
      class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={busy || !picked}
      onclick={() => picked && clear(picked)}
    >
      {m.counting.clearWrongCount()}
    </button>
  </div>
  {#if pickedCount !== null}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.counting.wrongCountNow({ count: pickedCount })}</p>
  {/if}
</PluginCard>
