<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import type { Change, Form, Named } from "./birthdayModel";

  interface Props {
    form: Form;
    channels: Named[];
    user?: DiscordUser | null;
    onchange: Change;
  }

  let { form, channels, user = null, onchange }: Props = $props();

  const placeholders = $derived(
    [
      [m.placeholders.categoryUser(), "%user.mention%", m.placeholders.userMention()],
      [m.placeholders.categoryUser(), "%user.name%", m.placeholders.userName()],
      [m.placeholders.categoryUser(), "%user.displayname%", m.placeholders.userDisplayname()],
      [m.placeholders.categoryUser(), "%birthday.age%", m.placeholders.birthdayAge()],
      [m.features.categoryServer(), "%server.name%", m.placeholders.serverName()],
      [m.features.categoryServer(), "%server.time%", m.placeholders.serverTime()]
    ].map(([category, name, description]) => ({ category, name, description }))
  );

  const rules = $derived([
    { id: "0", name: m.birthday.yearNotAllowed() },
    { id: "1", name: m.birthday.yearOptional() },
    { id: "2", name: m.birthday.yearRequired() }
  ]);

  function one(detail: { selected: string | string[] | null }): string | null {
    const value = Array.isArray(detail.selected) ? detail.selected[0] : detail.selected;
    return value || null;
  }
</script>

<PluginCard title={m.common.announcements()} alwaysOpen>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SettingField label={m.birthday.configChannel()} id="birthday-channel">
      <DiscordSelector
        id="birthday-channel"
        type="channel"
        options={channels}
        selected={form.channel}
        placeholder={m.common.noChannelSelected()}
        onchange={(detail) => onchange("channel", one(detail))}
      />
    </SettingField>
    <SettingField label={m.birthday.yearRuleLabel()} id="birthday-year-rule">
      <DiscordSelector
        id="birthday-year-rule"
        type="custom"
        customIcon="fa-cake-candles"
        options={rules}
        selected={String(form.yearRule)}
        clearable={false}
        searchable={false}
        onchange={(detail) => onchange("yearRule", Number(one(detail) ?? 0))}
      />
    </SettingField>
  </div>

  <div class="space-y-2">
    <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.features.wizardBirthdayStepMessageTitle()}</span>
    <MessageField
      value={form.message}
      previewTitle={m.features.wizardBirthdayStepMessageTitle()}
      icon="fa-cake-candles"
      {user}
      {placeholders}
      placeholder={m.birthday.messagePlaceholder()}
      onchange={(message) => onchange("message", message, "typing")}
    />
  </div>

  {#if form.yearRule !== 0}
    <div class="space-y-2">
      <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.birthday.ageMessageTitle()}</span>
      <MessageField
        value={form.ageMessage}
        previewTitle={m.birthday.ageMessageTitle()}
        icon="fa-cake-candles"
        {user}
        {placeholders}
        placeholder={m.birthday.messagePlaceholder()}
        onchange={(message) => onchange("ageMessage", message, "typing")}
      />
    </div>
  {/if}
</PluginCard>
