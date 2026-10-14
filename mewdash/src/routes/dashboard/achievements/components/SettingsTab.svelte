<script lang="ts">
  import { m } from "$lib/i18n";
  import { untrack } from "svelte";
  import { fade } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import {
    achievementsApi,
    type AchievementCatalog,
    type AchievementLookups,
    type AchievementSettings
  } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import DuoIcon from "./DuoIcon.svelte";

  /** Tab inputs. */
  interface Props {
    settings: AchievementSettings;
    catalog: AchievementCatalog;
    lookups: AchievementLookups | null;
    onsaved: (settings: AchievementSettings) => void;
    onreset: () => Promise<void>;
    onerror: (text: string) => void;
    onsuccess: (text: string) => void;
  }

  let { settings, lookups, onsaved, onreset, onerror, onsuccess }: Props = $props();

  let excludedRoles = $state<string[]>(untrack(() => settings.excludedRoleIds.map((id) => id.toString())));
  let excludedChannels = $state<string[]>(untrack(() => settings.excludedChannelIds.map((id) => id.toString())));
  let xpPerPoint = $state(untrack(() => settings.xpPerPoint));
  let revealHidden = $state(untrack(() => settings.revealHidden));
  let saving = $state(false);
  let working = $state(false);

  let baseline = $state(untrack(() => snapshot()));
  let dirty = $derived(snapshot() !== baseline);

  let roleOptions = $derived((lookups?.roles ?? []).map((r) => ({ id: r.id.toString(), name: r.name, color: r.color })));
  let channelOptions = $derived(
    (lookups?.channels ?? []).map((c) => ({ id: c.id.toString(), name: c.name, type: c.type }))
  );

  /** The form state as text, for change tracking. */
  function snapshot(): string {
    return JSON.stringify([[...excludedRoles].sort(), [...excludedChannels].sort(), xpPerPoint, revealHidden]);
  }

  /** Saves the settings. */
  async function save() {
    if (!$currentGuild?.id || saving) return;
    saving = true;
    try {
      const saved = await achievementsApi.updateSettings($currentGuild.id, {
        excludedRoleIds: excludedRoles,
        excludedChannelIds: excludedChannels,
        xpPerPoint: Math.max(0, Math.min(1000, Math.round(Number(xpPerPoint) || 0))),
        revealHidden
      });
      onsaved(saved);
      baseline = snapshot();
    } catch (err: any) {
      logger.error("Failed to save achievement settings:", err);
      onerror(err?.message || m.achievements.settingsErrorSave());
    } finally {
      saving = false;
    }
  }

  /** Puts the form back to the saved settings. */
  function discard() {
    excludedRoles = settings.excludedRoleIds.map((id) => id.toString());
    excludedChannels = settings.excludedChannelIds.map((id) => id.toString());
    xpPerPoint = settings.xpPerPoint;
    revealHidden = settings.revealHidden;
    baseline = snapshot();
  }

  /** Asks the bot to check every member again. */
  async function recheck() {
    if (!$currentGuild?.id || working) return;
    working = true;
    try {
      await achievementsApi.recheck($currentGuild.id);
      onsuccess(m.achievements.settingsRecheckStarted());
    } catch (err: any) {
      logger.error("Failed to queue an achievement check:", err);
      onerror(err?.message || m.achievements.settingsErrorRecheck());
    } finally {
      working = false;
    }
  }

  /** Clears every achievement in the server, after asking. */
  async function resetAll() {
    if (!$currentGuild?.id || working) return;
    const ok = await requestConfirmation({
      title: m.achievements.settingsResetTitle(),
      message: m.achievements.settingsResetMessage(),
      confirmText: m.common.resetEverything(),
      variant: "danger"
    });
    if (!ok) return;
    working = true;
    try {
      const { cleared } = await achievementsApi.resetGuild($currentGuild.id);
      await onreset();
      onsuccess(m.achievements.settingsCleared({ count: cleared.toLocaleString() }));
    } catch (err: any) {
      logger.error("Failed to reset achievements:", err);
      onerror(err?.message || m.achievements.settingsErrorReset());
    } finally {
      working = false;
    }
  }
</script>

