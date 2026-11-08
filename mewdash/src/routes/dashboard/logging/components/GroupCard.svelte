<script lang="ts">
  import { slide } from "svelte/transition";
  import { m } from "$lib/i18n";
  import type { LogType } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { eventName, groupName, type LogGroupId, type Named } from "./loggingModel";

  interface Props {
    id: LogGroupId;
    types: readonly LogType[];
    routes: Record<string, string | null>;
    channels: Named[];
    onset: (types: readonly LogType[], channelId: string | null) => void;
  }

  let { id, types, routes, channels, onset }: Props = $props();

  let open = $state(false);

  const values = $derived(types.map(type => routes[type] ?? null));
  const shared = $derived(values.every(value => value === values[0]) ? values[0] : null);
  const mixed = $derived(!values.every(value => value === values[0]));
  const active = $derived(values.filter(Boolean).length);
  const single = $derived(types.length === 1);

  function pick(detail: { selected: string | string[] | null }, scope: readonly LogType[]) {
    const selected = Array.isArray(detail.selected) ? (detail.selected[0] ?? null) : detail.selected;
    onset(scope, selected || null);
  }
</script>

<PluginCard title={groupName(id)} alwaysOpen>
  <div class="min-w-0">
    <DiscordSelector
      type="channel"
      options={channels}
      selected={shared}
      placeholder={mixed ? m.logging.mixedPlaceholder() : m.common.selectChannelPlaceholder()}
      ariaLabel={groupName(id)}
      onchange={(detail) => pick(detail, types)}
    />
  </div>

  {#if !single}
    <div class="rounded-xl border" style="border-color: {$colorStore.primary}20;">
      <button
        type="button"
        class="w-full min-h-[50px] flex items-center gap-3 px-4 text-left rounded-xl"
        style="background: {$colorStore.primary}08;"
        aria-expanded={open}
        onclick={() => (open = !open)}
      >
        <span class="flex-1 text-sm font-medium" style="color: {$colorStore.text}">{m.logging.perEvent()}</span>
        <span class="text-xs px-2 py-0.5 rounded-full font-medium" style="background: {$colorStore.primary}20; color: {$colorStore.text};">
          {m.logging.activeCount({ active, total: types.length })}
        </span>
        <i class="fa-solid {open ? 'fa-chevron-up' : 'fa-chevron-down'}" style="color: {$colorStore.muted}; font-size: 12px;" aria-hidden="true"></i>
      </button>

      {#if open}
        <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-t" style="border-color: {$colorStore.primary}20;" transition:slide={{ duration: 150 }}>
          {#each types as type (type)}
            <div class="min-w-0">
              <span class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{eventName(type)}</span>
              <DiscordSelector
                type="channel"
                options={channels}
                selected={routes[type] ?? null}
                placeholder={m.common.selectChannelPlaceholder()}
                ariaLabel={eventName(type)}
                onchange={(detail) => pick(detail, [type])}
              />
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</PluginCard>
