<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import NumberField from "$lib/components/plugin/NumberField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { idOrNull, type Named, type Patch, type Settings } from "./settingsModel";

  interface Props {
    settings: Settings;
    channels: Named[];
    onpatch: Patch;
  }

  let { settings, channels, onpatch }: Props = $props();

  const actions = $derived([
    { id: "0", name: m.settings.warnActionClear() },
    { id: "1", name: m.settings.warnActionDelete() }
  ]);
</script>

<PluginCard title={m.settings.cardLogs()} alwaysOpen>
  <div class="grid gap-4 sm:grid-cols-2">
    <SettingField label={m.settings.pageCmdlogTitle()} id="settings-cmdlog">
      <DiscordSelector
        id="settings-cmdlog"
        type="channel"
        options={channels}
        selected={idOrNull(settings.commandLogChannel)}
        placeholder={m.settings.pageCmdlogPlaceholder()}
        onchange={({ selected }) =>
          onpatch({ commandLogChannel: BigInt(typeof selected === "string" && selected ? selected : 0) }, "now")}
      />
    </SettingField>
    <SettingField label={m.common.warningLogChannel()} id="settings-warnlog">
      <DiscordSelector
        id="settings-warnlog"
        type="channel"
        options={channels}
        selected={idOrNull(settings.warnlogChannelId)}
        placeholder={m.settings.pageWarnlogPlaceholder()}
        onchange={({ selected }) =>
          onpatch({ warnlogChannelId: BigInt(typeof selected === "string" && selected ? selected : 0) }, "now")}
      />
    </SettingField>
  </div>
</PluginCard>

<PluginCard title={m.settings.cardModeration()} alwaysOpen>
  <div class="grid gap-4 sm:grid-cols-2">
    <NumberField
      id="settings-warn-expiry"
      label={m.settings.pageWarnexpiryTitle()}
      hint={m.settings.pageWarnexpiryHint()}
      value={settings.warnExpireHours}
      onchange={(value) => onpatch({ warnExpireHours: value ?? 0 }, "typing")}
    />
    <SettingField label={m.settings.warnActionTitle()} id="settings-warn-action">
      <DiscordSelector
        id="settings-warn-action"
        type="custom"
        options={actions}
        selected={String(settings.warnExpireAction)}
        searchable={false}
        clearable={false}
        customIcon="fa-clock"
        onchange={({ selected }) => onpatch({ warnExpireAction: Number(selected) || 0 }, "now")}
      />
    </SettingField>
    <SettingField label={m.settings.pageMuteTitle()} id="settings-mute-role">
      <input
        id="settings-mute-role"
        type="text"
        value={settings.muteRoleName}
        maxlength="100"
        placeholder={m.settings.pageMutePlaceholder()}
        autocomplete="off"
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        oninput={(e) => onpatch({ muteRoleName: e.currentTarget.value }, "typing")}
      >
    </SettingField>
  </div>
  <ToggleRow
    checked={settings.removeRolesOnMute}
    title={m.settings.pageMuteRemoveRoles()}
    colors={$colorStore}
    onchange={(on) => onpatch({ removeRolesOnMute: on }, "now")}
  />
</PluginCard>
