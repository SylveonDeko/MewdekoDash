<script lang="ts">
  import { m } from "$lib/i18n";
  import { channelToolsApi, type AutoPurge, type PurgeFilter } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";
  import NumberField from "../NumberField.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import ToolRow from "../ToolRow.svelte";
  import { errorText, purgeFilters, type Named, type Notify } from "../toolsModel";

  interface Props {
    guildId: bigint;
    textChannels: Named[];
    notify: Notify;
  }

  let { guildId, textChannels, notify }: Props = $props();

  let rules: AutoPurge[] = $state([]);
  let loading = $state(true);
  let busy = $state(false);
  let editing = $state(false);
  let channelId: string | null = $state(null);
  let maxAge: number | null = $state(1440);
  let interval: number | null = $state(10);
  let filter: PurgeFilter = $state("All");
  let keepPinned = $state(true);

  const filters = $derived(purgeFilters());
  const existing = $derived(rules.some(rule => String(rule.channelId) === channelId));
  const solid = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
  const soft = $derived(
    `background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`
  );

  async function load() {
    try {
      rules = await channelToolsApi.getAutoPurge(guildId);
    } catch (err) {
      logger.error("Failed to load auto-purge:", err);
      notify(errorText(err, m.serverTools.autoPurgeLoadFailed()), "error");
    } finally {
      loading = false;
    }
  }

  function openNew() {
    channelId = null;
    maxAge = 1440;
    interval = 10;
    filter = "All";
    keepPinned = true;
    editing = true;
  }

  function openRule(rule: AutoPurge) {
    channelId = String(rule.channelId);
    maxAge = rule.maxAgeMinutes;
    interval = rule.intervalMinutes;
    filter = rule.filter;
    keepPinned = rule.keepPinned;
    editing = true;
  }

  async function save() {
    if (busy || !channelId) return;
    busy = true;
    try {
      await channelToolsApi.setAutoPurge(guildId, {
        channelId: BigInt(channelId),
        maxAgeMinutes: maxAge ?? 1440,
        intervalMinutes: interval ?? 10,
        filter,
        keepPinned
      });
      editing = false;
      notify(m.serverTools.autoPurgeSaved());
      await load();
    } catch (err) {
      logger.error("Failed to save auto-purge:", err);
      notify(errorText(err, m.serverTools.autoPurgeSaveFailed()), "error");
    } finally {
      busy = false;
    }
  }

  async function run(rule: AutoPurge) {
    const confirmed = await requestConfirmation({
      title: m.serverTools.autoPurgeRun(),
      message: m.serverTools.autoPurgeRunConfirm({ channel: channelName(rule.channelId) }),
      confirmText: m.serverTools.autoPurgeRun()
    });
    if (!confirmed) return;
    try {
      const deleted = await channelToolsApi.runAutoPurge(guildId, rule.channelId);
      notify(m.serverTools.autoPurgeRan({ count: Number(deleted) || 0 }));
    } catch (err) {
      logger.error("Failed to run auto-purge:", err);
      notify(errorText(err, m.serverTools.autoPurgeRunFailed()), "error");
    }
    await load();
  }

  async function remove(rule: AutoPurge) {
    const confirmed = await requestConfirmation({
      message: m.serverTools.autoPurgeRemoveConfirm({ channel: channelName(rule.channelId) }),
      confirmText: m.common.remove()
    });
    if (!confirmed) return;
    try {
      await channelToolsApi.removeAutoPurge(guildId, rule.channelId);
      editing = false;
      notify(m.serverTools.autoPurgeRemoved());
    } catch (err) {
      logger.error("Failed to remove auto-purge:", err);
      notify(errorText(err, m.serverTools.autoPurgeRemoveFailed()), "error");
    }
    await load();
  }

  function channelName(id: bigint | string): string {
    return textChannels.find(channel => channel.id === String(id))?.name ?? String(id);
  }

  function age(minutes: number): string {
    if (minutes % 1440 === 0) return m.serverTools.durationDays({ count: minutes / 1440 });
    if (minutes % 60 === 0) return m.serverTools.durationHours({ count: minutes / 60 });
    return m.serverTools.durationMinutes({ count: minutes });
  }

  void load();
