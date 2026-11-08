<script lang="ts">
  import { m } from "$lib/i18n";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import NumberField from "../NumberField.svelte";
  import type { Named } from "../automodModel";
  import { Action, TIMED_ACTIONS, type Patch, type Status } from "./protectionModel";

  interface Props {
    id: string;
    status: Status;
    onpatch: Patch;
    roles: Named[];
    /** The setting that holds the duration. */
    durationKey: string;
    maxDuration?: number;
    deleteOnly?: boolean;
    allowRole?: boolean;
  }

  let { id, status, onpatch, roles, durationKey, maxDuration = 1440, deleteOnly = false, allowRole = true }: Props = $props();

  const options = $derived([
    ...(deleteOnly ? [{ id: String(Action.Delete), name: m.automod.actionDelete() }] : []),
    { id: String(Action.Warn), name: m.common.warn() },
    { id: String(Action.Timeout), name: m.common.timeout() },
    { id: String(Action.Mute), name: m.common.actionMute() },
    { id: String(Action.Kick), name: m.common.actionKick() },
    { id: String(Action.Ban), name: m.common.actionBan() },
    ...(allowRole ? [{ id: String(Action.AddRole), name: m.common.addRole() }] : [])
  ]);

  const action = $derived(Number(status.action));
  const timed = $derived(TIMED_ACTIONS.includes(action));

  function choose(next: number) {
    const changes: Status = { action: next };
    if (next === Action.Timeout && Number(status[durationKey]) < 1) changes[durationKey] = 60;
    onpatch(changes, "now");
  }
</script>

<SettingField label={m.common.action()} id="{id}-action">
  <DiscordSelector
    id="{id}-action"
    type="custom"
    {options}
    selected={String(action)}
    searchable={false}
    clearable={false}
    customIcon="fa-bolt"
    onchange={({ selected }) => choose(Number(selected))}
  />
</SettingField>

{#if timed}
  <NumberField
    id="{id}-duration"
    label={m.common.durationMinutes()}
    min={action === Action.Timeout ? 1 : 0}
    max={maxDuration}
    value={Number(status[durationKey])}
    onchange={(value) => onpatch({ [durationKey]: value }, "typing")}
  />
{/if}

{#if allowRole && action === Action.AddRole}
  <SettingField label={m.common.role()} id="{id}-role">
    <DiscordSelector
      id="{id}-role"
      type="role"
      options={roles}
      selected={status.roleId}
      clearable={false}
      onchange={({ selected }) => onpatch({ roleId: (selected as string) ?? null }, "now")}
    />
  </SettingField>
{/if}
