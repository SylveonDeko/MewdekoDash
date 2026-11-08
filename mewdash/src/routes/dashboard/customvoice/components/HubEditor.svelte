<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { customVoiceApi } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "./NumberField.svelte";
  import { hubToRequest, SyncMode, type BoolKey, type Hub, type Named } from "./model";

  interface Props {
    guildId: bigint;
    hub: Hub;
    categories: Named[];
    roles: Named[];
    autoSave: AutoSave;
    onsaved: (hub: Hub) => void;
  }

  let { guildId, hub: initial, categories, roles, autoSave, onsaved }: Props = $props();

  const clone = (h: Hub): Hub => ({ ...h, moderatorRoleIds: [...h.moderatorRoleIds] });
  let hub: Hub = $state(untrack(() => clone(initial)));
  let saved: Hub = untrack(() => clone(initial));
  const saveKey = untrack(() => `hub:${initial.hubId}`);

  const BITRATES = [8, 16, 32, 64, 96, 128, 192, 256, 384];

  const bitrateOptions = $derived(
    [...new Set([...BITRATES, hub.defaultBitrate])]
      .sort((a, b) => a - b)
      .map((v) => ({ id: String(v), name: `${v} kbps` }))
  );

  const syncOptions = $derived([
    { id: String(SyncMode.None), name: m.customvoice.syncNone() },
    { id: String(SyncMode.Hub), name: m.customvoice.syncHub() },
    { id: String(SyncMode.Category), name: m.customvoice.syncCategory() }
  ]);

  const memberToggles = $derived<Array<{ key: BoolKey; label: string }>>([
    { key: "allowNameCustomization", label: m.customvoice.toggleName() },
    { key: "allowUserLimitCustomization", label: m.customvoice.toggleUserLimit() },
    { key: "allowBitrateCustomization", label: m.customvoice.toggleBitrate() },
    { key: "allowLocking", label: m.customvoice.toggleLocking() },
    { key: "allowUserManagement", label: m.customvoice.toggleUserManagement() },
    { key: "persistUserPreferences", label: m.customvoice.toggleRemember() }
  ]);

  const ownerToggles = $derived<Array<{ key: BoolKey; label: string }>>([
    { key: "autoPermission", label: m.customvoice.toggleAutoPermission() },
    { key: "ownerManageChannel", label: m.customvoice.ownerManageChannel() },
    { key: "ownerManageRoles", label: m.customvoice.ownerManageRoles() },
    { key: "ownerMoveMembers", label: m.customvoice.ownerMoveMembers() },
    { key: "ownerPrioritySpeaker", label: m.customvoice.ownerPrioritySpeaker() }
  ]);

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  /**
   * Applies a change and saves the whole hub.
   * @param changes The fields that changed
   * @param mode Whether to save now or once typing stops
   */
  function patch(changes: Partial<Hub>, mode: "now" | "typing" = "now") {
    const previous = saved;
    Object.assign(hub, changes);
    const snapshot = clone(hub);
    const request = hubToRequest(snapshot);
    const save = async () => {
      try {
        await customVoiceApi.updateCustomVoiceConfig(guildId, request, snapshot.hubId);
        saved = snapshot;
        onsaved(snapshot);
      } catch (err) {
        if (mode === "now") {
          for (const key of Object.keys(changes) as (keyof Hub)[]) {
            (hub as Record<keyof Hub, unknown>)[key] = previous[key];
          }
        }
        throw err;
      }
    };
    if (mode === "now") void autoSave.now(saveKey, save);
    else autoSave.schedule(saveKey, save);
  }

  function selectedString(selected: string | string[] | null): string | null {
    return typeof selected === "string" ? selected : null;
  }
</script>

