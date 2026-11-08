<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import type { Named } from "./loggingModel";

  interface Props {
    channels: Named[];
    ignored: string[];
    ignoreBots: boolean;
    prefixes: string[];
    onignored: (ids: string[]) => void;
    onbots: (value: boolean) => void;
    onprefixes: (prefixes: string[]) => void;
  }

  let { channels, ignored, ignoreBots, prefixes, onignored, onbots, onprefixes }: Props = $props();

  let draft = $state("");

  const draftValue = $derived(draft.trim());
  const canAdd = $derived(draftValue.length > 0 && !prefixes.includes(draftValue));

  function addPrefix() {
    if (!canAdd) return;
    onprefixes([...prefixes, draftValue]);
    draft = "";
  }
</script>

<PluginCard title={m.logging.ignoreTitle()} alwaysOpen>
  <SettingField label={m.logging.ignoredChannels()} id="logging-ignored">
    <DiscordSelector
      id="logging-ignored"
      type="channel"
      multiple
      options={channels}
      selected={ignored}
      placeholder={m.logging.ignoredPlaceholder()}
      onchange={(detail) => onignored(Array.isArray(detail.selected) ? detail.selected : detail.selected ? [detail.selected] : [])}
    />
  </SettingField>

  <ToggleRow checked={ignoreBots} title={m.common.ignoreBots()} colors={$colorStore} onchange={onbots} />

  <SettingField label={m.logging.ignorePrefixes()} id="logging-prefix">
    <div class="flex gap-2">
      <input
        id="logging-prefix"
        type="text"
        bind:value={draft}
        maxlength="20"
        placeholder={m.logging.prefixPlaceholder()}
        class="grow min-w-0 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        onkeydown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addPrefix();
          }
        }}
      >
      <button
        type="button"
        class="px-5 rounded-xl min-h-[50px] font-medium shrink-0 disabled:opacity-50"
        style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        disabled={!canAdd}
        onclick={addPrefix}
      >
        {m.common.add()}
      </button>
    </div>
  </SettingField>

  {#if prefixes.length > 0}
    <div class="flex flex-wrap gap-2">
      {#each prefixes as prefix (prefix)}
        <span
          class="inline-flex items-center gap-1 pl-3 rounded-full text-sm min-h-[44px]"
          style="background: {$colorStore.primary}15; color: {$colorStore.text};"
        >
          <span class="font-mono">{prefix}</span>
          <button
            type="button"
            class="min-h-[44px] min-w-[44px] rounded-full"
            aria-label={m.logging.removePrefixAria({ prefix })}
            onclick={() => onprefixes(prefixes.filter(x => x !== prefix))}
          >
            <i class="fa-solid fa-xmark" aria-hidden="true"></i>
          </button>
        </span>
      {/each}
    </div>
  {/if}
</PluginCard>
