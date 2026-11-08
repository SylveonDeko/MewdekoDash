<script lang="ts">
  import { m } from "$lib/i18n";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
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
    channels: Named[];
    onignored: (ids: string[]) => void;
  }

  let { status, onpatch, ontoggle, roles, channels, onignored }: Props = $props();
</script>

<PluginCard title={m.automod.spamTitle()} enabled={status.enabled} onToggle={ontoggle}>
  <div class="grid gap-4 sm:grid-cols-2">
    <NumberField
      id="spam-messages"
      label={m.automod.spamMessages()}
      min={2}
      max={10}
      value={status.messageThreshold}
      onchange={(value) => onpatch({ messageThreshold: value }, "typing")}
    />
    <ActionFields id="spam" {status} {onpatch} {roles} durationKey="muteTime" />
  </div>
  <SettingField label={m.common.ignoredChannels()} id="spam-ignored">
    <DiscordSelector
      id="spam-ignored"
      type="channel"
      options={channels}
      selected={status.ignoredChannels}
      multiple
      placeholder={m.common.addAChannel()}
      onchange={({ selected }) => onignored(Array.isArray(selected) ? selected : [])}
    />
  </SettingField>
</PluginCard>
