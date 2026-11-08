<script lang="ts">
  import { m } from "$lib/i18n";
  import { chatTriggersApi } from "$lib/api/index.ts";
  import type { TriggerCounter } from "$lib/api/chattriggers/chattriggers";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";

  interface Props {
    guildId: bigint;
    counters: TriggerCounter[];
    autoSave: AutoSave;
    onerror: (message: string) => void;
  }

  let { guildId, counters = $bindable(), autoSave, onerror }: Props = $props();

  let newName = $state("");
  let newValue = $state("0");
  let values: Record<string, string> = $state({});

  const rows = $derived.by(() => {
    const byName = new Map<string, { name: string; value: number | null; members: number }>();
    for (const counter of counters) {
      const entry = byName.get(counter.name) ?? { name: counter.name, value: null, members: 0 };
      if (String(counter.userId) === "0") entry.value = Number(counter.value);
      else entry.members++;
      byName.set(counter.name, entry);
    }
    return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  });

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  async function refresh() {
    counters = await chatTriggersApi.getCounters(guildId);
    values = {};
  }

  function parse(raw: string): number | null {
    const parsed = Math.trunc(Number(raw));
    return raw.trim() === "" || Number.isNaN(parsed) ? null : parsed;
  }

  async function add() {
    const name = newName.trim().toLowerCase();
    const value = parse(newValue);
    if (!name || value === null) return;
    try {
      await chatTriggersApi.setCounter(guildId, name, value);
      newName = "";
      newValue = "0";
      await refresh();
    } catch (err) {
      logger.error("Failed to save counter:", err);
      onerror(err instanceof Error && err.message ? err.message : m.chatTriggers.counterSaveFailed());
    }
  }

  function queueValue(name: string) {
    autoSave.schedule(`counter:${name}`, async () => {
      const value = parse(values[name] ?? "");
      if (value === null) return;
      await chatTriggersApi.setCounter(guildId, name, value);
      await refresh();
    });
  }

  async function remove(name: string) {
    const confirmed = await requestConfirmation({
      message: m.chatTriggers.counterDeleteConfirm({ name }),
      confirmText: m.common.delete()
    });
    if (!confirmed) return;
    try {
      await chatTriggersApi.deleteCounter(guildId, name);
      await refresh();
    } catch (err) {
      logger.error("Failed to delete counter:", err);
      onerror(err instanceof Error && err.message ? err.message : m.chatTriggers.counterDeleteFailed());
    }
  }
</script>

<PluginCard title={m.chatTriggers.cardCountersTitle()}>
  <div class="flex flex-col sm:flex-row sm:items-end gap-3">
    <div class="grow">
      <SettingField label={m.common.name()} id="ct-counter-new-name">
        <input
          id="ct-counter-new-name"
          type="text"
          bind:value={newName}
          placeholder={m.chatTriggers.counterNewPlaceholder()}
          onkeydown={(e) => e.key === "Enter" && add()}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
      </SettingField>
    </div>
    <div class="sm:w-40">
      <SettingField label={m.common.value()} id="ct-counter-new-value">
        <input
          id="ct-counter-new-value"
          type="number"
          bind:value={newValue}
          onkeydown={(e) => e.key === "Enter" && add()}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
      </SettingField>
    </div>
    <button
      type="button"
      class="flex items-center justify-center gap-2 px-6 rounded-xl min-h-[50px] font-medium"
      style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
      disabled={!newName.trim()}
      onclick={add}
    >
      <i class="fa-solid fa-plus" aria-hidden="true"></i>
      {m.common.add()}
    </button>
  </div>

  {#if rows.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.chatTriggers.countersEmpty()}</p>
  {:else}
    <div class="space-y-2">
      {#each rows as row (row.name)}
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border p-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="grow min-w-0">
            <span class="block font-mono text-sm font-semibold truncate" style="color: {$colorStore.text}">{row.name}</span>
            {#if row.members > 0}
              <span class="block text-xs" style="color: {$colorStore.muted}">{m.chatTriggers.counterMembers({ count: row.members })}</span>
            {/if}
          </div>
          {#if row.value !== null}
            <input
              type="number"
              value={values[row.name] ?? String(row.value)}
              oninput={(e) => {
                values[row.name] = e.currentTarget.value;
                queueValue(row.name);
              }}
              onblur={() => autoSave.flush(`counter:${row.name}`)}
              aria-label={m.chatTriggers.counterValueAria({ name: row.name })}
              class="sm:w-40 p-3 rounded-lg border focus:ring-2 min-h-[50px]"
              style={inputStyle}
            >
          {/if}
          <button
            type="button"
            class="px-4 rounded-lg min-h-[50px]"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
            aria-label={m.chatTriggers.counterDeleteAria({ name: row.name })}
            onclick={() => remove(row.name)}
          >
            <i class="fa-solid fa-trash" aria-hidden="true"></i>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</PluginCard>