</script>

<PluginCard title={m.serverTools.autoPurgeTitle()} alwaysOpen>
  {#snippet actions()}
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={soft} onclick={openNew}>
      <i class="fa-solid fa-plus" aria-hidden="true"></i>{m.serverTools.autoPurgeAdd()}
    </button>
  {/snippet}
  {#if loading}
    <div class="flex justify-center py-6">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if rules.length === 0}
    <p class="py-4 text-center" style="color: {$colorStore.muted}">{m.serverTools.autoPurgeEmpty()}</p>
  {:else}
    <div class="space-y-2">
      {#each rules as rule (String(rule.channelId))}
        <ToolRow
          title={`#${channelName(rule.channelId)}`}
          subtitle={m.serverTools.autoPurgeSummary({ age: age(rule.maxAgeMinutes), every: age(rule.intervalMinutes) })}
          badges={[filters.find(item => item.id === rule.filter)?.name ?? rule.filter]}
          onopen={() => openRule(rule)}
        >
          {#snippet actions()}
            <button type="button" class="rounded-lg min-h-[44px] min-w-[44px]" style={soft} aria-label={m.serverTools.autoPurgeRunAria({ channel: channelName(rule.channelId) })} onclick={() => run(rule)}>
              <i class="fa-solid fa-play" aria-hidden="true"></i>
            </button>
            <button type="button" class="rounded-lg min-h-[44px] min-w-[44px]" style={soft} aria-label={m.serverTools.autoPurgeRemoveAria({ channel: channelName(rule.channelId) })} onclick={() => remove(rule)}>
              <i class="fa-solid fa-trash" aria-hidden="true"></i>
            </button>
          {/snippet}
        </ToolRow>
      {/each}
    </div>
  {/if}
</PluginCard>

{#if editing}
  <Sheet title={m.serverTools.autoPurgeTitle()} onclose={() => (editing = false)}>
    <DiscordSelector
      type="channel"
      options={textChannels}
      selected={channelId}
      placeholder={m.common.selectAChannelPlaceholder()}
      ariaLabel={m.common.selectAChannelPlaceholder()}
      onchange={(detail) => (channelId = typeof detail.selected === "string" ? detail.selected : null)}
    />
    <NumberField id="autopurge-age" label={m.serverTools.autoPurgeAge()} value={maxAge} min={1} max={525600} onchange={(value) => (maxAge = value)} />
    <NumberField id="autopurge-interval" label={m.serverTools.autoPurgeInterval()} value={interval} min={5} max={1440} onchange={(value) => (interval = value)} />
    <DiscordSelector
      type="custom"
      customIcon="fa-filter"
      options={filters}
      selected={filter}
      clearable={false}
      searchable={false}
      ariaLabel={m.serverTools.purgeFilter()}
      onchange={(detail) => (filter = (typeof detail.selected === "string" ? detail.selected : "All") as PurgeFilter)}
    />
    <SettingToggle id="autopurge-pinned" label={m.serverTools.purgeKeepPinned()} checked={keepPinned} onchange={(on) => (keepPinned = on)} />
    {#snippet footer()}
      <button type="button" class="px-4 rounded-lg min-h-[44px] font-medium" style={soft} onclick={() => (editing = false)}>
        {m.common.cancel()}
      </button>
      <button type="button" class="px-4 rounded-lg min-h-[44px] font-medium disabled:opacity-50" style={solid} disabled={busy || !channelId} onclick={save}>
        {existing ? m.common.save() : m.serverTools.autoPurgeAdd()}
      </button>
    {/snippet}
  </Sheet>
{/if}
