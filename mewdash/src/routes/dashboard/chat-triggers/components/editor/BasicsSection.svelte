<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import MessageField from "$lib/components/plugin/MessageField.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import type { SectionProps } from "./editorTypes";
  import { AppCommandType, MatchMode, commandName, isValidRegex, matchModeOf, matchModePatch, splitList, joinList, type MatchModeValue } from "../triggerModel";

  interface Props extends SectionProps {
    user?: DiscordUser | null;
  }

  let { trigger, change, user = null }: Props = $props();

  let sample = $state("");
  let pendingExtra = $state(false);

  const matchOptions = $derived([
    { id: MatchMode.Exact, name: m.chatTriggers.matchExact() },
    { id: MatchMode.Contains, name: m.chatTriggers.matchContains() },
    { id: MatchMode.Regex, name: m.chatTriggers.matchRegex() }
  ]);

  const modeOptions = $derived([
    { id: "0", name: m.chatTriggers.modeFirst() },
    { id: "1", name: m.chatTriggers.modeRandom() },
    { id: "2", name: m.chatTriggers.modeInOrder() },
    { id: "3", name: m.chatTriggers.modeAll() }
  ]);

  const extras = $derived(splitList(trigger.additionalResponses));
  const regexValid = $derived(isValidRegex(trigger.trigger));
  const regexMatches = $derived.by(() => {
    if (!trigger.isRegex || !regexValid || !trigger.trigger || !sample) return null;
    try {
      return sample.match(new RegExp(trigger.trigger, "g"))?.length ?? 0;
    } catch {
      return null;
    }
  });

  const placeholders = $derived([
    { category: m.chatTriggers.placeholderGroup(), name: "%target%", description: m.chatTriggers.placeholderTarget() },
    { category: m.chatTriggers.placeholderGroup(), name: "%prompt%", description: m.chatTriggers.placeholderPrompt() },
    { category: m.chatTriggers.placeholderGroup(), name: "%regex.1%", description: m.chatTriggers.placeholderRegex() },
    { category: m.chatTriggers.placeholderGroup(), name: "%counter:name%", description: m.chatTriggers.placeholderCounterRead() },
    { category: m.chatTriggers.placeholderGroup(), name: "%counter:name+%", description: m.chatTriggers.placeholderCounterAdd() },
    { category: m.chatTriggers.placeholderGroup(), name: "%role.mention%", description: m.chatTriggers.placeholderRole() },
    { category: m.common.members(), name: "%user%", description: m.placeholders.user() },
    { category: m.common.members(), name: "%user.mention%", description: m.placeholders.userMention() },
    { category: m.common.members(), name: "%user.id%", description: m.placeholders.userId() },
    { category: m.common.members(), name: "%user.avatar%", description: m.placeholders.userAvatar() },
    { category: m.features.categoryServer(), name: "%server%", description: m.placeholders.server() },
    { category: m.features.categoryServer(), name: "%server.members%", description: m.placeholders.serverMembers() }
  ]);

  function setExtras(next: string[]) {
    change({ additionalResponses: joinList(next) });
  }

  function setExtra(index: number, message: string) {
    setExtras(extras.map((existing, i) => (i === index ? message : existing)));
  }
</script>

