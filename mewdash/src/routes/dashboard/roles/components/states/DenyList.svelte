<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";

  interface Props {
    title: string;
    type: "role" | "user";
    ids: string[];
    options: Array<{ id: string; name: string }>;
    names: Map<string, string>;
    emptyText: string;
    removeLabel: string;
    placeholder: string;
    disabled?: boolean;
    onadd: (id: string) => void;
    onremove: (id: string) => void;
  }

  let { title, type, ids, options, names, emptyText, removeLabel, placeholder, disabled = false, onadd, onremove }: Props =
    $props();

  let picked: string | null = $state(null);

  function add() {
    if (!picked) return;
    const id = picked;
    picked = null;
    onadd(id);
  }
</script>

<PluginCard {title} alwaysOpen>
  <div class="space-y-2">
    {#each ids as id (id)}
      <div class="flex items-center gap-3 rounded-xl border p-2 pl-3 min-w-0"
           style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <span class="grow min-w-0 truncate text-sm" style="color: {$colorStore.text}">{names.get(id) ?? id}</span>
        <button type="button" class="rounded-lg min-h-[44px] min-w-[44px] shrink-0 disabled:opacity-50"
                style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                aria-label="{removeLabel}: {names.get(id) ?? id}" {disabled} onclick={() => onremove(id)}>
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      </div>
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{emptyText}</p>
    {/each}
  </div>
  <div class="flex gap-3 items-stretch">
    <div class="grow min-w-0">
      <DiscordSelector {type} options={options.filter((x) => !ids.includes(x.id))} selected={picked} {placeholder}
                       ariaLabel={title} {disabled}
                       onchange={({ selected }) => (picked = (selected as string) ?? null)} />
    </div>
    <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
            style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
            disabled={disabled || !picked} onclick={add}>
      {m.common.add()}
    </button>
  </div>
</PluginCard>