<div class="space-y-6" in:fade={{ duration: 200 }}>
  <div class="relative rounded-2xl border p-5 md:p-6 shadow-2xl" style="z-index: 30;
       background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
       border-color: {$colorStore.primary}30;">
    <h2 class="flex items-center gap-2 text-lg font-semibold" style="color: {$colorStore.text}">
      <DuoIcon icon="fa-filter" />
      {m.achievements.settingsExcludeTitle()}
    </h2>
    <p class="text-sm mt-1 mb-5" style="color: {$colorStore.muted}">
      {m.achievements.settingsExcludeHint()}
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div>
        <span id="ach-ex-roles" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.roles()}</span>
        <DiscordSelector type="role" multiple={true} options={roleOptions} selected={excludedRoles}
                         placeholder={m.common.noRoles()} ariaLabelledby="ach-ex-roles"
                         onchange={(d) => { excludedRoles = Array.isArray(d.selected) ? d.selected : []; }} />
      </div>
      <div>
        <span id="ach-ex-channels" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.common.channels()}</span>
        <DiscordSelector type="channel" multiple={true} options={channelOptions} selected={excludedChannels}
                         placeholder={m.achievements.settingsNoChannels()} ariaLabelledby="ach-ex-channels"
                         onchange={(d) => { excludedChannels = Array.isArray(d.selected) ? d.selected : []; }} />
      </div>
    </div>
  </div>

  <div class="relative rounded-2xl border p-5 md:p-6 shadow-2xl" style="z-index: 20;
       background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
       border-color: {$colorStore.primary}30;">
    <h2 class="flex items-center gap-2 text-lg font-semibold" style="color: {$colorStore.text}">
      <DuoIcon icon="fa-sliders" />
      {m.achievements.settingsExtras()}
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-5">
      <div>
        <label for="ach-xp-per-point" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.achievements.settingsXpPerPoint()}</label>
        <input id="ach-xp-per-point" type="number" min="0" max="1000" bind:value={xpPerPoint}
               class="w-full px-3 h-[44px] rounded-xl border text-sm"
               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
        <p class="text-xs mt-2" style="color: {$colorStore.muted}">
          {m.achievements.settingsXpPerPointHint()}
        </p>
      </div>
      <div>
        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.achievements.settingsSecretTitle()}</span>
        <ToggleRow checked={revealHidden} title={m.achievements.settingsRevealTitle()}
                   colors={$colorStore} onchange={(v) => { revealHidden = v; }} />
        <p class="text-xs mt-2" style="color: {$colorStore.muted}">
          {m.achievements.settingsRevealHint()}
        </p>
      </div>
    </div>
  </div>

  <div class="rounded-2xl border p-5 md:p-6 shadow-2xl"
       style="background: linear-gradient(135deg, #ef444408, {$colorStore.gradientMid}10), #1a202c; border-color: #ef444430;">
    <h2 class="flex items-center gap-2 text-lg font-semibold" style="color: {$colorStore.text}">
      <DuoIcon icon="fa-circle-exclamation" color="#ef4444" />
      {m.common.maintenance()}
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
      <div class="p-4 rounded-xl" style="background: {$colorStore.primary}08;">
        <div class="font-semibold text-sm" style="color: {$colorStore.text}">{m.achievements.settingsRecheckTitle()}</div>
        <p class="text-xs mt-1 mb-3" style="color: {$colorStore.muted}">
          {m.achievements.settingsRecheckHint()}
        </p>
        <button type="button" class="px-4 py-2 rounded-xl min-h-[44px] text-sm font-medium disabled:opacity-50"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                disabled={working} onclick={recheck}>{m.achievements.settingsRecheckButton()}</button>
      </div>
      <div class="p-4 rounded-xl" style="background: #ef444410;">
        <div class="font-semibold text-sm" style="color: {$colorStore.text}">{m.achievements.settingsResetAllTitle()}</div>
        <p class="text-xs mt-1 mb-3" style="color: {$colorStore.muted}">
          {m.achievements.settingsResetAllHint()}
        </p>
        <button type="button" class="px-4 py-2 rounded-xl min-h-[44px] text-sm font-medium disabled:opacity-50"
                style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
                disabled={working} onclick={resetAll}>{m.common.resetEverything()}</button>
      </div>
    </div>
  </div>

  {#if dirty}
    <div class="sticky bottom-4 z-40 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-2xl border shadow-2xl"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20), #1a202c; border-color: {$colorStore.primary}40;"
         in:fade={{ duration: 150 }}>
      <span class="flex-1 text-sm" style="color: {$colorStore.text}">{m.achievements.settingsUnsaved()}</span>
      <button type="button" class="px-4 py-2.5 rounded-xl min-h-[44px]"
              style="background: {$colorStore.primary}08; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
              onclick={discard}>{m.common.discard()}</button>
      <button type="button" class="px-5 py-2.5 rounded-xl min-h-[44px] font-semibold disabled:opacity-50"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              disabled={saving} onclick={save}>
        {#if saving}<i class="fa-solid fa-spinner fa-spin mr-2" aria-hidden="true"></i>{/if}{m.common.save()}
      </button>
    </div>
  {/if}
</div>
