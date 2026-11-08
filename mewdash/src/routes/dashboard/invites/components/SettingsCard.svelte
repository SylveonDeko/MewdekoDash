<script lang="ts">
  import { m } from "$lib/i18n";
  import type { InviteTrackingSettings } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "./NumberField.svelte";
  import { idString, type Named } from "./inviteModel";

  interface Props {
    settings: InviteTrackingSettings;
    minAgeDays: number;
    channels: Named[];
    onflag: (key: "removeInviteOnLeave" | "countRejoins" | "fakeOnNoAvatar", value: boolean) => void;
    onchannel: (key: "linkChannelId" | "logChannelId", value: string | null) => void;
    onminage: (days: number) => void;
  }

  let { settings, minAgeDays, channels, onflag, onchannel, onminage }: Props = $props();

  function one(detail: { selected: string | string[] | null }): string | null {
    const value = Array.isArray(detail.selected) ? detail.selected[0] : detail.selected;
    return value || null;
  }
</script>

<PluginCard title={m.common.settings()} alwaysOpen>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <ToggleRow checked={settings.removeInviteOnLeave} title={m.invites.settingsRemoveOnLeave()} colors={$colorStore} onchange={(v) => onflag("removeInviteOnLeave", v)} />
    <ToggleRow checked={settings.countRejoins} title={m.invites.settingsCountRejoins()} colors={$colorStore} onchange={(v) => onflag("countRejoins", v)} />
    <ToggleRow checked={settings.fakeOnNoAvatar} title={m.invites.settingsFakeNoAvatar()} colors={$colorStore} onchange={(v) => onflag("fakeOnNoAvatar", v)} />
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <NumberField
      id="invites-min-age"
      label={m.common.minAccountAgeDays()}
      hint={m.invites.minAgeOff()}
      value={minAgeDays}
      min={0}
      max={300}
      onchange={(value) => onminage(value ?? 0)}
    />
    <SettingField label={m.invites.settingsLinkChannel()} id="invites-link-channel">
      <DiscordSelector
        id="invites-link-channel"
        type="channel"
        options={channels}
        selected={settings.linkChannelId ? idString(settings.linkChannelId) : null}
        placeholder={m.invites.settingsLinkChannelPlaceholder()}
        onchange={(detail) => onchannel("linkChannelId", one(detail))}
      />
    </SettingField>
    <SettingField label={m.invites.settingsLogChannel()} id="invites-log-channel">
      <DiscordSelector
        id="invites-log-channel"
        type="channel"
        options={channels}
        selected={settings.logChannelId ? idString(settings.logChannelId) : null}
        placeholder={m.common.disabled()}
        onchange={(detail) => onchannel("logChannelId", one(detail))}
      />
    </SettingField>
  </div>
</PluginCard>
