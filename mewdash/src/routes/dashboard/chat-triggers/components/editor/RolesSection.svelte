<script lang="ts">
  import { m } from "$lib/i18n";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import EditorGroup from "./EditorGroup.svelte";
  import type { Named, SectionProps } from "./editorTypes";
  import { joinList, splitList } from "../triggerModel";

  interface Props extends SectionProps {
    roles: Named[];
  }

  let { trigger, change, roles }: Props = $props();

  const grantTargets = $derived([
    { id: "0", name: m.chatTriggers.grantUser() },
    { id: "1", name: m.chatTriggers.grantMentioned() },
    { id: "2", name: m.common.both() }
  ]);

  const count = $derived([!!trigger.grantedRoles, !!trigger.removedRoles].filter(Boolean).length);

  let open = $state(false);

  function listOf(detail: { selected: string | string[] | null }): string | null {
    return joinList(Array.isArray(detail.selected) ? detail.selected : []);
  }
</script>

<EditorGroup title={m.chatTriggers.groupRoles()} {count} bind:open>
  <SettingField label={m.chatTriggers.rolesToGrant()} id="ct-granted-roles">
    <DiscordSelector
      id="ct-granted-roles"
      type="role"
      multiple={true}
      options={roles}
      selected={splitList(trigger.grantedRoles)}
      placeholder={m.chatTriggers.rolesNoneGranted()}
      onchange={(detail) => change({ grantedRoles: listOf(detail) })}
    />
  </SettingField>
  <SettingField label={m.chatTriggers.rolesToRemove()} id="ct-removed-roles">
    <DiscordSelector
      id="ct-removed-roles"
      type="role"
      multiple={true}
      options={roles}
      selected={splitList(trigger.removedRoles)}
      placeholder={m.chatTriggers.rolesNoneRemoved()}
      onchange={(detail) => change({ removedRoles: listOf(detail) })}
    />
  </SettingField>
  <SettingField label={m.chatTriggers.rolesApplyTo()} id="ct-grant-type">
    <DiscordSelector
      id="ct-grant-type"
      type="custom"
      options={grantTargets}
      selected={String(trigger.roleGrantType)}
      searchable={false}
      clearable={false}
      customIcon="fa-users"
      onchange={(detail) => typeof detail.selected === "string" && change({ roleGrantType: Number(detail.selected) })}
    />
  </SettingField>
</EditorGroup>
