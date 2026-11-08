<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "../NumberField.svelte";
  import type { Named } from "../automodModel";
  import ActionFields from "./ActionFields.svelte";
  import type { Patch, Status } from "./protectionModel";

  interface Props {
    status: Status;
    onpatch: Patch;
    ontoggle: (enabled: boolean) => void;
    roles: Named[];
  }

  let { status, onpatch, ontoggle, roles }: Props = $props();
</script>

<PluginCard title={m.automod.mentionTitle()} enabled={status.enabled} onToggle={ontoggle}>
  <div class="grid gap-4 sm:grid-cols-2">
    <NumberField
      id="mention-threshold"
      label={m.automod.mentionThreshold()}
      min={1}
      value={status.mentionThreshold}
      onchange={(value) => onpatch({ mentionThreshold: value }, "typing")}
    />
    <NumberField
      id="mention-window"
      label={m.automod.windowSeconds()}
      min={1}
      value={status.timeWindowSeconds}
      onchange={(value) => onpatch({ timeWindowSeconds: value }, "typing")}
    />
    <NumberField
      id="mention-max"
      label={m.automod.mentionMax()}
      min={1}
      value={status.maxMentionsInTimeWindow}
      onchange={(value) => onpatch({ maxMentionsInTimeWindow: value }, "typing")}
    />
    <ActionFields id="mention" {status} {onpatch} {roles} durationKey="muteTime" />
  </div>
  <ToggleRow
    checked={status.ignoreBots}
    title={m.common.ignoreBots()}
    colors={$colorStore}
    onchange={(value) => onpatch({ ignoreBots: value }, "now")}
  />
</PluginCard>
