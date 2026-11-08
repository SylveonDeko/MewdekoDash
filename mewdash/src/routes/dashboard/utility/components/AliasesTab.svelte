<script lang="ts">
  import { onMount } from "svelte";
  import { m } from "$lib/i18n";
  import { utilityApi, type CommandAlias } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { errorText, type TabProps } from "./utilityModel";

  let { guildId, onerror }: TabProps = $props();

  let aliases: CommandAlias[] = $state([]);
  let trigger = $state("");
  let mapping = $state("");
  let search = $state("");
  let busy = $state(false);

  const needle = $derived(search.trim().toLowerCase());
  const shown = $derived(
    aliases.filter((a) => !needle || a.trigger.includes(needle) || a.mapping.toLowerCase().includes(needle))
  );
  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
  const iconButton = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function load() {
    try {
      aliases = await utilityApi.getAliases(guildId);
    } catch (err) {
      logger.error("Failed to load aliases:", err);
      onerror(errorText(err, m.utility.aliasesLoadFailed()));
    }
  }

  async function run(action: () => Promise<unknown>, failure: string): Promise<boolean> {
    busy = true;
    try {
      await action();
      await load();
      return true;
    } catch (err) {
      logger.error(failure, err);
      onerror(errorText(err, failure));
      return false;
    } finally {
      busy = false;
    }
  }

  async function add() {
    if (!trigger.trim() || !mapping.trim()) return;
    if (await run(() => utilityApi.addAlias(guildId, trigger.trim(), mapping.trim()), m.utility.aliasesAddFailed())) {
      trigger = "";
      mapping = "";
    }
  }

  async function clearAll() {
    const confirmed = await requestConfirmation({
      message: m.utility.aliasesClearConfirm({ count: aliases.length }),
      confirmText: m.common.clearAll()
    });
    if (confirmed) await run(() => utilityApi.clearAliases(guildId), m.utility.aliasesClearFailed());
  }

  onMount(load);
</script>

<PluginCard title={m.utility.aliasesCardTitle()} alwaysOpen>
  <form
    class="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3"
    onsubmit={(e) => {
      e.preventDefault();
      void add();
    }}
  >
    <input
      type="text"
      bind:value={trigger}
      maxlength="50"
      placeholder={m.utility.aliasesTriggerPlaceholder()}
      aria-label={m.utility.aliasesTriggerAria()}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style={inputStyle}
    >
    <input
      type="text"
      bind:value={mapping}
      maxlength="500"
      placeholder={m.utility.aliasesMappingPlaceholder()}
      aria-label={m.utility.aliasesMappingAria()}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style={inputStyle}
    >
    <button
      type="submit"
      class="px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={busy || !trigger.trim() || !mapping.trim()}
    >
      <i class="fa-solid fa-plus mr-2" aria-hidden="true"></i>{m.common.add()}
    </button>
  </form>

  {#if aliases.length > 8}
    <input
      type="text"
      bind:value={search}
      placeholder={m.utility.aliasesSearch()}
      aria-label={m.utility.aliasesSearch()}
      class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
      style={inputStyle}
    >
  {/if}

  <div class="space-y-2">
    {#each shown as alias (alias.id)}
      <div
        class="flex items-center gap-2 rounded-xl border p-2 pl-3 min-w-0"
        style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
      >
        <div class="grow min-w-0">
          <code class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{alias.trigger}</code>
          <code class="block text-xs truncate" style="color: {$colorStore.muted}">{alias.mapping}</code>
        </div>
        <button
          type="button"
          class="rounded-lg min-h-[44px] min-w-[44px] shrink-0 disabled:opacity-50"
          style={iconButton}
          aria-label={m.utility.aliasesRemoveAria({ trigger: alias.trigger })}
          disabled={busy}
          onclick={() => run(() => utilityApi.removeAlias(guildId, alias.trigger), m.utility.aliasesRemoveFailed())}
        >
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
    {:else}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.utility.aliasesEmpty()}</p>
    {/each}
  </div>

  {#if aliases.length > 0}
    <button
      type="button"
      class="w-full sm:w-auto px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
      style="background: #ef444420; color: {$colorStore.text}; border: 1px solid #ef444440;"
      disabled={busy}
      onclick={clearAll}
    >
      {m.utility.aliasesClearAll()}
    </button>
  {/if}
</PluginCard>
