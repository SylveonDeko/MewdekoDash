<script lang="ts">
  import { m } from "$lib/i18n";
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
</script>

<PluginCard title={m.automod.altTitle()} enabled={status.enabled} onToggle={ontoggle}>
  <div class="grid gap-4 sm:grid-cols-2">
    <NumberField
      id="alt-age"
      label={m.automod.altMinAge()}
      min={1}
      max={525600}
      value={status.minAgeMinutes}
      onchange={(value) => onpatch({ minAgeMinutes: value }, "typing")}
    />
    <ActionFields id="alt" {status} {onpatch} {roles} durationKey="actionDurationMinutes" />
  </div>
  <TriggerCount count={Number(status.counter ?? 0)} />
</PluginCard>