<div class="space-y-4">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div class="md:col-span-2">
      <SettingField label={m.chatTriggers.triggerLabel()} id="ct-trigger" required>
        <input
          id="ct-trigger"
          type="text"
          value={trigger.trigger ?? ""}
          oninput={(e) => change({ trigger: e.currentTarget.value }, true)}
          placeholder={m.chatTriggers.triggerPlaceholder()}
          class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style="background: {$colorStore.primary}10; border-color: {trigger.isRegex && !regexValid ? '#ef4444' : `${$colorStore.primary}30`}; color: {$colorStore.text};"
          aria-invalid={trigger.isRegex && !regexValid}
        >
      </SettingField>
      {#if trigger.applicationCommandType > 0}
        <p class="text-sm mt-1 flex items-center gap-2" style="color: {$colorStore.muted}">
          <i class="fa-solid {trigger.applicationCommandType === AppCommandType.Slash ? 'fa-slash' : 'fa-bars'} text-xs" aria-hidden="true"></i>
          {trigger.applicationCommandType === AppCommandType.Slash
            ? m.chatTriggers.basicsSlashCommand({ name: commandName(trigger) })
            : m.chatTriggers.basicsContextCommand({ name: commandName(trigger) })}
        </p>
      {/if}
      {#if trigger.isRegex && !regexValid}
        <p class="text-xs mt-1 text-red-400" role="alert">{m.chatTriggers.regexInvalid()}</p>
      {/if}
    </div>
    <SettingField label={m.chatTriggers.matchLabel()} id="ct-match">
      <DiscordSelector
        id="ct-match"
        type="custom"
        options={matchOptions}
        selected={matchModeOf(trigger)}
        searchable={false}
        clearable={false}
        customIcon="fa-magnifying-glass"
        onchange={(detail) => typeof detail.selected === "string" && change(matchModePatch(detail.selected as MatchModeValue))}
      />
    </SettingField>
  </div>

  {#if trigger.isRegex && regexValid}
    <SettingField label={m.chatTriggers.regexTest()} id="ct-regex-sample">
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          id="ct-regex-sample"
          type="text"
          bind:value={sample}
          placeholder={m.chatTriggers.regexTestPlaceholder()}
          class="grow p-3 rounded-lg border focus:ring-2 min-h-[50px]"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
        >
        {#if regexMatches !== null}
          <span class="text-sm" style="color: {regexMatches > 0 ? $colorStore.text : $colorStore.muted}">
            {regexMatches === 1 ? m.chatTriggers.regexMatchesOne({ count: 1 }) : m.chatTriggers.regexMatchesOther({ count: regexMatches })}
          </span>
        {/if}
      </div>
    </SettingField>
  {/if}

  <div class="space-y-2">
    <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.chatTriggers.responseLabel()}</span>
    <MessageField
      value={typeof trigger.response === "string" ? trigger.response : ""}
      previewTitle={m.chatTriggers.responsePreviewTitle()}
      icon="fa-comment"
      {user}
      {placeholders}
      onchange={(message) => change({ response: message })}
    />
  </div>

  {#each extras as extra, index (index)}
    <div class="space-y-2">
      <div class="flex items-center justify-between gap-3">
        <span class="text-sm font-medium" style="color: {$colorStore.text}">{m.chatTriggers.extraResponseTitle({ number: index + 2 })}</span>
        <button
          type="button"
          class="px-3 rounded-lg min-h-[44px] min-w-[44px] text-sm"
          style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
          aria-label={m.chatTriggers.extraResponseRemove({ number: index + 2 })}
          onclick={() => setExtras(extras.filter((_, i) => i !== index))}
        >
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
      <MessageField
        value={extra}
        previewTitle={m.chatTriggers.extraResponseTitle({ number: index + 2 })}
        icon="fa-comment"
        {user}
        {placeholders}
        onchange={(message) => setExtra(index, message)}
      />
    </div>
  {/each}

  {#if pendingExtra}
    <div class="space-y-2">
      <div class="flex items-center justify-between gap-3">
        <span class="text-sm font-medium" style="color: {$colorStore.text}">{m.chatTriggers.extraResponseTitle({ number: extras.length + 2 })}</span>
        <button
          type="button"
          class="px-3 rounded-lg min-h-[44px] min-w-[44px] text-sm"
          style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
          aria-label={m.chatTriggers.extraResponseRemove({ number: extras.length + 2 })}
          onclick={() => (pendingExtra = false)}
        >
          <i class="fa-solid fa-trash" aria-hidden="true"></i>
        </button>
      </div>
      <MessageField
        value=""
        previewTitle={m.chatTriggers.extraResponseTitle({ number: extras.length + 2 })}
        icon="fa-comment"
        {user}
        {placeholders}
        onchange={(message) => {
          pendingExtra = false;
          setExtras([...extras, message]);
        }}
      />
    </div>
  {/if}

  <div class="flex flex-col sm:flex-row sm:items-end gap-3">
    <button
      type="button"
      class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium"
      style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
      onclick={() => (pendingExtra = true)}
    >
      <i class="fa-solid fa-plus" aria-hidden="true"></i>
      {m.chatTriggers.extraResponseAdd()}
    </button>
    {#if extras.length > 0}
      <div class="grow">
        <SettingField label={m.chatTriggers.modeLabel()} id="ct-mode">
          <DiscordSelector
            id="ct-mode"
            type="custom"
            options={modeOptions}
            selected={String(trigger.responseMode)}
            searchable={false}
            clearable={false}
            customIcon="fa-arrow-right-arrow-left"
            onchange={(detail) => typeof detail.selected === "string" && change({ responseMode: Number(detail.selected) })}
          />
        </SettingField>
      </div>
    {/if}
  </div>
</div>
