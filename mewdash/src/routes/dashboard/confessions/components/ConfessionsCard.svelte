<script lang="ts">
  import { m } from "$lib/i18n";
  import { confessionsApi, type Confession, type ConfessionStats } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, formatDate, idString } from "./confessionsModel";

  interface Props {
    guildId: bigint;
    confessions: Confession[];
    stats: ConfessionStats | null;
    onreload: () => Promise<void>;
    onerror: (message: string) => void;
  }

  const PAGE = 25;

  let { guildId, confessions, stats, onreload, onerror }: Props = $props();

  let query = $state("");
  let shown = $state(PAGE);
  let open = $state<Set<number>>(new Set());

  const matches = $derived.by(() => {
    const needle = query.trim().toLowerCase().replace(/^#/, "");
    const sorted = [...confessions].sort((a, b) => Number(b.confessNumber) - Number(a.confessNumber));
    if (!needle) return sorted;
    return sorted.filter(
      (item) => idString(item.confessNumber) === needle || (item.confession1 ?? "").toLowerCase().includes(needle)
    );
  });

  const tiles = $derived(
    stats
      ? [
          { label: m.confessions.pageStatTotal(), value: stats.totalConfessions },
          { label: m.confessions.pageStatMonth(), value: stats.confessionsThisMonth },
          { label: m.common.today(), value: stats.confessionsToday },
          { label: m.confessions.pageStatLatest(), value: Number(stats.lastConfessionNumber) }
        ]
      : []
  );

  function toggle(id: number) {
    const next = new Set(open);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    open = next;
  }

  function link(item: Confession): string {
    return `https://discord.com/channels/${guildId}/${item.channelId}/${item.messageId}`;
  }

  async function remove(item: Confession) {
    const number = idString(item.confessNumber);
    const ok = await requestConfirmation({ message: m.confessions.pageConfirmDelete({ number }), confirmText: m.common.delete() });
    if (!ok) return;
    try {
      await confessionsApi.deleteConfession(guildId, item.confessNumber);
      await onreload();
    } catch (err) {
      logger.error("Failed to delete confession:", err);
      onerror(errorText(err, m.confessions.pageErrorDelete()));
    }
  }

  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );
</script>

<PluginCard title={m.confessions.pageListTitle({ count: confessions.length })} alwaysOpen>
  {#if tiles.length > 0}
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {#each tiles as tile (tile.label)}
        <div class="rounded-xl border p-3 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="text-xs truncate" style="color: {$colorStore.muted}">{tile.label}</div>
          <div class="text-xl font-semibold" style="color: {$colorStore.text}">{new Intl.NumberFormat().format(tile.value)}</div>
        </div>
      {/each}
    </div>
  {/if}

  <input
    type="search"
    bind:value={query}
    oninput={() => (shown = PAGE)}
    placeholder={m.confessions.searchPlaceholder()}
    aria-label={m.common.search()}
    class="w-full p-3 rounded-lg border min-h-[50px]"
    style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
  />

  {#if matches.length === 0}
    <p class="py-6 text-center" style="color: {$colorStore.muted}">
      {confessions.length === 0 ? m.confessions.pageListEmptyTitle() : m.confessions.noMatches()}
    </p>
  {:else}
    <div class="space-y-2">
      {#each matches.slice(0, shown) as item (item.id)}
        {@const text = item.confession1 || m.confessions.pageNoContent()}
        {@const expanded = open.has(item.id)}
        <div class="rounded-xl border p-2 sm:p-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="flex items-start gap-2">
            <button
              type="button"
              class="grow min-w-0 text-left min-h-[44px]"
              aria-expanded={expanded}
              onclick={() => toggle(item.id)}
            >
              <span class="block text-sm font-semibold" style="color: {$colorStore.text}">
                {m.confessions.pageItemTitle({ number: idString(item.confessNumber) })}
                <span class="font-normal" style="color: {$colorStore.muted}">{formatDate(item.dateAdded)}</span>
              </span>
              <span class="block text-sm mt-1 break-words {expanded ? 'whitespace-pre-wrap' : 'line-clamp-2'}" style="color: {$colorStore.text}">{text}</span>
            </button>
            <a
              href={link(item)}
              target="_blank"
              rel="noopener noreferrer"
              class="shrink-0 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              style={iconButton}
              aria-label={m.confessions.openMessageAria()}
            >
              <i class="fa-solid fa-arrow-up-right-from-square" aria-hidden="true"></i>
            </a>
            <button
              type="button"
              class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
              style={iconButton}
              aria-label={m.confessions.pageDeleteAria()}
              onclick={() => remove(item)}
            >
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      {/each}
    </div>

    {#if matches.length > shown}
      <button
        type="button"
        class="w-full rounded-xl min-h-[50px] font-medium"
        style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        onclick={() => (shown += PAGE)}
      >
        {m.common.showMore()}
      </button>
    {/if}
  {/if}
</PluginCard>
