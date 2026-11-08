<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import { ticketApi } from "$lib/api/index.ts";
  import type { TicketSettings } from "$lib/api/ticket/models";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import { idBigints, idOrNull, idStrings, type Named } from "../ticketModel";

  interface Props {
    guildId: bigint;
    settings: TicketSettings;
    channels: Named[];
    roles: Named[];
    autoSave: AutoSave;
  }

  let { guildId, settings, channels, roles, autoSave }: Props = $props();

  const initial = untrack(() => settings);
  let transcriptChannel = $state<string | null>(initial.transcriptChannelId ? String(initial.transcriptChannelId) : null);
  let logChannel = $state<string | null>(initial.logChannelId ? String(initial.logChannelId) : null);
  let dmTranscript = $state(initial.dmTranscriptOnClose ?? false);
  let staffPings = $state(initial.enableStaffPings ?? false);
  let dmNotifications = $state(initial.enableDmNotifications ?? false);
  let notificationRoles = $state<string[]>(idStrings(initial.notificationRoles));

  function saveChannel(kind: "transcript" | "log", value: string | null) {
    const previous = kind === "transcript" ? transcriptChannel : logChannel;
    if (kind === "transcript") transcriptChannel = value;
    else logChannel = value;
    const channelId = value ? BigInt(value) : 0n;
    return autoSave.now(`${kind}-channel`, async () => {
      try {
        if (kind === "transcript") await ticketApi.setTicketTranscriptChannel(guildId, { channelId });
        else await ticketApi.setTicketLogChannel(guildId, { channelId });
      } catch (err) {
        if (kind === "transcript") transcriptChannel = previous;
        else logChannel = previous;
        throw err;
      }
    });
  }

  function saveDmTranscript(enabled: boolean) {
    const previous = dmTranscript;
    dmTranscript = enabled;
    return autoSave.now("dm-transcript", async () => {
      try {
        await ticketApi.setTicketDmTranscript(guildId, enabled);
      } catch (err) {
        dmTranscript = previous;
        throw err;
      }
    });
  }

  function saveNotifications(patch: { staffPings?: boolean; dmNotifications?: boolean; roles?: string[] }) {
    const before = { staffPings, dmNotifications, roles: notificationRoles };
    if (patch.staffPings !== undefined) staffPings = patch.staffPings;
    if (patch.dmNotifications !== undefined) dmNotifications = patch.dmNotifications;
    if (patch.roles !== undefined) notificationRoles = patch.roles;
    return autoSave.now("notifications", async () => {
      try {
        await ticketApi.setTicketNotifications(guildId, {
          enableStaffPings: staffPings,
          enableDmNotifications: dmNotifications,
          notificationRoles: idBigints(notificationRoles)
        });
      } catch (err) {
        staffPings = before.staffPings;
        dmNotifications = before.dmNotifications;
        notificationRoles = before.roles;
        throw err;
      }
    });
  }
</script>

<PluginCard title={m.common.settings()}>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <SettingField label={m.tickets.transcriptChannel()} id="ticket-transcript-channel">
      <DiscordSelector
        id="ticket-transcript-channel"
        type="channel"
        options={channels}
        selected={transcriptChannel}
        placeholder={m.common.selectChannelPlaceholder()}
        onchange={(d) => saveChannel("transcript", idOrNull(d.selected))}
      />
    </SettingField>
    <SettingField label={m.common.logChannel()} id="ticket-log-channel">
      <DiscordSelector
        id="ticket-log-channel"
        type="channel"
        options={channels}
        selected={logChannel}
        placeholder={m.common.selectChannelPlaceholder()}
        onchange={(d) => saveChannel("log", idOrNull(d.selected))}
      />
    </SettingField>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
    <ToggleRow colors={$colorStore} checked={dmTranscript} title={m.tickets.dmTranscriptEveryTicket()} onchange={saveDmTranscript} />
    <ToggleRow colors={$colorStore} checked={dmNotifications} title={m.tickets.dmNotifications()} onchange={(on) => saveNotifications({ dmNotifications: on })} />
    <ToggleRow colors={$colorStore} checked={staffPings} title={m.tickets.staffPings()} onchange={(on) => saveNotifications({ staffPings: on })} />
  </div>

  {#if staffPings}
    <SettingField label={m.tickets.notificationRoles()} id="ticket-notification-roles">
      <DiscordSelector
        id="ticket-notification-roles"
        type="role"
        multiple={true}
        options={roles}
        selected={notificationRoles}
        placeholder={m.common.selectRolesPlaceholder()}
        onchange={(d) => saveNotifications({ roles: Array.isArray(d.selected) ? d.selected : [] })}
      />
    </SettingField>
  {/if}
</PluginCard>
