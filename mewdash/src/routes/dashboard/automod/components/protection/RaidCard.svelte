<script lang="ts">
  import { m } from "$lib/i18n";
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

<PluginCard title={m.automod.raidTitle()} enabled={status.enabled} onToggle={ontoggle}>
  <div class="grid gap-4 sm:grid-cols-2">
    <NumberField
      id="raid-users"
      label={m.automod.raidUsers()}
      min={2}
      max={30}
      value={status.userThreshold}
      onchange={(value) => onpatch({ userThreshold: value }, "typing")}
    />
    <NumberField
      id="raid-seconds"
      label={m.automod.windowSeconds()}
      min={2}
      max={300}
      value={status.seconds}
      onchange={(value) => onpatch({ seconds: value }, "typing")}
    />
    <ActionFields id="raid" {status} {onpatch} {roles} durationKey="punishDuration" allowRole={false} />
  </div>
</PluginCard>
