<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { FormSettings } from "$lib/utils/formSettings";
  import type { DiscordUser } from "$lib/types/discord";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "../NumberField.svelte";
  import { formatDate, type Named } from "../formsModel";

  interface Props {
    settings: FormSettings;
    channels: Named[];
    roles: Named[];
    announcedAt: string | null;
    user: DiscordUser | null;
  }

  let { settings = $bindable(), channels, roles, announcedAt, user }: Props = $props();

  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);

  const placeholders = $derived([
    { category: m.features.categoryServer(), name: "%server%", description: m.placeholders.server() },
    { category: m.features.categoryServer(), name: "%server.members%", description: m.placeholders.serverMembers() }
  ]);

  function pick(selected: unknown): string {
    return typeof selected === "string" ? selected : "";
  }
</script>

<PluginCard title={m.forms.settingsWhenItIsOpenTitle()} alwaysOpen>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <SettingField label={m.forms.settingsOpensAt()} id="form-opens-at">
      <input id="form-opens-at" type="datetime-local" bind:value={settings.opensAt} class="w-full p-3 rounded-lg border min-h-[50px]" style={inputStyle} />
    </SettingField>
    <SettingField label={m.forms.settingsExpiresAt()} id="form-expires-at">
      <input id="form-expires-at" type="datetime-local" bind:value={settings.expiresAt} class="w-full p-3 rounded-lg border min-h-[50px]" style={inputStyle} />
    </SettingField>
  </div>

  <NumberField
    id="form-max-responses"
    label={m.forms.settingsMaxResponses()}
    min={1}
    value={settings.maxResponses}
    placeholder={m.common.noLimit()}
    onchange={(value) => (settings.maxResponses = value)}
  />

  <ToggleRow colors={$colorStore} checked={settings.allowMultipleSubmissions} title={m.forms.settingsAllowMultiple()} onchange={(on) => (settings.allowMultipleSubmissions = on)} />
  {#if !settings.allowMultipleSubmissions}
    <ToggleRow
      colors={$colorStore}
      checked={settings.allowResubmitAfterRejection}
      title={m.forms.settingsAllowResubmit()}
      onchange={(on) => (settings.allowResubmitAfterRejection = on)}
    />
  {/if}
  <ToggleRow colors={$colorStore} checked={settings.requireCaptcha} title={m.forms.settingsRequireCaptcha()} onchange={(on) => (settings.requireCaptcha = on)} />
</PluginCard>

<PluginCard title={m.forms.settingsAnnounceChannel()} alwaysOpen>
  <SettingField label={m.common.channel()} id="form-announce-channel">
    <DiscordSelector
      id="form-announce-channel"
      type="channel"
      options={channels}
      selected={settings.announceChannelId}
      placeholder={m.forms.settingsDoNotAnnouncePlaceholder()}
      onchange={({ selected }) => (settings.announceChannelId = pick(selected))}
    />
  </SettingField>

  {#if settings.announceChannelId}
    <SettingField label={m.forms.settingsAnnounceRole()} id="form-announce-role">
      <DiscordSelector
        id="form-announce-role"
        type="role"
        options={roles}
        selected={settings.announceRoleId}
        placeholder={m.forms.settingsPingNobodyPlaceholder()}
        onchange={({ selected }) => (settings.announceRoleId = pick(selected))}
      />
    </SettingField>

    <MessageField
      value={settings.announceMessage}
      previewTitle={m.forms.settingsAnnounceMessage()}
      icon="fa-bell"
      {user}
      {placeholders}
      onchange={(message) => (settings.announceMessage = message)}
    />

    {#if announcedAt}
      <p class="text-sm" style="color: {$colorStore.muted}">{m.forms.settingsAnnounced({ date: formatDate(announcedAt) })}</p>
    {/if}
  {/if}
</PluginCard>
