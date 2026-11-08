<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import type { ChatTrigger } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import type { TriggerCounter } from "$lib/api/chattriggers/chattriggers";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import SaveStatus from "$lib/components/ui/SaveStatus.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";
  import type { DiscordUser } from "$lib/types/discord";
  import BasicsSection from "./editor/BasicsSection.svelte";
  import MatchingSection from "./editor/MatchingSection.svelte";
  import DeliverySection from "./editor/DeliverySection.svelte";
  import AccessSection from "./editor/AccessSection.svelte";
  import PromptSection from "./editor/PromptSection.svelte";
  import LimitsSection from "./editor/LimitsSection.svelte";
  import RewardsSection from "./editor/RewardsSection.svelte";
  import EventSection from "./editor/EventSection.svelte";
  import RolesSection from "./editor/RolesSection.svelte";
  import CategorySection from "./editor/CategorySection.svelte";
  import TestSection from "./editor/TestSection.svelte";
  import type { Named } from "./editor/editorTypes";
  import type { TriggerPatch, TriggerProblem } from "./triggerModel";

  interface Props {
    guildId: bigint;
    trigger: ChatTrigger;
    isNew: boolean;
    triggers: ChatTrigger[];
    channels: Named[];
    roles: Named[];
    emojis: GuildEmojiInfo[];
    counters: TriggerCounter[];
    categories: string[];
    problem: TriggerProblem;
    creating: boolean;
    autoSave: AutoSave;
    user?: DiscordUser | null;
    onchange: (patch: TriggerPatch, typing?: boolean) => void;
    oncreate: () => void;
    onclose: () => void;
    onerror: (message: string) => void;
  }

  let {
    guildId,
    trigger,
    isNew,
    triggers,
    channels,
    roles,
    emojis,
    counters,
    categories,
    problem,
    creating,
    autoSave,
    user = null,
    onchange,
    oncreate,
    onclose,
    onerror
  }: Props = $props();

  let attempted = $state(false);

  const problemText = $derived.by(() => {
    switch (problem) {
      case "triggerText":
        return m.chatTriggers.problemTriggerText();
      case "regex":
        return m.chatTriggers.regexInvalid();
      case "commandName":
        return m.chatTriggers.problemCommandName();
      case "response":
        return m.chatTriggers.problemResponse();
      default:
        return null;
    }
  });

  function create() {
    attempted = true;
    if (problem) return;
    oncreate();
  }

</script>

{#snippet actions()}
  {#if !isNew}
    <SaveStatus {autoSave} />
    <ToggleRow
      colors={$colorStore}
      checked={!trigger.isDisabled}
      title={trigger.isDisabled ? m.common.disabled() : m.common.enabled()}
      onchange={(on) => onchange({ isDisabled: !on })}
    />
  {/if}
{/snippet}

{#snippet footer()}
  {#if problemText && (!isNew || attempted)}
    <p class="grow basis-full sm:basis-0 text-sm text-red-400" role="alert">{problemText}</p>
  {/if}
  {#if isNew}
    <button
      type="button"
      class="px-5 rounded-xl min-h-[44px] font-medium"
      style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
      onclick={onclose}
    >
      {m.common.cancel()}
    </button>
    <button
      type="button"
      class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[44px] font-medium"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={creating}
      onclick={create}
    >
      <i class="fa-solid fa-plus" aria-hidden="true"></i>
      {m.common.create()}
    </button>
  {/if}
{/snippet}

<Sheet
  title={isNew ? m.chatTriggers.editorNewTitle() : trigger.trigger || m.chatTriggers.editorEditTitle()}
  size="xl"
  {onclose}
  {actions}
  footer={isNew || problemText ? footer : undefined}
>
  <BasicsSection {trigger} change={onchange} {user} />
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start [&>*]:min-w-0">
    <DeliverySection {trigger} change={onchange} {channels} {emojis} {triggers} />
    <MatchingSection {trigger} change={onchange} />
    <AccessSection {trigger} change={onchange} {channels} {roles} />
    <PromptSection {trigger} change={onchange} />
    <LimitsSection {trigger} change={onchange} {counters} />
    <RewardsSection {trigger} change={onchange} />
    <EventSection {trigger} change={onchange} {channels} {roles} />
    <RolesSection {trigger} change={onchange} {roles} />
    <CategorySection {trigger} change={onchange} {categories} />
    {#if !isNew}
      <div class="lg:col-span-2 min-w-0">
        <TestSection {guildId} {trigger} userId={String(user?.id ?? "0")} {onerror} />
      </div>
    {/if}
  </div>
</Sheet>
