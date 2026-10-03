<script lang="ts">
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
      onerror(err?.message || "Couldn't save the settings.");
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
      onsuccess("Checking every member again. Anything they qualify for unlocks quietly in the next few minutes.");
    } catch (err: any) {
      logger.error("Failed to queue an achievement check:", err);
      onerror(err?.message || "Couldn't start the check.");
    } finally {
      working = false;
    }
  }

  /** Clears every achievement in the server, after asking. */
  async function resetAll() {
    if (!$currentGuild?.id || working) return;
    const ok = await requestConfirmation({
      title: "Reset every achievement?",
      message: "Every member loses every achievement and point in this server. Tracked activity stays, so anything still qualified for comes back quietly. This can't be undone.",
      confirmText: "Reset everything",
      variant: "danger"
    });
    if (!ok) return;
    working = true;
    try {
      const { cleared } = await achievementsApi.resetGuild($currentGuild.id);
      await onreset();
      onsuccess(`Cleared ${cleared.toLocaleString()} unlocks.`);
    } catch (err: any) {
      logger.error("Failed to reset achievements:", err);
      onerror(err?.message || "Couldn't reset achievements.");
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
      Who and where doesn't count
    </h2>
    <p class="text-sm mt-1 mb-5" style="color: {$colorStore.muted}">
      Members with these roles earn nothing, and activity in these channels doesn't count. Bots never earn.
    </p>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <div>
        <span id="ach-ex-roles" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Roles</span>
        <DiscordSelector type="role" multiple={true} options={roleOptions} selected={excludedRoles}
                         placeholder="No roles" ariaLabelledby="ach-ex-roles"
                         onchange={(d) => { excludedRoles = Array.isArray(d.selected) ? d.selected : []; }} />
      </div>
      <div>
        <span id="ach-ex-channels" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Channels</span>
        <DiscordSelector type="channel" multiple={true} options={channelOptions} selected={excludedChannels}
                         placeholder="No channels" ariaLabelledby="ach-ex-channels"
                         onchange={(d) => { excludedChannels = Array.isArray(d.selected) ? d.selected : []; }} />
      </div>
    </div>
  </div>

  <div class="relative rounded-2xl border p-5 md:p-6 shadow-2xl" style="z-index: 20;
       background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
       border-color: {$colorStore.primary}30;">
    <h2 class="flex items-center gap-2 text-lg font-semibold" style="color: {$colorStore.text}">
      <DuoIcon icon="fa-sliders" />
      Extras
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-5">
      <div>
        <label for="ach-xp-per-point" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">XP per point</label>
        <input id="ach-xp-per-point" type="number" min="0" max="1000" bind:value={xpPerPoint}
               class="w-full px-3 h-[44px] rounded-xl border text-sm"
               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};" />
        <p class="text-xs mt-2" style="color: {$colorStore.muted}">
          Achievement ranks and XP levels are separate. Set this to have every unlock also pay XP: a Gold unlock is 50 points, so 2 here gives 100 XP. 0 turns it off.
        </p>
      </div>
      <div>
        <span class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Secret achievements</span>
        <ToggleRow checked={revealHidden} title="Show them before they unlock"
                   colors={$colorStore} onchange={(v) => { revealHidden = v; }} />
        <p class="text-xs mt-2" style="color: {$colorStore.muted}">
          Members see the names and goals of secret achievements before unlocking them.
        </p>
      </div>
    </div>
  </div>

  <div class="rounded-2xl border p-5 md:p-6 shadow-2xl"
       style="background: linear-gradient(135deg, #ef444408, {$colorStore.gradientMid}10), #1a202c; border-color: #ef444430;">
    <h2 class="flex items-center gap-2 text-lg font-semibold" style="color: {$colorStore.text}">
      <DuoIcon icon="fa-circle-exclamation" color="#ef4444" />
      Maintenance
    </h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
      <div class="p-4 rounded-xl" style="background: {$colorStore.primary}08;">
        <div class="font-semibold text-sm" style="color: {$colorStore.text}">Check everyone again</div>
        <p class="text-xs mt-1 mb-3" style="color: {$colorStore.muted}">
          Useful after turning on a data source. Anything members already qualify for unlocks quietly.
        </p>
        <button type="button" class="px-4 py-2 rounded-xl min-h-[44px] text-sm font-medium disabled:opacity-50"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
                disabled={working} onclick={recheck}>Check now</button>
      </div>
      <div class="p-4 rounded-xl" style="background: #ef444410;">
        <div class="font-semibold text-sm" style="color: {$colorStore.text}">Reset every achievement</div>
        <p class="text-xs mt-1 mb-3" style="color: {$colorStore.muted}">
          Clears all unlocks and points in this server. Settings and your own achievements stay.
        </p>
        <button type="button" class="px-4 py-2 rounded-xl min-h-[44px] text-sm font-medium disabled:opacity-50"
                style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
                disabled={working} onclick={resetAll}>Reset everything</button>
      </div>
    </div>
  </div>

  {#if dirty}
    <div class="sticky bottom-4 z-40 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-4 rounded-2xl border shadow-2xl"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}15, {$colorStore.gradientMid}20), #1a202c; border-color: {$colorStore.primary}40;"
         in:fade={{ duration: 150 }}>
      <span class="flex-1 text-sm" style="color: {$colorStore.text}">You have unsaved changes.</span>
      <button type="button" class="px-4 py-2.5 rounded-xl min-h-[44px]"
              style="background: {$colorStore.primary}08; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
              onclick={discard}>Discard</button>
      <button type="button" class="px-5 py-2.5 rounded-xl min-h-[44px] font-semibold disabled:opacity-50"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              disabled={saving} onclick={save}>
        {#if saving}<i class="fa-solid fa-spinner fa-spin mr-2" aria-hidden="true"></i>{/if}Save
      </button>
    </div>
  {/if}
</div>
