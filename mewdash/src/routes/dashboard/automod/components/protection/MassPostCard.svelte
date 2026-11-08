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
    { key: "checkLinksOnly", label: m.automod.massPostLinksOnly() },
    { key: "deleteMessages", label: m.automod.deleteMessages() },
    { key: "notifyUser", label: m.automod.notifyMember() },
    { key: "ignoreBots", label: m.common.ignoreBots() }
  ]);
</script>

<PluginCard title={m.automod.massPostTitle()} enabled={status.enabled} onToggle={ontoggle}>
  <div class="grid gap-4 sm:grid-cols-2">
    <NumberField
      id="masspost-channels"
      label={m.automod.massPostChannels()}
      min={2}
      max={20}
      value={status.channelThreshold}
      onchange={(value) => onpatch({ channelThreshold: value }, "typing")}
    />
    <NumberField
      id="masspost-window"
      label={m.automod.windowSeconds()}
      min={10}
      max={600}
      value={status.timeWindowSeconds}
      onchange={(value) => onpatch({ timeWindowSeconds: value }, "typing")}
    />
    <ActionFields id="masspost" {status} {onpatch} {roles} durationKey="punishDuration" />
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
