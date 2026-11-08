<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "../NumberField.svelte";
  import type { Named } from "../automodModel";
  import ActionFields from "./ActionFields.svelte";
  import TriggerCount from "./TriggerCount.svelte";
  import type { Patch, Status } from "./protectionModel";

  interface Props {
    status: Status;
    onpatch: Patch;
    ontoggle: (enabled: boolean) => void;
    roles: Named[];
  }

  let { status, onpatch, ontoggle, roles }: Props = $props();

  const toggles = $derived([
    { key: "blockInvites", label: m.automod.externalInvites() },
    { key: "deleteMessages", label: m.automod.deleteMessages() },
    { key: "notifyUser", label: m.automod.notifyMember() }
  ]);
</script>

<PluginCard title={m.automod.externalTitle()} enabled={status.enabled} onToggle={ontoggle}>
  <div class="grid gap-4 sm:grid-cols-2">
    <NumberField
      id="external-mentions"
      label={m.automod.externalMentions()}
      min={0}
      max={100}
      hint={m.automod.zeroOff()}
      value={status.mentionThreshold}
      onchange={(value) => onpatch({ mentionThreshold: value }, "typing")}
    />
    <NumberField
      id="external-messages"
      label={m.automod.externalMessages()}
      min={0}
      max={100}
      hint={m.automod.zeroOff()}
      value={status.maxMessages}
      onchange={(value) => onpatch({ maxMessages: value }, "typing")}
    />
    <NumberField
      id="external-window"
      label={m.automod.windowSeconds()}
      min={1}
      max={300}
      value={status.timeWindowSeconds}
      onchange={(value) => onpatch({ timeWindowSeconds: value }, "typing")}
    />
    <ActionFields id="external" {status} {onpatch} {roles} durationKey="punishDuration" maxDuration={40320} deleteOnly />
  </div>
  <div class="grid gap-2 sm:grid-cols-2">
    {#each toggles as toggle (toggle.key)}
      <ToggleRow
        checked={status[toggle.key]}
        title={toggle.label}
        colors={$colorStore}
        onchange={(value) => onpatch({ [toggle.key]: value }, "now")}
      />
    {/each}
  </div>
  <TriggerCount count={Number(status.counter ?? 0)} />
</PluginCard>
