<script lang="ts">
  import { m } from "$lib/i18n";
  import { channelAccessApi, type ChannelAccessGate, type ChannelAccessQuestion } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import { errorText } from "./channelAccessModel";

  interface Props {
    guildId: bigint;
    gate: ChannelAccessGate;
    onquestions: (questions: ChannelAccessQuestion[]) => void;
    onerror: (message: string) => void;
  }

  let { guildId, gate, onquestions, onerror }: Props = $props();

  const MAX_QUESTIONS = 5;

  let question = $state("");
  let placeholder = $state("");
  let required = $state(true);
  let paragraph = $state(true);
  let busy = $state(false);

  const inputStyle = $derived(
    `background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`
  );

  async function add() {
    if (!question.trim()) return;
    busy = true;
    try {
      onquestions(
        await channelAccessApi.addQuestion(guildId, gate.id, {
          question: question.trim(),
          placeholder: placeholder.trim() || null,
          required,
          paragraph
        })
      );
      question = "";
      placeholder = "";
    } catch (err) {
      logger.error("Failed to add question:", err);
      onerror(errorText(err, m.channelAccess.errorAddQuestion()));
    } finally {
      busy = false;
    }
  }

  async function remove(position: number) {
    busy = true;
    try {
      onquestions(await channelAccessApi.removeQuestion(guildId, gate.id, position));
    } catch (err) {
      logger.error("Failed to remove question:", err);
      onerror(errorText(err, m.channelAccess.errorRemoveQuestion()));
    } finally {
      busy = false;
    }
  }
</script>

<div class="space-y-2">
  <h4 class="text-sm font-medium" style="color: {$colorStore.text}">{m.channelAccess.questionsTitle()}</h4>
  {#each gate.questions as item, index (item.id)}
    <div
      class="flex items-center gap-2 rounded-xl border p-2 pl-3 min-w-0"
      style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
    >
      <span class="grow min-w-0 text-sm break-words" style="color: {$colorStore.text}">
        {index + 1}. {item.question}
        {#if !item.required}<span style="color: {$colorStore.muted}">{m.common.optionalSuffix()}</span>{/if}
      </span>
      <button
        type="button"
        class="rounded-lg min-h-[44px] min-w-[44px] shrink-0 disabled:opacity-50"
        style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
        aria-label="{m.common.remove()}: {item.question}"
        disabled={busy}
        onclick={() => remove(index + 1)}
      >
        <i class="fa-solid fa-trash" aria-hidden="true"></i>
      </button>
    </div>
  {:else}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.channelAccess.questionsEmpty()}</p>
  {/each}

  {#if gate.questions.length < MAX_QUESTIONS}
    <div class="space-y-3 pt-2">
      <input
        type="text"
        maxlength="45"
        bind:value={question}
        aria-label={m.channelAccess.questionPlaceholder()}
        placeholder={m.channelAccess.questionPlaceholder()}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
      <input
        type="text"
        bind:value={placeholder}
        aria-label={m.channelAccess.questionHintPlaceholder()}
        placeholder={m.channelAccess.questionHintPlaceholder()}
        class="w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]"
        style={inputStyle}
      >
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ToggleRow checked={required} title={m.common.required()} colors={$colorStore} onchange={(v) => (required = v)} />
        <ToggleRow
          checked={paragraph}
          title={m.channelAccess.questionMultiline()}
          colors={$colorStore}
          onchange={(v) => (paragraph = v)}
        />
      </div>
      <button
        type="button"
        class="w-full sm:w-auto px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50"
        style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
        disabled={busy || !question.trim()}
        onclick={add}
      >
        {m.common.addQuestion()}
      </button>
    </div>
  {:else}
    <p class="text-sm" style="color: {$colorStore.muted}">{m.channelAccess.questionsMax()}</p>
  {/if}
</div>
