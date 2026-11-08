<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { Feature, hasFeature, type Change, type FeatureBit, type Form, type Role } from "./birthdayModel";

  interface Props {
    form: Form;
    roles: Role[];
    onchange: Change;
    onfeature: (bit: FeatureBit, enabled: boolean) => void;
  }

  let { form, roles, onchange, onfeature }: Props = $props();

  function one(detail: { selected: string | string[] | null }): string | null {
    const value = Array.isArray(detail.selected) ? detail.selected[0] : detail.selected;
    return value || null;
  }
</script>

<PluginCard title={m.common.roles()} alwaysOpen>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="space-y-3">
      <ToggleRow checked={hasFeature(form.features, Feature.BirthdayRole)} title={m.birthday.featureRole()} colors={$colorStore} onchange={(value) => onfeature(Feature.BirthdayRole, value)} />
      <SettingField label={m.birthday.configRole()} id="birthday-role">
        <DiscordSelector id="birthday-role" type="role" options={roles} selected={form.role} placeholder={m.common.noRoleSelected()} onchange={(detail) => onchange("role", one(detail))} />
      </SettingField>
    </div>
    <div class="space-y-3">
      <ToggleRow checked={hasFeature(form.features, Feature.PingRole)} title={m.common.pingRole()} colors={$colorStore} onchange={(value) => onfeature(Feature.PingRole, value)} />
      <SettingField label={m.birthday.configPingRole()} id="birthday-ping-role">
        <DiscordSelector id="birthday-ping-role" type="role" options={roles} selected={form.pingRole} placeholder={m.common.noPingRole()} onchange={(detail) => onchange("pingRole", one(detail))} />
      </SettingField>
    </div>
  </div>
</PluginCard>
