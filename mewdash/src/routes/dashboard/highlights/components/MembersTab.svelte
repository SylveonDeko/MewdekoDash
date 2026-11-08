<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { groupByMember, knownName, type HighlightRow, type Member } from "./highlightsModel";

  interface Props {
    rows: HighlightRow[];
    loading: boolean;
    onopen: (member: Member) => void;
    onremoveall: (member: Member) => void;
  }

  let { rows, loading, onopen, onremoveall }: Props = $props();

  let filter = $state("");

  const members = $derived(groupByMember(rows));

  const shown = $derived.by(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return members;
    return members.filter(
      member =>
        (knownName(member.username) ?? "").toLowerCase().includes(needle) ||
        member.userId.includes(needle) ||
        member.words.some(row => row.word.toLowerCase().includes(needle))
    );
  });

  function label(member: Member): string {
    return member.username ?? m.common.userFallback({ id: member.userId });
  }

  function preview(member: Member): string {
    return member.words
      .slice(0, 4)
      .map(row => row.word)
      .join(", ");
  }
</script>

<PluginCard title={m.highlights.membersTitle({ count: members.length })} alwaysOpen>
  <input
    type="search"
    bind:value={filter}
    placeholder={m.highlights.filterPlaceholder()}
    aria-label={m.highlights.filterAria()}
    class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
    style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
  >

  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if members.length === 0}
    <div class="flex flex-col items-center gap-3 py-8 text-center">
      <i class="fa-solid fa-bolt" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
      <p style="color: {$colorStore.muted}">{m.highlights.pageAllEmptyTitle()}</p>
    </div>
  {:else if shown.length === 0}
    <p class="py-6 text-center" style="color: {$colorStore.muted}">{m.highlights.noMatch()}</p>
  {:else}
    <div class="space-y-2">
      {#each shown as member (member.userId)}
        <div class="flex items-center gap-2 rounded-xl border p-2 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <button type="button" class="grow min-w-0 text-left min-h-[44px] px-1" onclick={() => onopen(member)}>
            <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{label(member)}</span>
            <span class="block text-sm truncate" style="color: {$colorStore.muted}">
              {member.words.length === 1
                ? m.highlights.pageUserHighlightsOne({ count: member.words.length })
                : m.highlights.pageUserHighlightsOther({ count: member.words.length })}: {preview(member)}
            </span>
          </button>
          <button
            type="button"
            class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            aria-label={m.highlights.removeAllAria({ name: label(member) })}
            onclick={() => onremoveall(member)}
          >
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</PluginCard>
