<script lang="ts">
  import { m } from "$lib/i18n";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import EditorGroup from "./EditorGroup.svelte";
  import type { Named, SectionProps } from "./editorTypes";
  import { TriggerKind, hasId, idString } from "../triggerModel";

  interface Props extends SectionProps {
    channels: Named[];
    roles: Named[];
  }

  let { trigger, change, channels, roles }: Props = $props();

  const eventOptions = $derived([
    { id: "0", name: m.chatTriggers.eventNone() },
    { id: "1", name: m.chatTriggers.eventLevelUp() },
    { id: "2", name: m.chatTriggers.eventLevelDown() },
    { id: "3", name: m.chatTriggers.eventJoin() },
    { id: "4", name: m.chatTriggers.eventLeave() },
    { id: "5", name: m.chatTriggers.eventVoiceJoin() },
    { id: "6", name: m.chatTriggers.eventVoiceLeave() },
    { id: "7", name: m.chatTriggers.eventBoostStart() },
    { id: "8", name: m.chatTriggers.eventBoostStop() },
    { id: "9", name: m.chatTriggers.eventTicketOpen() },
    { id: "10", name: m.chatTriggers.eventTicketClose() },
    { id: "11", name: m.chatTriggers.eventGiveawayWon() },
    { id: "12", name: m.chatTriggers.eventRoleAdded() },
    { id: "13", name: m.chatTriggers.eventRoleRemoved() }
  ]);

  const roleEvent = $derived(trigger.eventType === 12 || trigger.eventType === 13);

  let open = $state(false);

  function setEvent(type: number) {
    change({
      eventType: type,
      validTriggerTypes: type > 0 ? trigger.validTriggerTypes | TriggerKind.Event : trigger.validTriggerTypes & ~TriggerKind.Event || TriggerKind.Message,
      eventRoleId: type === 12 || type === 13 ? trigger.eventRoleId : 0n
    });
  }
</script>

<EditorGroup title={m.chatTriggers.groupEvent()} count={trigger.eventType > 0 ? 1 : 0} bind:open>
  <SettingField label={m.chatTriggers.eventLabel()} id="ct-event">
    <DiscordSelector
      id="ct-event"
      type="custom"
      options={eventOptions}
      selected={String(trigger.eventType)}
      clearable={false}
      customIcon="fa-bolt"
      onchange={(detail) => typeof detail.selected === "string" && setEvent(Number(detail.selected))}
    />
  </SettingField>

  {#if trigger.eventType > 0}
    <SettingField label={m.chatTriggers.eventChannel()} id="ct-event-channel">
      <DiscordSelector
        id="ct-event-channel"
        type="channel"
        options={channels}
        selected={hasId(trigger.eventChannelId) ? idString(trigger.eventChannelId) : null}
        placeholder={m.chatTriggers.eventChannelPlaceholder()}
        onchange={(detail) => change({ eventChannelId: typeof detail.selected === "string" ? BigInt(detail.selected) : 0n })}
      />
    </SettingField>
  {/if}

  {#if roleEvent}
    <SettingField label={m.chatTriggers.eventRole()} id="ct-event-role">
      <DiscordSelector
        id="ct-event-role"
        type="role"
        options={roles}
        selected={hasId(trigger.eventRoleId) ? idString(trigger.eventRoleId) : null}
        placeholder={m.chatTriggers.eventRolePlaceholder()}
        onchange={(detail) => change({ eventRoleId: typeof detail.selected === "string" ? BigInt(detail.selected) : 0n })}
      />
    </SettingField>
  {/if}
</EditorGroup>
