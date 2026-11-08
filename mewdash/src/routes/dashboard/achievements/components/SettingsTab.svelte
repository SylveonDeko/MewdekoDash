<script lang="ts">
  import { m } from "$lib/i18n";
  import { untrack } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { achievementsApi, type AchievementLookups, type AchievementSettings } from "$lib/api/index.ts";
  import { logger } from "$lib/logger";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";

  interface Props {
    settings: AchievementSettings;
    lookups: AchievementLookups | null;
    autoSave: AutoSave;
    onsaved: (settings: AchievementSettings) => void;
    onreset: () => Promise<void>;
    onerror: (text: string) => void;
    onsuccess: (text: string) => void;
  }

  let { settings, lookups, autoSave, onsaved, onreset, onerror, onsuccess }: Props = $props();

  let excludedRoles = $state<string[]>(untrack(() => settings.excludedRoleIds.map((id) => id.toString())));
  let excludedChannels = $state<string[]>(untrack(() => settings.excludedChannelIds.map((id) => id.toString())));
  let xpPerPoint = $state(untrack(() => settings.xpPerPoint));
  let revealHidden = $state(untrack(() => settings.revealHidden));
  let working = $state(false);

  const roleOptions = $derived((lookups?.roles ?? []).map((r) => ({ id: r.id.toString(), name: r.name, color: r.color })));
  const channelOptions = $derived(
    (lookups?.channels ?? []).map((c) => ({ id: c.id.toString(), name: c.name, type: c.type }))
  );

  function xpValid(): boolean {
    const value: unknown = xpPerPoint;
    if (value === null || value === undefined || value === "") return false;
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n <= 1000;
  }

  function restore() {
    excludedRoles = settings.excludedRoleIds.map((id) => id.toString());
    excludedChannels = settings.excludedChannelIds.map((id) => id.toString());
    xpPerPoint = settings.xpPerPoint;
    revealHidden = settings.revealHidden;
  }

  function queue(instant: boolean) {
    const guildId = $currentGuild?.id;
    if (!guildId) return;
    if (!instant && !xpValid()) {
      autoSave.cancel("achievementSettings");
      return;
    }
    const save = async () => {
      try {
        const saved = await achievementsApi.updateSettings(guildId, {
          excludedRoleIds: excludedRoles,
          excludedChannelIds: excludedChannels,
          ...(xpValid() ? { xpPerPoint: Math.round(Number(xpPerPoint)) } : {}),
          revealHidden
        });
        onsaved(saved);
      } catch (err: any) {
        logger.error("Failed to save achievement settings:", err);
        restore();
        onerror(err?.message || m.achievements.settingsErrorSave());
        throw err;
      }
    };
    if (instant) void autoSave.now("achievementSettings", save);
    else autoSave.schedule("achievementSettings", save);
  }

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

<div class="space-y-4 min-w-0">
  <PluginCard title={m.achievements.settingsExcludeTitle()} alwaysOpen>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <span id="ach-ex-roles" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.common.roles()}</span>
        <DiscordSelector
          type="role"
          multiple={true}
          options={roleOptions}
          selected={excludedRoles}
          placeholder={m.common.noRoles()}
          ariaLabelledby="ach-ex-roles"
          onchange={(d) => {
            excludedRoles = Array.isArray(d.selected) ? d.selected : [];
            queue(true);
          }}
        />
      </div>
      <div>
        <span id="ach-ex-channels" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.common.channels()}</span>
        <DiscordSelector
          type="channel"
          multiple={true}
          options={channelOptions}
          selected={excludedChannels}
          placeholder={m.achievements.settingsNoChannels()}
          ariaLabelledby="ach-ex-channels"
          onchange={(d) => {
            excludedChannels = Array.isArray(d.selected) ? d.selected : [];
            queue(true);
          }}
        />
      </div>
    </div>
  </PluginCard>

  <PluginCard title={m.achievements.settingsExtras()} alwaysOpen>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
      <SettingField label={m.achievements.settingsXpPerPoint()} id="ach-xp-per-point">
        <input
          id="ach-xp-per-point"
          type="number"
          min="0"
          max="1000"
          inputmode="numeric"
          bind:value={xpPerPoint}
          oninput={() => queue(false)}
          onblur={() => autoSave.flush("achievementSettings")}
          aria-invalid={!xpValid()}
          class="w-full p-3 rounded-lg border min-h-[50px]"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        />
      </SettingField>
      <ToggleRow
        checked={revealHidden}
        title={m.achievements.settingsRevealTitle()}
        subtitle={m.achievements.settingsRevealHint()}
        colors={$colorStore}
        onchange={(v) => {
          revealHidden = v;
          queue(true);
        }}
      />
    </div>
  </PluginCard>

  <PluginCard title={m.common.maintenance()} alwaysOpen>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
      <div class="p-3 rounded-lg" style="background: {$colorStore.primary}08;">
        <div class="font-medium text-sm" style="color: {$colorStore.text}">{m.achievements.settingsRecheckTitle()}</div>
        <p class="text-xs mt-1 mb-3" style="color: {$colorStore.muted}">{m.achievements.settingsRecheckHint()}</p>
        <button
          type="button"
          class="px-4 rounded-lg min-h-[44px] text-sm font-medium disabled:opacity-50"
          style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
          disabled={working}
          onclick={recheck}
        >
          {m.achievements.settingsRecheckButton()}
        </button>
      </div>
      <div class="p-3 rounded-lg" style="background: #ef444410;">
        <div class="font-medium text-sm" style="color: {$colorStore.text}">{m.achievements.settingsResetAllTitle()}</div>
        <p class="text-xs mt-1 mb-3" style="color: {$colorStore.muted}">{m.achievements.settingsResetAllHint()}</p>
        <button
          type="button"
          class="px-4 rounded-lg min-h-[44px] text-sm font-medium disabled:opacity-50"
          style="background: #ef444420; color: #ef4444; border: 1px solid #ef444430;"
          disabled={working}
          onclick={resetAll}
        >
          {m.common.resetEverything()}
        </button>
      </div>
    </div>
  </PluginCard>
</div>
