<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import EditorGroup from "./EditorGroup.svelte";
  import type { SectionProps } from "./editorTypes";
  import { AppCommandType, TriggerKind } from "../triggerModel";

  let { trigger, change }: SectionProps = $props();

  const kinds = $derived([
    { flag: TriggerKind.Message, label: m.chatTriggers.kindMessage() },
    { flag: TriggerKind.Interaction, label: m.chatTriggers.kindInteraction() },
    { flag: TriggerKind.Button, label: m.chatTriggers.kindButton() },
    { flag: TriggerKind.Reactions, label: m.chatTriggers.kindReactionAdded() },
    { flag: TriggerKind.ReactionsRemoved, label: m.chatTriggers.kindReactionRemoved() },
    { flag: TriggerKind.Event, label: m.chatTriggers.kindEvent() }
  ]);

  const prefixOptions = $derived([
    { id: "0", name: m.chatTriggers.prefixNone() },
    { id: "1", name: m.chatTriggers.prefixGlobal() },
    { id: "2", name: m.chatTriggers.prefixServerOrGlobal() },
    { id: "3", name: m.chatTriggers.prefixServerIfSet() },
    { id: "4", name: m.chatTriggers.prefixCustom() }
  ]);

  const commandOptions = $derived([
    { id: String(AppCommandType.None), name: m.chatTriggers.commandNone() },
    { id: String(AppCommandType.Slash), name: m.chatTriggers.commandSlash() },
    { id: String(AppCommandType.Message), name: m.chatTriggers.commandMessage() },
    { id: String(AppCommandType.User), name: m.chatTriggers.commandUser() }
  ]);

  const count = $derived(
    [
      trigger.validTriggerTypes !== TriggerKind.Message,
      trigger.prefixType > 0,
      trigger.allowTarget,
      trigger.applicationCommandType > 0
    ].filter(Boolean).length
  );

  let open = $state(false);

  function setKind(flag: number, on: boolean) {
    let next = on ? trigger.validTriggerTypes | flag : trigger.validTriggerTypes & ~flag;
    if (next === 0) next = TriggerKind.Message;
    const patch: Partial<typeof trigger> = { validTriggerTypes: next };
    if (flag === TriggerKind.Interaction && !on) patch.applicationCommandType = AppCommandType.None;
    change(patch);
  }

  function setCommandType(type: number) {
    const patch: Partial<typeof trigger> = { applicationCommandType: type };
    if (type > 0) {
      patch.validTriggerTypes = trigger.validTriggerTypes | TriggerKind.Interaction;
      patch.applicationCommandName = trigger.applicationCommandName ?? trigger.trigger;
      if (type === AppCommandType.Slash) patch.applicationCommandDescription = trigger.applicationCommandDescription ?? m.chatTriggers.commandDescriptionDefault();
    }
    change(patch);
  }

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );
</script>

<EditorGroup title={m.chatTriggers.groupMatching()} {count} bind:open>
  <fieldset class="space-y-2">
    <legend class="text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.chatTriggers.kindsLabel()}</legend>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      {#each kinds as kind (kind.flag)}
        <ToggleRow
          colors={$colorStore}
          checked={(trigger.validTriggerTypes & kind.flag) !== 0}
          title={kind.label}
          onchange={(on) => setKind(kind.flag, on)}
        />
      {/each}
    </div>
  </fieldset>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SettingField label={m.chatTriggers.prefixLabel()} id="ct-prefix">
      <DiscordSelector
        id="ct-prefix"
        type="custom"
        options={prefixOptions}
        selected={String(trigger.prefixType)}
        searchable={false}
        clearable={false}
        customIcon="fa-tag"
        onchange={(detail) => typeof detail.selected === "string" && change({ prefixType: Number(detail.selected) })}
      />
    </SettingField>
    {#if trigger.prefixType === 4}
      <SettingField label={m.chatTriggers.customPrefix()} id="ct-custom-prefix">
        <input
          id="ct-custom-prefix"
          type="text"
          value={trigger.customPrefix ?? ""}
          oninput={(e) => change({ customPrefix: e.currentTarget.value || null }, true)}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
      </SettingField>
    {/if}
  </div>

  <ToggleRow colors={$colorStore} checked={trigger.allowTarget} title={m.chatTriggers.allowTarget()} onchange={(v) => change({ allowTarget: v })} />

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <SettingField label={m.chatTriggers.commandType()} id="ct-command-type">
      <DiscordSelector
        id="ct-command-type"
        type="custom"
        options={commandOptions}
        selected={String(trigger.applicationCommandType)}
        searchable={false}
        clearable={false}
        customIcon="fa-bolt"
        onchange={(detail) => typeof detail.selected === "string" && setCommandType(Number(detail.selected))}
      />
    </SettingField>
    {#if trigger.applicationCommandType > 0}
      <SettingField label={m.chatTriggers.commandName()} id="ct-command-name">
        <input
          id="ct-command-name"
          type="text"
          value={trigger.applicationCommandName ?? ""}
          oninput={(e) => change({ applicationCommandName: e.currentTarget.value || null }, true)}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style={inputStyle}
        >
      </SettingField>
    {/if}
  </div>
  {#if trigger.applicationCommandType === AppCommandType.Slash}
    <SettingField label={m.chatTriggers.commandDescription()} id="ct-command-description">
      <input
        id="ct-command-description"
        type="text"
        maxlength="100"
        value={trigger.applicationCommandDescription ?? ""}
        oninput={(e) => change({ applicationCommandDescription: e.currentTarget.value || null }, true)}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
    </SettingField>
  {/if}
</EditorGroup>
