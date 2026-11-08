<script lang="ts">
  import { m } from "$lib/i18n";
  import { highlightsApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { formatDate, type HighlightRow, type Member, type Named } from "./highlightsModel";

  interface Props {
    guildId: bigint;
    member: Member;
    channels: Named[];
    onclose: () => void;
    onremoveword: (row: HighlightRow) => void;
    onremoveall: (member: Member) => void;
  }

  let { guildId, member, channels, onclose, onremoveword, onremoveall }: Props = $props();

  let settings = $state<{ highlightsEnabled: boolean; ignoredChannels: string[]; ignoredUsers: string[] } | null>(null);

  const title = $derived(member.username ?? m.common.userFallback({ id: member.userId }));

  const ignoredChannelNames = $derived(
    (settings?.ignoredChannels ?? []).map(id => channels.find(channel => channel.id === id)?.name ?? id)
  );

  $effect(() => {
    const id = member.userId;
    settings = null;
    highlightsApi
      .getUserHighlightSettings(guildId, BigInt(id))
      .then(value => {
        if (member.userId === id) settings = value;
      })
      .catch(err => logger.error("Failed to load highlight settings:", err));
  });
</script>

<Sheet {title} {onclose}>
  {#snippet actions()}
    <button
      type="button"
      class="px-4 rounded-lg min-h-[44px] text-sm font-medium"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
      onclick={() => onremoveall(member)}
    >
      {m.highlights.pageDeleteAll()}
    </button>
  {/snippet}

  <div class="space-y-2">
    {#each member.words as row (row.id)}
      <div class="flex items-center gap-2 rounded-xl border p-2 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <div class="grow min-w-0 px-1">
          <span class="block text-sm font-semibold break-words" style="color: {$colorStore.text}">{row.word}</span>
          {#if row.dateAdded}
            <span class="block text-xs" style="color: {$colorStore.muted}">{formatDate(row.dateAdded)}</span>
          {/if}
        </div>
        <button
          type="button"
          class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
          style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
          aria-label={m.highlights.deleteWordAria({ word: row.word })}
          onclick={() => onremoveword(row)}
        >
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    {/each}
  </div>

  {#if settings}
    <div class="space-y-3 rounded-xl p-3" style="background: {$colorStore.primary}08;">
      <p class="text-sm font-medium" style="color: {$colorStore.text}">
        {settings.highlightsEnabled ? m.highlights.statusOn() : m.highlights.statusPaused()}
      </p>
      <p class="text-sm" style="color: {$colorStore.muted}">
        {m.highlights.ignoredChannels()}: {ignoredChannelNames.length ? ignoredChannelNames.map(name => `#${name}`).join(", ") : m.common.none()}
      </p>
      <p class="text-sm" style="color: {$colorStore.muted}">
        {m.highlights.ignoredMembers()}: {settings.ignoredUsers.length}
      </p>
    </div>
  {/if}
</Sheet>
