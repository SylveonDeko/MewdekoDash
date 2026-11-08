<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";

  interface Props {
    id: string;
    label: string;
    items: string[];
    max?: number;
    maxLength: number;
    mono?: boolean;
    onchange: (items: string[]) => void;
  }

  let { id, label, items, max, maxLength, mono = false, onchange }: Props = $props();

  let draft = $state("");

  const full = $derived(max !== undefined && items.length >= max);
  const heading = $derived(max === undefined ? `${label} (${items.length})` : `${label} (${items.length} / ${max})`);

  function add() {
    const entries = draft
      .split(/[\n,]/)
      .map((x) => x.trim())
      .filter((x) => x && x.length <= maxLength && !items.includes(x));
    if (entries.length === 0) return;
    const next = [...items, ...new Set(entries)];
    onchange(max === undefined ? next : next.slice(0, max));
    draft = "";
  }
</script>

<SettingField label={heading} id="{id}-input">
  <form
    class="flex gap-3 items-stretch"
    onsubmit={(event) => {
      event.preventDefault();
      add();
    }}
  >
    <input
      id="{id}-input"
      type="text"
      bind:value={draft}
      maxlength={mono ? undefined : maxLength}
      disabled={full}
      class="grow min-w-0 p-3 rounded-lg border min-h-[50px] disabled:opacity-50 {mono ? 'font-mono' : ''}"
      style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    >
    <button
      type="submit"
      class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={full || !draft.trim()}
    >
      {m.common.add()}
    </button>
  </form>
</SettingField>

{#if items.length > 0}
  <div class="flex flex-wrap gap-2 max-h-64 overflow-y-auto overscroll-contain">
    {#each items as item (item)}
      <span
        class="inline-flex items-center gap-1 pl-3 rounded-lg text-sm min-w-0 max-w-full"
        style="background: {$colorStore.primary}15; color: {$colorStore.text};"
      >
        <span class="truncate {mono ? 'font-mono' : ''}">{item}</span>
        <button
          type="button"
          class="min-h-[44px] min-w-[44px] rounded-lg"
          aria-label={m.common.ariaRemoveWord({ word: item })}
          onclick={() => onchange(items.filter((x) => x !== item))}
        >
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </span>
    {/each}
  </div>
{/if}
