<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { moderationApi, type ModReasonAlias } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";

  interface Props {
    guildId: bigint;
    onerror: (message: string) => void;
  }

  let { guildId, onerror }: Props = $props();

  let aliases: ModReasonAlias[] = $state([]);
  let name = $state("");
  let reason = $state("");
  let busy = $state(false);

  const valid = $derived(name.trim().length > 0 && name.trim().length <= 32 && !/\s/.test(name.trim()) && reason.trim().length > 0);
  const inputStyle = $derived(
    `background: ${$colorStore.primary}08; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  async function load() {
    try {
      aliases = await moderationApi.getReasonAliases(guildId);
    } catch (err) {
      logger.error("Failed to load reason aliases:", err);
      onerror(m.moderation.aliasesLoadFailed());
    }
  }

  async function add() {
    if (!valid) return;
    busy = true;
    try {
      aliases = await moderationApi.setReasonAlias(guildId, name.trim(), reason.trim());
      name = "";
      reason = "";
    } catch (err) {
      logger.error("Failed to save reason alias:", err);
      onerror(err instanceof Error ? err.message : m.moderation.aliasesSaveFailed());
    } finally {
      busy = false;
    }
  }

  async function remove(alias: ModReasonAlias) {
    try {
      await moderationApi.removeReasonAlias(guildId, alias.name);
      await load();
    } catch (err) {
      logger.error("Failed to remove reason alias:", err);
      onerror(m.moderation.aliasesSaveFailed());
    }
  }

  onMount(() => {
    void load();
  });
</script>

<PluginCard title={m.moderation.aliasesTitle()}>
  <form class="grid grid-cols-1 md:grid-cols-[200px_1fr_auto] gap-3" onsubmit={(e) => { e.preventDefault(); void add(); }}>
    <SettingField label={m.common.name()} id="alias-name">
      <input id="alias-name" type="text" maxlength="32" bind:value={name}
             class="w-full p-3 rounded-lg border min-h-[50px]" style={inputStyle}>
    </SettingField>
    <SettingField label={m.common.reason()} id="alias-reason">
      <input id="alias-reason" type="text" maxlength="500" bind:value={reason}
             class="w-full p-3 rounded-lg border min-h-[50px]" style={inputStyle}>
    </SettingField>
    <div class="flex items-end">
      <button
        type="submit"
        disabled={busy || !valid}
        class="px-6 rounded-xl font-medium flex items-center justify-center gap-2 min-h-[50px] w-full disabled:opacity-50"
        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
      >
        <i class="fa-solid fa-plus" aria-hidden="true"></i>
        {m.common.add()}
      </button>
    </div>
  </form>

  {#if aliases.length === 0}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.moderation.aliasesEmpty()}</p>
  {:else}
    <div class="space-y-2">
      {#each aliases as alias (alias.name)}
        <div class="flex items-start gap-3 p-3 rounded-xl border" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="flex-1 min-w-0">
            <div class="font-medium" style="color: {$colorStore.text}">{alias.name}</div>
            <p class="text-sm break-words" style="color: {$colorStore.muted}">{alias.reason}</p>
          </div>
          <button
            class="p-2 rounded-lg min-h-[44px] min-w-[44px]"
            style="background: {$colorStore.primary}10; color: {$colorStore.muted};"
            aria-label={m.common.delete()}
            title={m.common.delete()}
            onclick={() => remove(alias)}
          >
            <i class="fa-solid fa-trash" style="font-size: 14px;" aria-hidden="true"></i>
          </button>
        </div>
      {/each}
    </div>
  {/if}
</PluginCard>
