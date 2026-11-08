<script lang="ts">
  import { untrack } from "svelte";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import { difficultyOptions, inheritOptions, posOptions, selectedNumber } from "./wotdModel";

  interface Props {
    name: string;
    topic: string;
    partOfSpeech: number;
    difficulty: number;
    exists: boolean;
    busy: boolean;
    onsave: (rule: { topic: string; partOfSpeech: number; difficulty: number }) => void;
    onclear: () => void;
    onclose: () => void;
  }

  let { name, topic: initialTopic, partOfSpeech: initialPos, difficulty: initialDifficulty, exists, busy, onsave, onclear, onclose }: Props = $props();

  let topic = $state(untrack(() => initialTopic));
  let partOfSpeech = $state(untrack(() => initialPos));
  let difficulty = $state(untrack(() => initialDifficulty));

  const posChoices = $derived(inheritOptions(posOptions()));
  const difficultyChoices = $derived(inheritOptions(difficultyOptions()));
</script>

<Sheet title={m.wordoftheday.ruleSheetTitle({ name })} {onclose}>
  <SettingField label={m.wordoftheday.sourceTopic()} id="wotd-rule-topic">
    <input
      id="wotd-rule-topic"
      type="text"
      bind:value={topic}
      placeholder={m.wordoftheday.ruleTopicPlaceholder()}
      maxlength="80"
      class="w-full px-3 rounded-lg border min-h-[50px] text-base"
      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
    />
  </SettingField>

  <SettingField label={m.placeholders.wotdPos()} id="wotd-rule-pos">
    <DiscordSelector
      id="wotd-rule-pos"
      type="custom"
      customIcon="fa-font"
      clearable={false}
      options={posChoices}
      selected={partOfSpeech.toString()}
      placeholder={m.wordoftheday.optionInherit()}
      searchable={false}
      onchange={(detail) => (partOfSpeech = selectedNumber(detail, 0))}
    />
  </SettingField>

  <SettingField label={m.wordoftheday.sourceDifficulty()} id="wotd-rule-difficulty">
    <DiscordSelector
      id="wotd-rule-difficulty"
      type="custom"
      customIcon="fa-gauge"
      clearable={false}
      options={difficultyChoices}
      selected={difficulty.toString()}
      placeholder={m.wordoftheday.optionInherit()}
      searchable={false}
      onchange={(detail) => (difficulty = selectedNumber(detail, 0))}
    />
  </SettingField>

  {#snippet footer()}
    {#if exists}
      <button
        type="button"
        class="px-4 rounded-lg min-h-[44px] text-sm font-medium"
        style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
        disabled={busy}
        onclick={onclear}
      >
        {m.wordoftheday.ruleClear()}
      </button>
    {/if}
    <button
      type="button"
      class="px-4 rounded-lg min-h-[44px] text-sm font-medium"
      style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
      disabled={busy}
      onclick={() => onsave({ topic: topic.trim(), partOfSpeech, difficulty })}
    >
      <i class="fa-solid fa-floppy-disk {busy ? 'fa-spin' : ''}" aria-hidden="true"></i>
      {m.common.save()}
    </button>
  {/snippet}
</Sheet>
