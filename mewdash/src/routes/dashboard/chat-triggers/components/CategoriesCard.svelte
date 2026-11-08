<script lang="ts">
  import { m } from "$lib/i18n";
  import { chatTriggersApi, type ChatTrigger } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";

  interface Props {
    guildId: bigint;
    triggers: ChatTrigger[];
    onerror: (message: string) => void;
    onsuccess: (message: string) => void;
  }

  let { guildId, triggers = $bindable(), onerror, onsuccess }: Props = $props();

  let busy: string | null = $state(null);

  const rows = $derived.by(() => {
    const byName = new Map<string, { name: string; total: number; enabled: number }>();
    for (const trigger of triggers) {
      if (!trigger.category?.trim()) continue;
      const entry = byName.get(trigger.category) ?? { name: trigger.category, total: 0, enabled: 0 };
      entry.total++;
      if (!trigger.isDisabled) entry.enabled++;
      byName.set(trigger.category, entry);
    }
    return [...byName.values()].sort((a, b) => a.name.localeCompare(b.name));
  });

  const buttonStyle = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function setCategory(name: string, disabled: boolean) {
    busy = name;
    try {
      const { changed } = await chatTriggersApi.toggleCategory(guildId, name, disabled);
      triggers = triggers.map(t => (t.category === name ? { ...t, isDisabled: disabled } : t));
      onsuccess(disabled ? m.chatTriggers.categoryPaused({ count: changed }) : m.chatTriggers.categoryResumed({ count: changed }));
    } catch (err) {
      logger.error("Failed to update category:", err);
      onerror(err instanceof Error && err.message ? err.message : m.chatTriggers.categoryFailed());
    } finally {
      busy = null;
    }
  }
</script>

{#if rows.length > 0}
  <PluginCard title={m.chatTriggers.cardCategoriesTitle()}>
    <div class="space-y-2">
      {#each rows as row (row.name)}
        <div class="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border p-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="grow min-w-0">
            <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{row.name}</span>
            <span class="block text-xs" style="color: {$colorStore.muted}">{m.chatTriggers.categoryCount({ enabled: row.enabled, total: row.total })}</span>
          </div>
          <button type="button" class="px-5 rounded-lg min-h-[50px] font-medium" style={buttonStyle} disabled={busy === row.name || row.enabled === row.total} onclick={() => setCategory(row.name, false)}>
            {m.chatTriggers.categoryEnableAll()}
          </button>
          <button type="button" class="px-5 rounded-lg min-h-[50px] font-medium" style={buttonStyle} disabled={busy === row.name || row.enabled === 0} onclick={() => setCategory(row.name, true)}>
            {m.chatTriggers.categoryDisableAll()}
          </button>
        </div>
      {/each}
    </div>
  </PluginCard>
{/if}
