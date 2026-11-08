<script lang="ts">
  import { m } from "$lib/i18n";
  import { paginateQuestions, QUESTION_TYPES, type FormQuestion, type QuestionType } from "$lib/api/index.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import * as pageOps from "$lib/utils/formPages";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import { pageLabel, questionTypeDescription, questionTypeLabel } from "$lib/components/forms/formLabels";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import OverflowMenu from "../OverflowMenu.svelte";
  import QuestionSheet from "./QuestionSheet.svelte";
  import type { Named, Notify } from "../formsModel";

  interface Props {
    questions: FormQuestion[];
    formId: number;
    roles: Named[];
    notify: Notify;
  }

  let { questions = $bindable(), formId, roles, notify }: Props = $props();

  let activePage = $state(0);
  let adding = $state(false);
  let editing = $state<number | null>(null);
  let nextTempId = -1;

  const pages = $derived(paginateQuestions(questions));
  const safePage = $derived(Math.min(activePage, Math.max(0, pages.length - 1)));
  const current = $derived(pages[safePage]);
  const paged = $derived(pages.length > 1);

  const inputStyle = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
  const buttonStyle = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`);

  function tempId(): number {
    return nextTempId--;
  }

  function addPage() {
    const result = pageOps.addPage(questions, pageOps.createPageBreak(formId, tempId()), safePage);
    questions = result.questions;
    activePage = result.activePage;
  }

  function addQuestion(type: QuestionType) {
    const question: FormQuestion = {
      id: tempId(),
      formId,
      questionText: "",
      questionType: type,
      isRequired: false,
      displayOrder: 0,
      createdAt: new Date().toISOString(),
      options: [],
      conditionalType: 0,
      enableAnswerPiping: false
    };
    const result = pageOps.insertOnPage(questions, question, safePage);
    questions = result.questions;
    adding = false;
    editing = result.index;
  }

  function update(index: number, changes: Partial<FormQuestion>) {
    questions = questions.map((question, i) => (i === index ? { ...question, ...changes } : question));
  }

  function move(index: number, direction: "up" | "down") {
    const moved = pageOps.moveQuestion(questions, index, direction);
    if (moved) questions = moved;
  }

  function duplicate(index: number) {
    const source = questions[index];
    questions = pageOps.duplicateQuestion(questions, index, {
      ...source,
      id: tempId(),
      questionText: source.questionText + m.forms.editCopySuffix(),
      displayOrder: 0,
      createdAt: new Date().toISOString(),
      options: source.options?.map((option) => ({ ...option, id: 0 })),
      conditions: source.conditions?.map((condition) => ({ ...condition, id: 0 }))
    });
  }

  async function remove(index: number) {
    const text = questions[index].questionText.trim();
    if (text) {
      const ok = await requestConfirmation({ message: m.forms.deleteQuestionConfirm({ text }), confirmText: m.common.delete() });
      if (!ok) return;
    }
    questions = pageOps.resequence(questions.filter((_, i) => i !== index));
  }

  function movePage(direction: "back" | "forward") {
    const result = pageOps.movePage(questions, safePage, direction);
    if (!result) {
      notify(m.forms.pageBarHeadingNeeded(), "error");
      return;
    }
    questions = result.questions;
    activePage = result.activePage;
  }

  function removePage() {
    const result = pageOps.removePage(questions, safePage);
    if (!result) return;
    questions = result.questions;
    activePage = result.activePage;
  }

  function addHeading() {
    questions = pageOps.addHeadingToFirstPage(questions, pageOps.createPageBreak(formId, tempId()));
  }

  function setHeading(field: "questionText" | "placeholder", value: string) {
    if (!current || current.headingIndex < 0) return;
    update(current.headingIndex, { [field]: value });
  }

  function badges(question: FormQuestion): string[] {
    const list = [questionTypeLabel(question.questionType)];
    if (question.isRequired) list.push(m.common.required());
    if ((question.conditionalType ?? 0) !== 0 || question.conditionalParentQuestionId) list.push(m.forms.editConditionalBadge());
    return list;
  }
</script>

<PluginCard title={m.forms.listQuestions()} alwaysOpen>
  <div class="flex flex-wrap gap-2" role="group" aria-label={m.forms.pagesAria()}>
    {#each pages as _, index (index)}
      {@const selected = index === safePage}
      <button
        type="button"
        class="min-h-[44px] px-4 rounded-lg border text-sm font-medium max-w-full truncate"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => (activePage = index)}
      >
        {pageLabel(pages, index)}
      </button>
    {/each}
    <button type="button" class="min-h-[44px] px-4 rounded-lg text-sm font-medium" style={buttonStyle} onclick={addPage}>
      <i class="fa-solid fa-file-circle-plus mr-2" aria-hidden="true"></i>{m.forms.editAddPage()}
    </button>
  </div>

  {#if current}
    {#if current.heading}
      <div class="rounded-xl border p-3 space-y-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
        <SettingField label={m.forms.pageBarTitleLabel()} id="page-title">
          <input
            id="page-title"
            type="text"
            value={current.heading.questionText}
            oninput={(e) => setHeading("questionText", e.currentTarget.value)}
            placeholder={m.forms.pageBarTitlePlaceholder()}
            class="w-full p-3 rounded-lg border min-h-[50px]"
            style={inputStyle}
          />
        </SettingField>
        <SettingField label={m.forms.pageBarIntroLabel()} id="page-intro">
          <input
            id="page-intro"
            type="text"
            value={current.heading.placeholder ?? ""}
            oninput={(e) => setHeading("placeholder", e.currentTarget.value)}
            placeholder={m.forms.pageBarIntroPlaceholder()}
            class="w-full p-3 rounded-lg border min-h-[50px]"
            style={inputStyle}
          />
        </SettingField>
        {#if paged}
          <div class="flex flex-wrap gap-2">
            <button type="button" class="min-h-[44px] px-4 rounded-lg text-sm" style={buttonStyle} onclick={() => movePage("back")} disabled={safePage === 0}>
              <i class="fa-solid fa-arrow-left mr-2" aria-hidden="true"></i>{m.forms.pageBarMoveBack()}
            </button>
            <button type="button" class="min-h-[44px] px-4 rounded-lg text-sm" style={buttonStyle} onclick={() => movePage("forward")} disabled={safePage === pages.length - 1}>
              <i class="fa-solid fa-arrow-right mr-2" aria-hidden="true"></i>{m.forms.pageBarMoveForward()}
            </button>
            <button type="button" class="min-h-[44px] px-4 rounded-lg text-sm" style={buttonStyle} onclick={removePage}>
              <i class="fa-solid fa-trash mr-2" aria-hidden="true"></i>{m.forms.pageBarRemovePage()}
            </button>
          </div>
        {/if}
      </div>
    {:else if paged}
      <button type="button" class="min-h-[44px] px-4 rounded-lg text-sm self-start" style={buttonStyle} onclick={addHeading}>
        <i class="fa-solid fa-heading mr-2" aria-hidden="true"></i>{m.forms.pageBarAddHeading()}
      </button>
    {/if}

    {#if current.questionIndices.length === 0}
      <p class="py-4 text-center" style="color: {$colorStore.muted}">{questions.length === 0 ? m.forms.editNoQuestions() : m.forms.editEmptyPage()}</p>
    {:else}
      <div class="space-y-2">
        {#each current.questionIndices as index (questions[index].id)}
          {@const question = questions[index]}
          <div class="flex items-center gap-2 rounded-xl border p-2 sm:p-3" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
            <button type="button" class="grow min-w-0 text-left min-h-[44px]" onclick={() => (editing = index)}>
              <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">
                {index + 1}. {question.questionText || m.forms.editEnterYourQuestionPlaceholder()}
              </span>
              <span class="flex flex-wrap items-center gap-1.5 mt-1">
                {#each badges(question) as badge (badge)}
                  <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{badge}</span>
                {/each}
              </span>
            </button>
            <button type="button" class="shrink-0 rounded-lg min-h-[44px] min-w-[44px] disabled:opacity-40" style={buttonStyle} aria-label={m.forms.editMoveQuestionUpLabel()} disabled={index === 0 || questions[index - 1].questionType === "section_break"} onclick={() => move(index, "up")}>
              <i class="fa-solid fa-arrow-up" aria-hidden="true"></i>
            </button>
            <button type="button" class="shrink-0 rounded-lg min-h-[44px] min-w-[44px] disabled:opacity-40" style={buttonStyle} aria-label={m.forms.editMoveQuestionDownLabel()} disabled={index === questions.length - 1 || questions[index + 1].questionType === "section_break"} onclick={() => move(index, "down")}>
              <i class="fa-solid fa-arrow-down" aria-hidden="true"></i>
            </button>
            <OverflowMenu
              ariaLabel={m.forms.rowMoreAria({ name: question.questionText || String(index + 1) })}
              items={[
                { label: m.common.edit(), icon: "fa-pen", onclick: () => (editing = index) },
                { label: m.common.duplicate(), icon: "fa-copy", onclick: () => duplicate(index) },
                { label: m.common.delete(), icon: "fa-trash", onclick: () => remove(index) }
              ]}
            />
          </div>
        {/each}
      </div>
    {/if}
  {/if}

  <button type="button" class="w-full rounded-xl min-h-[50px] font-medium" style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;" aria-expanded={adding} onclick={() => (adding = !adding)}>
    <i class="fa-solid fa-plus mr-2" aria-hidden="true"></i>{m.common.addQuestion()}
  </button>

  {#if adding}
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {#each QUESTION_TYPES.filter((t) => t.type !== "section_break") as option (option.type)}
        <button
          type="button"
          class="min-h-[50px] p-3 rounded-lg border text-left flex items-start gap-3"
          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20; color: {$colorStore.text};"
          onclick={() => addQuestion(option.type)}
        >
          <i class="fa-solid {option.icon} mt-0.5" aria-hidden="true"></i>
          <span class="min-w-0">
            <span class="block text-sm font-medium">{questionTypeLabel(option.type)}</span>
            <span class="block text-xs" style="color: {$colorStore.muted}">{questionTypeDescription(option.type)}</span>
          </span>
        </button>
      {/each}
    </div>
  {/if}
</PluginCard>

{#if editing !== null}
  <QuestionSheet index={editing} {questions} {roles} onupdate={update} onclose={() => (editing = null)} {notify} />
{/if}
