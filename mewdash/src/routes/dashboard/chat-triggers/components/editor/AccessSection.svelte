<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import EditorGroup from "./EditorGroup.svelte";
  import type { Named, SectionProps } from "./editorTypes";
  import { joinList, splitList } from "../triggerModel";

  interface Props extends SectionProps {
    channels: Named[];
    roles: Named[];
  }

  let { trigger, change, channels, roles }: Props = $props();

  const count = $derived(
    [
      trigger.staffOnly,
      trigger.nsfwOnly,
      trigger.allowBots,
      !!trigger.allowedChannelIds,
      !!trigger.deniedChannelIds,
      !!trigger.deniedRoleIds
    ].filter(Boolean).length
  );

  let open = $state(false);

  function listOf(detail: { selected: string | string[] | null }): string | null {
    return joinList(Array.isArray(detail.selected) ? detail.selected : []);
  }
</script>

<EditorGroup title={m.chatTriggers.groupAccess()} {count} bind:open>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <ToggleRow colors={$colorStore} checked={trigger.staffOnly} title={m.chatTriggers.staffOnly()} onchange={(v) => change({ staffOnly: v })} />
    <ToggleRow colors={$colorStore} checked={trigger.nsfwOnly} title={m.chatTriggers.nsfwOnly()} onchange={(v) => change({ nsfwOnly: v })} />
    <ToggleRow colors={$colorStore} checked={trigger.allowBots} title={m.chatTriggers.allowBots()} onchange={(v) => change({ allowBots: v })} />
  </div>

  <SettingField label={m.chatTriggers.allowedChannels()} id="ct-allowed-channels">
    <DiscordSelector
      id="ct-allowed-channels"
      type="channel"
      multiple={true}
      options={channels}
      selected={splitList(trigger.allowedChannelIds)}
      placeholder={m.chatTriggers.allowedChannelsPlaceholder()}
      onchange={(detail) => change({ allowedChannelIds: listOf(detail) })}
    />
  </SettingField>

  <SettingField label={m.chatTriggers.deniedChannels()} id="ct-denied-channels">
    <DiscordSelector
      id="ct-denied-channels"
      type="channel"
      multiple={true}
      options={channels}
      selected={splitList(trigger.deniedChannelIds)}
      placeholder={m.chatTriggers.deniedChannelsPlaceholder()}
      onchange={(detail) => change({ deniedChannelIds: listOf(detail) })}
    />
  </SettingField>

  <SettingField label={m.chatTriggers.deniedRoles()} id="ct-denied-roles">
    <DiscordSelector
      id="ct-denied-roles"
      type="role"
      multiple={true}
      options={roles}
      selected={splitList(trigger.deniedRoleIds)}
      placeholder={m.chatTriggers.deniedRolesPlaceholder()}
      onchange={(detail) => change({ deniedRoleIds: listOf(detail) })}
    />
  </SettingField>
</EditorGroup>
