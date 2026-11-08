<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { banPruneApi, clientApi } from "$lib/api/index.ts";
  import { BanPruneScope } from "$lib/api/banprune/models";
  import type { BanPruneActionInfo, BanPruneSetting } from "$lib/api/banprune/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";

  interface Props {
    guildId: bigint;
    channels: Array<{ id: string; name: string }>;
    onerror: (message: string) => void;
  }

  let { guildId, channels, onerror }: Props = $props();

  const ALL_ACTIONS = "*";

  let pruneActions: BanPruneActionInfo[] = $state([]);
  let settings: BanPruneSetting[] = $state([]);
  let categories: Array<{ id: string; name: string }> = $state([]);
  let saving = $state(false);
  let overrideScope = $state<BanPruneScope>(BanPruneScope.Channel);
  let overrideTarget: string | null = $state(null);
  let overrideAction: string | null = $state(ALL_ACTIONS);
  let overrideDays = $state(0);
  let pendingRemoval: BanPruneSetting | null = $state(null);
  let confirmResetOpen = $state(false);

  const actionOptions = $derived([
    { id: ALL_ACTIONS, name: m.common.allActions() },
    ...pruneActions.map(a => ({ id: a.key, name: a.displayName }))
  ]);
  const defaults = $derived(new Map(settings.filter(x => x.scopeType === BanPruneScope.Guild).map(x => [x.actionKey, x])));
  const overrides = $derived(settings.filter(x => x.scopeType !== BanPruneScope.Guild));
  const targetOptions = $derived(overrideScope === BanPruneScope.Category ? categories : channels);
  const inputStyle = $derived(
    `background: ${$colorStore.primary}08; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  function targetName(setting: BanPruneSetting): string {
    const pool = setting.scopeType === BanPruneScope.Category ? categories : channels;
    const prefix = setting.scopeType === BanPruneScope.Category ? "" : "#";
    return `${prefix}${pool.find(x => x.id === setting.scopeId)?.name ?? setting.scopeId}`;
  }

  function actionName(key: string): string {
    return key ? pruneActions.find(a => a.key === key)?.displayName ?? key : m.common.allActions();
  }

  function describeDays(days: number): string {
    if (days <= 0) return m.moderation.pruneNoMessages();
    return days === 1 ? m.common.oneDay() : m.common.daysCount({ count: days });
  }

  function valueFor(action: BanPruneActionInfo): { days: number; source: string } {
    const own = defaults.get(action.key);
    if (own) return { days: own.pruneDays, source: "set" };
    const all = defaults.get("");
    if (all) return { days: all.pruneDays, source: "all" };
    return { days: action.defaultDays, source: "default" };
  }

  async function load() {
    try {
      const [loadedActions, loadedSettings, loadedCategories] = await Promise.all([
        banPruneApi.getActions(guildId),
        banPruneApi.getSettings(guildId),
        clientApi.getCategories(guildId)
      ]);
      pruneActions = loadedActions || [];
      settings = loadedSettings || [];
      categories = (loadedCategories || []).map(c => ({ id: String(c.id), name: c.name }));
    } catch (err) {
      logger.error("Failed to load ban purge settings:", err);
      onerror(m.moderation.errorLoadPrune());
    }
  }

  async function run(action: () => Promise<unknown>, failure: string) {
    saving = true;
    try {
      await action();
      settings = await banPruneApi.getSettings(guildId);
    } catch (err) {
      logger.error(failure, err);
      onerror(failure);
    } finally {
      saving = false;
    }
  }

  const save = (scopeType: BanPruneScope, scopeId: bigint, actionKey: string | null, days: number) =>
    run(
      () => banPruneApi.setSetting(guildId, { scopeType, scopeId, actionKey, pruneDays: Math.max(0, Math.min(7, days)) }),
      m.moderation.errorSavePrune()
    );

  const clear = (setting: BanPruneSetting) =>
    run(
      () => banPruneApi.clearSetting(guildId, setting.scopeType, BigInt(setting.scopeId), setting.actionKey || null),
      m.moderation.errorRemovePrune()
    );

  async function addOverride() {
    if (!overrideTarget) return;
    await save(overrideScope, BigInt(overrideTarget), overrideAction === ALL_ACTIONS ? null : overrideAction, overrideDays);
    overrideTarget = null;
    overrideAction = ALL_ACTIONS;
    overrideDays = 0;
  }

  onMount(() => {
    void load();
  });
</script>

<PluginCard title={m.moderation.tabBanpurge()}>
  <div class="space-y-3">
    <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.common.serverDefaults()}</h4>
    {#each pruneActions as action (action.key)}
      {@const current = valueFor(action)}
      <div class="flex flex-wrap items-center gap-4 p-3 rounded-xl border" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <div class="flex-1 min-w-[180px]">
          <div class="font-medium" style="color: {$colorStore.text}">{action.displayName}</div>
          <div class="text-xs" style="color: {$colorStore.muted}">
            {#if current.source === "set"}
              {m.moderation.pruneSetTo({ days: describeDays(current.days) })}
            {:else if current.source === "all"}
              {m.moderation.pruneFromAll()}
            {:else}
              {m.moderation.pruneBuiltin({ days: describeDays(action.defaultDays) })}
            {/if}
          </div>
        </div>
        <label class="sr-only" for="prune-days-{action.key}">{m.moderation.pruneDaysLabel({ action: action.displayName })}</label>
        <input id="prune-days-{action.key}" type="number" min="0" max="7" value={current.days} disabled={saving}
               onchange={(e) => save(BanPruneScope.Guild, 0n, action.key, Number(e.currentTarget.value))}
               class="w-20 p-2 rounded-lg border text-center min-h-[50px]" style={inputStyle}>
        {#if defaults.has(action.key)}
          <button
            type="button"
            class="px-3 rounded-lg text-sm min-h-[50px]"
            style="background: {$colorStore.primary}10; color: {$colorStore.text};"
            disabled={saving}
            onclick={() => clear(defaults.get(action.key)!)}
          >
            {m.moderation.pruneUnset()}
          </button>
        {/if}
      </div>
    {/each}

    <div class="flex flex-wrap items-center gap-4 p-3 rounded-xl border" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
      <div class="flex-1 min-w-[180px]">
        <div class="font-medium" style="color: {$colorStore.text}">{m.common.allActions()}</div>
        <div class="text-xs" style="color: {$colorStore.muted}">{m.moderation.pruneAllHint()}</div>
      </div>
      <label class="sr-only" for="prune-days-all">{m.moderation.pruneAllLabel()}</label>
      <input id="prune-days-all" type="number" min="0" max="7" value={defaults.get("")?.pruneDays ?? 0} disabled={saving}
             onchange={(e) => save(BanPruneScope.Guild, 0n, null, Number(e.currentTarget.value))}
             class="w-20 p-2 rounded-lg border text-center min-h-[50px]" style={inputStyle}>
      {#if defaults.has("")}
        <button
          type="button"
          class="px-3 rounded-lg text-sm min-h-[50px]"
          style="background: {$colorStore.primary}10; color: {$colorStore.text};"
          disabled={saving}
          onclick={() => clear(defaults.get("")!)}
        >
          {m.moderation.pruneUnset()}
        </button>
      {/if}
    </div>
  </div>

  <div class="space-y-3">
    <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.moderation.overridesTitle()}</h4>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <SettingField label={m.common.scope()} id="override-scope">
        <DiscordSelector
          id="override-scope"
          type="custom"
          options={[
            { id: String(BanPruneScope.Channel), name: m.common.channel() },
            { id: String(BanPruneScope.Category), name: m.common.category() }
          ]}
          selected={String(overrideScope)}
          searchable={false}
          clearable={false}
          customIcon="fa-layer-group"
          placeholder={m.moderation.overridesScopePlaceholder()}
          onchange={(detail) => {
            overrideScope = Number(detail.selected) as BanPruneScope;
            overrideTarget = null;
          }}
        />
      </SettingField>
      <SettingField label={overrideScope === BanPruneScope.Category ? m.common.category() : m.common.channel()} id="override-target">
        <DiscordSelector
          id="override-target"
          type={overrideScope === BanPruneScope.Category ? "custom" : "channel"}
          options={targetOptions}
          bind:selected={overrideTarget}
          placeholder={m.common.selectPlaceholder()}
        />
      </SettingField>
      <SettingField label={m.common.action()} id="override-action">
        <DiscordSelector
          id="override-action"
          type="custom"
          options={actionOptions}
          bind:selected={overrideAction}
          customIcon="fa-shield-halved"
          placeholder={m.moderation.overridesActionPlaceholder()}
        />
      </SettingField>
      <SettingField label={m.moderation.overridesPurgeDays()} id="override-days">
        <div class="flex gap-2">
          <input id="override-days" type="number" min="0" max="7" bind:value={overrideDays}
                 class="w-full p-3 rounded-lg border min-h-[50px]" style={inputStyle}>
          <button
            type="button"
            class="px-4 rounded-lg font-medium min-h-[50px] disabled:opacity-40"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
            disabled={!overrideTarget || saving}
            onclick={addOverride}
          >
            {m.common.add()}
          </button>
        </div>
      </SettingField>
    </div>

    {#if overrides.length === 0}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.moderation.overridesEmpty()}</p>
    {:else}
      {#each overrides as setting (setting.id)}
        <div class="flex flex-wrap items-center gap-4 p-3 rounded-xl border" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
          <div class="flex-1 min-w-[200px]">
            <div class="font-medium" style="color: {$colorStore.text}">{targetName(setting)}</div>
            <div class="text-xs" style="color: {$colorStore.muted}">{actionName(setting.actionKey)} &middot; {describeDays(setting.pruneDays)}</div>
          </div>
          <label class="sr-only" for="override-days-{setting.id}">{m.moderation.overridesDaysLabel()}</label>
          <input id="override-days-{setting.id}" type="number" min="0" max="7" value={setting.pruneDays} disabled={saving}
                 onchange={(e) => save(setting.scopeType, BigInt(setting.scopeId), setting.actionKey || null, Number(e.currentTarget.value))}
                 class="w-20 p-2 rounded-lg border text-center min-h-[50px]" style={inputStyle}>
          <button
            type="button"
            class="px-3 rounded-lg text-sm min-h-[50px]"
            style="background: {$colorStore.primary}10; color: {$colorStore.text};"
            disabled={saving}
            onclick={() => (pendingRemoval = setting)}
          >
            {m.common.remove()}
          </button>
        </div>
      {/each}
    {/if}

    {#if settings.length > 0}
      <button
        type="button"
        class="px-4 rounded-lg text-sm min-h-[50px]"
        style="background: {$colorStore.primary}10; color: {$colorStore.text};"
        disabled={saving}
        onclick={() => (confirmResetOpen = true)}
      >
        {m.moderation.overridesReset()}
      </button>
    {/if}
  </div>
</PluginCard>

<ConfirmationModal
  isOpen={pendingRemoval !== null}
  title={m.moderation.removeOverrideTitle()}
  message={pendingRemoval ? m.moderation.removeOverrideMessage({ target: targetName(pendingRemoval) }) : ""}
  confirmText={m.common.remove()}
  onconfirm={async () => {
    const target = pendingRemoval;
    pendingRemoval = null;
    if (target) await clear(target);
  }}
  oncancel={() => (pendingRemoval = null)}
/>

<ConfirmationModal
  bind:isOpen={confirmResetOpen}
  title={m.moderation.resetTitle()}
  message={m.moderation.resetMessage()}
  confirmText={m.common.reset()}
  onconfirm={async () => {
    confirmResetOpen = false;
    await run(() => banPruneApi.reset(guildId), m.moderation.errorResetPrune());
  }}
  oncancel={() => (confirmResetOpen = false)}
/>