<div class="space-y-4 min-w-0" onfocusout={() => autoSave.flush(saveKey)}>
  <PluginCard title={m.customvoice.cardGeneral()} alwaysOpen>
    <SettingField label={m.customvoice.hubName()} id="cv-hub-name">
      <input id="cv-hub-name" type="text" value={hub.hubName} maxlength="50"
             oninput={(e) => patch({ hubName: e.currentTarget.value }, "typing")}
             class="w-full p-3 rounded-lg border min-h-[50px]" style={inputStyle}>
    </SettingField>
    <div>
      <span id="cv-category-label" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.customvoice.categoryLabel()}</span>
      <DiscordSelector type="custom" customIcon="fa-folder" options={categories} selected={hub.categoryId}
                       ariaLabelledby="cv-category-label" placeholder={m.common.selectCategoryPlaceholder()}
                       onchange={({ selected }) => patch({ categoryId: selectedString(selected) })} />
    </div>
    <SettingField label={m.customvoice.nameFormatLabel()} id="cv-name-format">
      <input id="cv-name-format" type="text" value={hub.defaultNameFormat} maxlength="100"
             oninput={(e) => patch({ defaultNameFormat: e.currentTarget.value }, "typing")}
             placeholder={m.customvoice.nameFormatPlaceholder({ token: "{username}" })}
             class="w-full p-3 rounded-lg border min-h-[50px]" style={inputStyle}>
    </SettingField>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NumberField id="cv-limit" label={m.common.defaultUserLimit()} hint={m.common.zeroMeansUnlimited()}
                   value={hub.defaultUserLimit} min={0} max={99}
                   onchange={(v) => patch({ defaultUserLimit: v ?? 0 }, "typing")} />
      <div>
        <span id="cv-bitrate-label" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.customvoice.bitrateLabel()}</span>
        <DiscordSelector type="custom" customIcon="fa-volume" options={bitrateOptions}
                         selected={String(hub.defaultBitrate)} searchable={false} clearable={false}
                         ariaLabelledby="cv-bitrate-label" placeholder={m.customvoice.bitratePlaceholder()}
                         onchange={({ selected }) => {
                           const v = Number(selectedString(selected));
                           if (v) patch({ defaultBitrate: v });
                         }} />
      </div>
    </div>
  </PluginCard>

  <PluginCard title={m.customvoice.cardLifecycle()} alwaysOpen>
    <ToggleRow checked={hub.deleteWhenEmpty} title={m.common.deleteChannelsWhenEmpty()} colors={$colorStore}
               onchange={(v) => patch({ deleteWhenEmpty: v })} />
    {#if hub.deleteWhenEmpty}
      <NumberField id="cv-timeout" label={m.customvoice.emptyTimeoutMinutes()} value={hub.emptyChannelTimeout}
                   min={1} max={1440} onchange={(v) => patch({ emptyChannelTimeout: v ?? 1 }, "typing")} />
      <ToggleRow checked={hub.cleanupLeftovers} title={m.customvoice.toggleCleanupLeftovers()} colors={$colorStore}
                 onchange={(v) => patch({ cleanupLeftovers: v })} />
    {/if}
    <ToggleRow checked={hub.allowMultipleChannels} title={m.customvoice.toggleMultiple()} colors={$colorStore}
               onchange={(v) => patch({ allowMultipleChannels: v })} />
    <ToggleRow checked={hub.createTextChannel} title={m.customvoice.toggleTextChannel()} colors={$colorStore}
               onchange={(v) => patch({ createTextChannel: v })} />
    <NumberField id="cv-owner-lock" label={m.customvoice.ownerLockMinutes()} hint={m.customvoice.ownerLockHint()}
                 value={hub.ownerLockMinutes} min={0} max={10080}
                 onchange={(v) => patch({ ownerLockMinutes: v ?? 0 }, "typing")} />
  </PluginCard>

  <PluginCard title={m.customvoice.cardMembers()} alwaysOpen>
    {#each memberToggles as toggle (toggle.key)}
      <ToggleRow checked={hub[toggle.key]} title={toggle.label} colors={$colorStore}
                 onchange={(v) => patch({ [toggle.key]: v })} />
    {/each}
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <NumberField id="cv-max-limit" label={m.customvoice.maxUserLimit()} value={hub.maxUserLimit}
                   min={1} max={99} onchange={(v) => patch({ maxUserLimit: v ?? 1 }, "typing")} />
      <NumberField id="cv-max-bitrate" label={m.customvoice.maxBitrate()} value={hub.maxBitrate}
                   min={8} max={384} onchange={(v) => patch({ maxBitrate: v ?? 8 }, "typing")} />
    </div>
  </PluginCard>

  <PluginCard title={m.customvoice.cardOwners()} alwaysOpen>
    {#each ownerToggles as toggle (toggle.key)}
      <ToggleRow checked={hub[toggle.key]} title={toggle.label} colors={$colorStore}
                 onchange={(v) => patch({ [toggle.key]: v })} />
    {/each}
    <div>
      <span id="cv-sync-label" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.customvoice.syncLabel()}</span>
      <DiscordSelector type="custom" customIcon="fa-shield" options={syncOptions}
                       selected={String(hub.syncPermissions)} searchable={false} clearable={false}
                       ariaLabelledby="cv-sync-label"
                       onchange={({ selected }) => {
                         const v = Number(selectedString(selected));
                         if (!Number.isNaN(v)) patch({ syncPermissions: v });
                       }} />
    </div>
  </PluginCard>

  <PluginCard title={m.customvoice.cardStaff()} alwaysOpen>
    <div>
      <span id="cv-admin-label" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.customvoice.adminRole()}</span>
      <DiscordSelector type="role" options={roles} selected={hub.adminRoleId} ariaLabelledby="cv-admin-label"
                       onchange={({ selected }) => patch({ adminRoleId: selectedString(selected) })} />
    </div>
    <div>
      <span id="cv-mod-label" class="block text-sm font-medium mb-1" style="color: {$colorStore.text}">{m.customvoice.moderatorRoles()}</span>
      <DiscordSelector type="role" multiple options={roles} selected={hub.moderatorRoleIds}
                       ariaLabelledby="cv-mod-label"
                       onchange={({ selected }) => patch({ moderatorRoleIds: Array.isArray(selected) ? selected : [] })} />
    </div>
  </PluginCard>
</div>
