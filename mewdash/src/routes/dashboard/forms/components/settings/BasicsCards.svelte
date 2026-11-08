<script lang="ts">
  import { m } from "$lib/i18n";
  import { FORM_TYPES, intToFormType, type FormType } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import type { FormSettings } from "$lib/utils/formSettings";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import { formTypeDescription, formTypeLabel } from "$lib/components/forms/formLabels";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "../NumberField.svelte";
  import type { Named } from "../formsModel";

  interface Props {
    settings: FormSettings;
    channels: Named[];
    roles: Named[];
    creating: boolean;
  }

  let { settings = $bindable(), channels, roles, creating }: Props = $props();

  const regular = $derived(settings.formType === "Regular");
  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);

  function pick(selected: unknown): string {
    return typeof selected === "string" ? selected : "";
  }

  function chooseType(type: FormType) {
    settings.formType = type;
  }
</script>

<PluginCard title={m.common.basics()} alwaysOpen>
  <SettingField label={m.forms.settingsFormType()} id="form-type">
    {#if creating}
      <div id="form-type" class="grid grid-cols-1 sm:grid-cols-3 gap-2" role="group" aria-label={m.forms.settingsFormType()}>
        {#each FORM_TYPES as choice (choice.type)}
          {@const selected = settings.formType === choice.type}
          <button
            type="button"
            class="min-h-[50px] p-3 rounded-lg border text-left flex items-start gap-3"
            style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
            aria-pressed={selected}
            onclick={() => chooseType(choice.type)}
          >
            <i class="fa-solid {choice.icon} mt-0.5" aria-hidden="true"></i>
            <span class="min-w-0">
              <span class="block text-sm font-medium">{formTypeLabel(choice.type)}</span>
              <span class="block text-xs" style="color: {$colorStore.muted}">{formTypeDescription(choice.type)}</span>
            </span>
          </button>
        {/each}
      </div>
    {:else}
      <div id="form-type" class="p-3 rounded-lg border flex items-center gap-2 min-h-[50px]" style={inputStyle}>
        <i class="fa-solid {FORM_TYPES.find((x) => x.type === settings.formType)?.icon ?? 'fa-clipboard-list'}" aria-hidden="true"></i>
        <span class="text-sm">{formTypeLabel(settings.formType)}</span>
      </div>
    {/if}
  </SettingField>

  <SettingField label={m.common.name()} id="form-name" required>
    <input
      id="form-name"
      type="text"
      bind:value={settings.name}
      maxlength="255"
      placeholder={m.forms.settingsStaffApplicationPlaceholder()}
      class="w-full p-3 rounded-lg border min-h-[50px]"
      style={inputStyle}
    />
  </SettingField>

  <SettingField label={m.common.description()} id="form-description">
    <textarea
      id="form-description"
      bind:value={settings.description}
      rows="2"
      maxlength="2000"
      placeholder={m.forms.settingsTellPeopleWhatThisFormPlaceholder()}
      class="w-full p-3 rounded-lg border resize-none"
      style={inputStyle}
    ></textarea>
  </SettingField>

  <SettingField label={m.forms.settingsSubmitChannel()} id="form-submit-channel">
    <DiscordSelector
      id="form-submit-channel"
      type="channel"
      options={channels}
      selected={settings.submitChannelId}
      placeholder={m.common.selectAChannelPlaceholder()}
      onchange={({ selected }) => (settings.submitChannelId = pick(selected))}
    />
  </SettingField>

  <SettingField label={m.forms.settingsSuccessMessage()} id="form-success">
    <textarea
      id="form-success"
      bind:value={settings.successMessage}
      rows="2"
      maxlength="1000"
      placeholder={m.forms.settingsThanksWeHaveYourAnswersPlaceholder()}
      class="w-full p-3 rounded-lg border resize-none"
      style={inputStyle}
    ></textarea>
  </SettingField>

  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <ToggleRow colors={$colorStore} checked={settings.isDraft} title={m.forms.listDraft()} subtitle={m.forms.settingsIsDraftHint()} onchange={(on) => (settings.isDraft = on)} />
    <ToggleRow colors={$colorStore} checked={settings.isActive} title={m.forms.settingsIsActive()} onchange={(on) => (settings.isActive = on)} />
  </div>
</PluginCard>

<PluginCard title={m.forms.settingsWhoCanSubmitTitle()} alwaysOpen>
  {#if regular}
    <SettingField label={m.forms.settingsRequiredRole()} id="form-required-role">
      <DiscordSelector
        id="form-required-role"
        type="role"
        options={roles}
        selected={settings.requiredRoleId}
        placeholder={m.forms.settingsAnyoneInTheServerPlaceholder()}
        onchange={({ selected }) => (settings.requiredRoleId = pick(selected))}
      />
    </SettingField>
  {/if}

  <NumberField
    id="form-min-age"
    label={m.forms.settingsMinAccountAge()}
    value={settings.minAccountAgeDays}
    placeholder={m.common.noLimit()}
    onchange={(value) => (settings.minAccountAgeDays = value)}
  />

  {#if regular}
    <ToggleRow colors={$colorStore} checked={settings.allowExternalUsers} title={m.forms.settingsAllowExternal()} onchange={(on) => (settings.allowExternalUsers = on)} />
    <ToggleRow
      colors={$colorStore}
      checked={settings.allowAnonymous}
      title={m.forms.settingsAllowAnonymous()}
      subtitle={m.forms.settingsAllowAnonymousHint()}
      onchange={(on) => (settings.allowAnonymous = on)}
    />
  {/if}
</PluginCard>
