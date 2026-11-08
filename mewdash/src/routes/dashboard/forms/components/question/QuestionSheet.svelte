<script lang="ts">
  import { m } from "$lib/i18n";
  import { QUESTION_TYPES, type FormQuestion } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { removeZalgoText } from "$lib/utils/sanitize";
  import { isSafeUrl } from "$lib/utils/formMarkdown";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import { questionTypeLabel } from "$lib/components/forms/formLabels";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import NumberField from "../NumberField.svelte";
  import Sheet from "$lib/components/ui/Sheet.svelte";
  import ConditionsField from "./ConditionsField.svelte";
  import type { Named, Notify } from "../formsModel";

  interface Props {
    index: number;
    questions: FormQuestion[];
    roles: Named[];
    onupdate: (index: number, changes: Partial<FormQuestion>) => void;
    onclose: () => void;
    notify: Notify;
  }

  let { index, questions, roles, onupdate, onclose, notify }: Props = $props();

  const question = $derived(questions[index]);
  const type = $derived(question?.questionType);
  const isBreak = $derived(type === "section_break");
  const hasOptions = $derived(type === "multiple_choice" || type === "checkboxes" || type === "dropdown");
  const icon = $derived(QUESTION_TYPES.find((t) => t.type === type)?.icon ?? "fa-question");

  const earlier = $derived(questions.slice(0, index).filter((q) => q.questionType !== "section_break" && q.questionText));
  const targets = $derived(
    earlier
      .filter((q) => q.id > 0)
      .map((q) => ({
        id: String(q.id),
        name: m.forms.conditionalQuestionOption({ number: questions.indexOf(q) + 1, text: q.questionText.slice(0, 50) })
      }))
  );
  const hasUnsavedTargets = $derived(earlier.some((q) => q.id <= 0));

  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
  const buttonStyle = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`);

  function update(changes: Partial<FormQuestion>) {
    onupdate(index, changes);
  }

  function clean(input: HTMLInputElement): string {
    const cleaned = removeZalgoText(input.value, 2);
    if (cleaned !== input.value) {
      input.value = cleaned;
      notify(m.forms.editQuestionTextCleaned(), "error");
    }
    return cleaned;
  }

  function setOption(optionIndex: number, text: string) {
    const options = (question.options ?? []).map((option, i) => (i === optionIndex ? { ...option, optionText: text, optionValue: text } : option));
    update({ options });
  }

  function addOption() {
    const options = question.options ?? [];
    update({ options: [...options, { id: 0, questionId: question.id, optionText: "", optionValue: "", displayOrder: options.length }] });
  }

  function removeOption(optionIndex: number) {
    update({ options: (question.options ?? []).filter((_, i) => i !== optionIndex).map((option, i) => ({ ...option, displayOrder: i })) });
  }

  function moveOption(optionIndex: number, direction: -1 | 1) {
    const options = [...(question.options ?? [])];
    const target = optionIndex + direction;
    if (target < 0 || target >= options.length) return;
    [options[optionIndex], options[target]] = [options[target], options[optionIndex]];
    update({ options: options.map((option, i) => ({ ...option, displayOrder: i })) });
  }
</script>

{#if question}
  <Sheet title={m.forms.editEditQuestion()} size="lg" {onclose} onback={onclose}>
    <div class="flex items-center gap-2 text-sm" style="color: {$colorStore.muted}">
      <i class="fa-solid {icon}" aria-hidden="true"></i>
      {questionTypeLabel(type ?? "")}
    </div>

    <SettingField label={isBreak ? m.forms.pageBarTitleLabel() : m.forms.editQuestionText()} id="question-text" required={!isBreak}>
      <input
        id="question-text"
        type="text"
        value={question.questionText}
        oninput={(e) => update({ questionText: clean(e.currentTarget) })}
        placeholder={m.forms.editEnterYourQuestionPlaceholder()}
        class="w-full p-3 rounded-lg border min-h-[50px]"
        style={inputStyle}
      />
    </SettingField>

    <SettingField label={isBreak ? m.forms.editSectionDescription() : m.common.placeholderText()} id="question-placeholder">
      <input
        id="question-placeholder"
        type="text"
        value={question.placeholder ?? ""}
        oninput={(e) => update({ placeholder: e.currentTarget.value })}
        placeholder={isBreak ? m.forms.editSectionDescriptionPlaceholder() : m.forms.editAnswerExamplePlaceholder()}
        class="w-full p-3 rounded-lg border min-h-[50px]"
        style={inputStyle}
      />
    </SettingField>

    {#if !isBreak}
      <SettingField label={m.common.imageUrl()} id="question-image">
        <input
          id="question-image"
          type="url"
          value={question.imageUrl ?? ""}
          oninput={(e) => update({ imageUrl: e.currentTarget.value })}
          placeholder="https://..."
          class="w-full p-3 rounded-lg border min-h-[50px]"
          style={inputStyle}
        />
        {#if question.imageUrl && !isSafeUrl(question.imageUrl)}
          <p class="text-sm mt-1" style="color: #ef4444">{m.forms.editImageUrlUnsafe()}</p>
        {:else if question.imageUrl}
          <img src={question.imageUrl} alt="" class="mt-2 rounded-lg max-h-32 w-auto border" style="border-color: {$colorStore.primary}20;" />
        {/if}
      </SettingField>

      <ToggleRow colors={$colorStore} checked={question.isRequired} title={m.forms.editRequiredQuestion()} onchange={(on) => update({ isRequired: on })} />

      {#if type === "short_text" || type === "long_text"}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NumberField id="question-min-length" label={m.common.minLength()} value={question.minLength} placeholder={m.forms.editNoMinimumPlaceholder()} onchange={(value) => update({ minLength: value ?? undefined })} />
          <NumberField id="question-max-length" label={m.common.maxLength()} min={1} value={question.maxLength} placeholder={m.forms.editNoMaximumPlaceholder()} onchange={(value) => update({ maxLength: value ?? undefined })} />
        </div>
      {/if}

      {#if type === "number"}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <NumberField id="question-min-value" label={m.forms.editMinValue()} min={-1000000000} value={question.minValue} placeholder={m.forms.editNoMinimumPlaceholder()} onchange={(value) => update({ minValue: value ?? undefined })} />
          <NumberField id="question-max-value" label={m.forms.editMaxValue()} min={-1000000000} value={question.maxValue} placeholder={m.forms.editNoMaximumPlaceholder()} onchange={(value) => update({ maxValue: value ?? undefined })} />
        </div>
      {/if}

      {#if hasOptions}
        <PluginCard title={m.common.options()} alwaysOpen>
          {#each question.options ?? [] as option, optionIndex (optionIndex)}
            <div class="flex gap-2 items-stretch">
              <input
                type="text"
                value={option.optionText}
                oninput={(e) => setOption(optionIndex, clean(e.currentTarget))}
                placeholder={m.common.optionNumber({ number: optionIndex + 1 })}
                aria-label={m.common.optionNumber({ number: optionIndex + 1 })}
                class="grow min-w-0 p-3 rounded-lg border min-h-[50px]"
                style={inputStyle}
              />
              <button type="button" class="shrink-0 rounded-lg min-h-[50px] min-w-[44px] disabled:opacity-40" style={buttonStyle} disabled={optionIndex === 0} aria-label={m.common.moveUp()} onclick={() => moveOption(optionIndex, -1)}>
                <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
              </button>
              <button type="button" class="shrink-0 rounded-lg min-h-[50px] min-w-[44px] disabled:opacity-40" style={buttonStyle} disabled={optionIndex === (question.options?.length ?? 0) - 1} aria-label={m.common.moveDown()} onclick={() => moveOption(optionIndex, 1)}>
                <i class="fa-solid fa-arrow-down" aria-hidden="true"></i>
              </button>
              <button type="button" class="shrink-0 rounded-lg min-h-[50px] min-w-[44px]" style={buttonStyle} aria-label={m.common.deleteOption()} onclick={() => removeOption(optionIndex)}>
                <i class="fa-solid fa-trash" aria-hidden="true"></i>
              </button>
            </div>
          {:else}
            <p class="text-sm" style="color: {$colorStore.muted}">{m.forms.editNoOptions()}</p>
          {/each}
          <button type="button" class="w-full rounded-lg min-h-[50px] font-medium" style={buttonStyle} onclick={addOption}>
            <i class="fa-solid fa-plus mr-2" aria-hidden="true"></i>{m.common.addOption()}
          </button>
        </PluginCard>
      {/if}
    {/if}

    <PluginCard title={m.forms.editConditionalLogic()} alwaysOpen>
      <ConditionsField {question} {targets} {roles} {hasUnsavedTargets} onupdate={update} />
    </PluginCard>
  </Sheet>
{/if}
