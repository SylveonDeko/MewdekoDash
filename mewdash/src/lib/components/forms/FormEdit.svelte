<!-- lib/components/forms/FormEdit.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import {
    clientApi,
    CONDITIONAL_OPERATORS,
    type Form,
    FORM_TYPES,
    type FormQuestion,
    type FormQuestionOption,
    formsApi,
    type FormType,
    formTypeToInt,
    intToFormType,
    QUESTION_TYPES,
    type QuestionType,
    ROLE_ACTION_TYPES
  } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { userStore } from "$lib/stores/userStore";
  import { isSafeUrl } from "$lib/utils/formMarkdown";
  import FormVersionHistory from "./FormVersionHistory.svelte";
  import FormTypeScope from "./FormTypeScope.svelte";
  import SettingsSection from "./SettingsSection.svelte";
  import SettingField from "./SettingField.svelte";
  import SettingToggle from "./SettingToggle.svelte";
  import { paginateQuestions } from "$lib/api/forms/models";
  import {
    defaultFormSettings,
    type FormSettings,
    settingsFromForm,
    settingsToForm
  } from "$lib/utils/formSettings";
  import FormSettingsPanel from "./FormSettingsPanel.svelte";
  import * as pageOps from "$lib/utils/formPages";
  import FormPageBar from "./FormPageBar.svelte";
  import EmojiPicker from "./EmojiPicker.svelte";
  import { logger } from "$lib/logger";
  import { colorStore } from "$lib/stores/colorStore";
  import { loadingStore } from "$lib/stores/loadingStore";
  import { fly, slide, fade } from "svelte/transition";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ConditionalLogicEditor from "$lib/components/forms/ConditionalLogicEditor.svelte";
  import Portal from "$lib/components/ui/Portal.svelte";
  import {
    sanitizeFormName,
    sanitizeInput,
    sanitizeQuestionText,
    containsZalgo,
    removeZalgoText
  } from "$lib/utils/sanitize";
  import { validateForm } from "$lib/utils/formValidation";

  interface Props {
    formId: number;
    onSuccess: () => void;
    onShowNotification: (message: string, type: "success" | "error") => void;
  }

  let { formId, onSuccess, onShowNotification }: Props = $props();

  let existingForm = $state<Form | null>(null);

  /** Every setting on the form, in one object so the shared panel can edit it. */
  let settings = $state<FormSettings>(defaultFormSettings());

  /** The guild's defaults, shown as the placeholder when a form does not override them. */
  let guildApproveEmote = $state<string | null>(null);
  let guildRejectEmote = $state<string | null>(null);
  let guildEmojis = $state<any[]>([]);

  // Questions
  let questions = $state<FormQuestion[]>([]);
  let editingQuestionId = $state<number | null>(null);
  let draggedQuestionIndex = $state<number | null>(null);

  // UI state
  let channels = $state<Array<{ id: string; name: string }>>([]);
  let roles = $state<Array<{ id: string; name: string }>>([]);
  let isMobile = $state(false);
  let showQuestionTypeMenu = $state(false);
  let loading = $state(true);
  let buttonMousePositions = $state<{ [key: string]: { x: number, y: number } }>({});

  // Mobile full-screen question editor
  let showMobileQuestionEditor = $state(false);
  let mobileEditingQuestionIndex = $state<number | null>(null);
  let mobileIdx = $derived(mobileEditingQuestionIndex ?? 0);

  // Accordion states for mobile
  let showVersionHistory = $state(false);

  /** The selected form type as the integer the scoping component and the API both use. */
  let formTypeInt = $derived(formTypeToInt(settings.formType));

  /**
   * How many of a group's settings are actually set, shown on the collapsed header so somebody can
   * see there is something inside without opening it.
   */
  function countSet(values: Array<unknown>): number {
    return values.filter((v) => v !== null && v !== undefined && v !== "" && v !== false).length;
  }

  function checkMobile() {
    isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  }

  function handleButtonMouseMove(e: MouseEvent, buttonId: string) {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    buttonMousePositions[buttonId] = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  function handleButtonMouseLeave(buttonId: string) {
    delete buttonMousePositions[buttonId];
  }

  async function loadChannels() {
    if (!$currentGuild?.id) return;
    try {
      channels = await clientApi.getTextChannels($currentGuild.id);
    } catch (err) {
      logger.error("Failed to load channels:", err);
    }
  }

  async function loadRoles() {
    if (!$currentGuild?.id) return;
    try {
      const rolesData = await clientApi.getRoles($currentGuild.id);
      roles = rolesData.map((r) => ({ id: r.id, name: r.name }));
    } catch (err) {
      logger.error("Failed to load roles:", err);
    }
  }

  async function loadReviewEmoteContext() {
    if (!$currentGuild?.id || !$userStore?.id) return;

    try {
      const [emojis, defaults] = await Promise.all([
        clientApi.getEmojis(BigInt($userStore.id), false).catch(() => []),
        formsApi.getReviewEmotes($currentGuild.id).catch(() => null)
      ]);

      guildEmojis = emojis || [];
      guildApproveEmote = defaults?.approveEmote ?? null;
      guildRejectEmote = defaults?.rejectEmote ?? null;
    } catch (err) {
      logger.error("Failed to load review emote settings:", err);
    }
  }

  async function loadForm() {
    return await loadingStore.wrap("load-form", async () => {
      try {
        loading = true;
        existingForm = await formsApi.getForm(formId);
        const loadedQuestions = await formsApi.getFormQuestions(formId);

        settings = settingsFromForm(existingForm);

        questions = loadedQuestions;
      } catch (err) {
        onShowNotification("Failed to load form", "error");
      } finally {
        loading = false;
      }
    }, "api", "Loading form...");
  }

  /**
   * The form split into the pages a submitter fills in one at a time, so the builder can present
   * pages as pages, which is how somebody thinks about a long form. Split by the same helper the
   * public form uses, so the two cannot disagree about where a page begins.
   */
  let builderPages = $derived(paginateQuestions(questions));

  /** Which page the builder is showing. */
  let activePage = $state(0);

  let safePage = $derived(Math.min(activePage, Math.max(0, builderPages.length - 1)));
  let currentBuilderPage = $derived(builderPages[safePage]);

  /**
   * The questions as the save endpoint wants them: each with its options and conditions, in
   * display order. A question keeps its identifier so conditions, answer piping and past
   * responses stay pointed at it; a new one carries zero and gets one back.
   */
  function buildQuestionPayload() {
    return questions
      .filter((q) => q.questionType === "section_break" || q.questionText?.trim())
      .map((question) => ({
        question: {
          // A temporary identifier means the question is new, which the server reads as a zero.
          id: question.id > 0 ? question.id : 0,
          questionText: sanitizeQuestionText(question.questionText ?? ""),
          questionType: question.questionType,
          isRequired: question.questionType === "section_break" ? false : question.isRequired || false,
          placeholder: question.placeholder ? sanitizeInput(question.placeholder) : undefined,
          imageUrl: question.imageUrl || undefined,
          minValue: question.minValue,
          maxValue: question.maxValue,
          minLength: question.minLength,
          maxLength: question.maxLength,
          enableAnswerPiping: question.enableAnswerPiping || false,
          conditionalType: question.conditionalType || 0,
          conditionalParentQuestionId: question.conditionalParentQuestionId,
          conditionalOperator: question.conditionalOperator,
          conditionalExpectedValue: question.conditionalExpectedValue
            ? sanitizeInput(question.conditionalExpectedValue)
            : undefined,
          conditionalRoleIds: question.conditionalRoleIds,
          conditionalRoleLogic: question.conditionalRoleLogic,
          conditionalDaysInServer: question.conditionalDaysInServer,
          conditionalAccountAgeDays: question.conditionalAccountAgeDays,
          conditionalRequiresBoost: question.conditionalRequiresBoost,
          conditionalRequiresNitro: question.conditionalRequiresNitro,
          conditionalPermissionFlags: question.conditionalPermissionFlags,
          requiredWhenParentQuestionId: question.requiredWhenParentQuestionId,
          requiredWhenOperator: question.requiredWhenOperator,
          requiredWhenValue: question.requiredWhenValue
        },
        options: supportsOptions(question.questionType)
          ? (question.options ?? [])
              .filter((o) => o.optionText?.trim())
              .map((option) => ({
                optionText: sanitizeInput(option.optionText),
                optionValue: sanitizeInput(option.optionValue || option.optionText)
              }))
          : [],
        conditions: question.conditions ?? []
      }));
  }

  /**
   * A question that has not been saved yet still needs an identifier the builder can tell apart,
   * since it is what keys the list and tracks which question is open. Negative numbers cannot
   * collide with saved ones, and the save normalises them back to zero.
   */
  let nextTempId = $state(-1);

  function takeTempId(): number {
    return nextTempId--;
  }

  function newPageBreak(): FormQuestion {
    return pageOps.createPageBreak(formId, takeTempId());
  }

  function addPage() {
    const result = pageOps.addPage(questions, newPageBreak(), safePage);

    questions = result.questions;
    activePage = result.activePage;
  }

  function addQuestion(type: QuestionType) {
    const newQuestion: FormQuestion = {
      id: takeTempId(),
      formId: formId,
      questionText: "",
      questionType: type,
      isRequired: false,
      displayOrder: 0,
      createdAt: new Date().toISOString(),
      options: [],
      conditionalType: 0, // Default to QuestionBased
      enableAnswerPiping: false
    };

    // A new question joins the page being edited, not the end of the whole form.
    const result = pageOps.insertOnPage(questions, newQuestion, safePage);
    const insertAt = result.index;

    questions = result.questions;

    if (isMobile) {
      mobileEditingQuestionIndex = insertAt;
      showMobileQuestionEditor = true;
    } else {
      editingQuestionId = newQuestion.id;
    }

    showQuestionTypeMenu = false;
  }

  function deleteQuestion(index: number) {
    questions = pageOps.resequence(questions.filter((_, i) => i !== index));
  }

  function duplicateQuestion(index: number) {
    const question = questions[index];

    questions = pageOps.duplicateQuestion(questions, index, {
      ...question,
      id: takeTempId(),
      questionText: question.questionText + " (Copy)",
      displayOrder: 0,
      createdAt: new Date().toISOString(),
      options: question.options?.map((opt) => ({ ...opt, id: 0 }))
    });
  }

  function moveQuestion(index: number, direction: "up" | "down") {
    const moved = pageOps.moveQuestion(questions, index, direction);
    if (moved) questions = moved;
  }

  function addOption(questionIndex: number) {
    const question = questions[questionIndex];
    if (!question.options) question.options = [];

    question.options = [
      ...question.options,
      {
        id: 0,
        questionId: question.id,
        optionText: "",
        optionValue: "",
        displayOrder: question.options.length
      }
    ];
  }

  function deleteOption(questionIndex: number, optionIndex: number) {
    const question = questions[questionIndex];
    if (!question.options) return;
    question.options = question.options.filter((_, i) => i !== optionIndex);
    question.options.forEach((opt, i) => (opt.displayOrder = i));
  }

  function handleDragStart(index: number) {
    draggedQuestionIndex = index;
  }

  function handleDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    if (draggedQuestionIndex === null || draggedQuestionIndex === index) return;

    const newQuestions = [...questions];
    const draggedItem = newQuestions[draggedQuestionIndex];
    newQuestions.splice(draggedQuestionIndex, 1);
    newQuestions.splice(index, 0, draggedItem);
    newQuestions.forEach((q, i) => (q.displayOrder = i));
    questions = newQuestions;
    draggedQuestionIndex = index;
  }

  function handleDragEnd() {
    draggedQuestionIndex = null;
  }

  // Mobile question editor handlers
  function openMobileQuestionEditor(index: number) {
    mobileEditingQuestionIndex = index;
    showMobileQuestionEditor = true;
  }

  function closeMobileQuestionEditor() {
    showMobileQuestionEditor = false;
    mobileEditingQuestionIndex = null;
  }

  export async function saveForm() {
    return await loadingStore.wrap("save-form", async () => {
      try {
        // Validate form
        const validationErrors = validateForm(settings.name, questions);
        if (validationErrors.length > 0) {
          onShowNotification(validationErrors[0].message, "error");
          logger.error("Validation errors:", validationErrors);
          return;
        }

        if (!existingForm) {
          throw new Error("Missing form data");
        }

        await formsApi.saveForm($currentGuild!.id, {
          form: {
            ...settingsToForm(settings),
            id: formId,
            name: sanitizeFormName(settings.name),
            description: settings.description ? sanitizeInput(settings.description) : undefined
          },
          questions: buildQuestionPayload(),
          userId: $userStore?.id ? BigInt($userStore.id) : undefined
        });

        onShowNotification("Form updated successfully!", "success");
        setTimeout(() => onSuccess(), 1500);
      } catch (err: any) {
        logger.error("Failed to update form:", err);

        const reasons = err?.body?.errors;

        onShowNotification(
          Array.isArray(reasons) && reasons.length > 0
            ? reasons.join(". ")
            : err?.message || "Failed to update form",
          "error"
        );
      }
    }, "operation", "Updating form...");
  }

  onMount(() => {
    checkMobile();
    loadChannels();
    loadRoles();
    loadReviewEmoteContext();
    loadForm();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  });

  $effect(() => {
    if ($currentGuild) {
      loadChannels();
      loadRoles();
    }
  });

  function getQuestionTypeLabel(type: QuestionType): string {
    return QUESTION_TYPES.find((t) => t.type === type)?.label || type;
  }

  function getQuestionTypeIcon(type: QuestionType): string {
    return QUESTION_TYPES.find((t) => t.type === type)?.icon || "fa-question";
  }

  function supportsOptions(type: QuestionType): boolean {
    return ["multiple_choice", "checkboxes", "dropdown"].includes(type);
  }

  // Helper to update question and trigger reactivity
  function updateQuestion(index: number, updates: Partial<FormQuestion>) {
    questions[index] = { ...questions[index], ...updates };
    questions = [...questions];
  }

  // Helper to update option and trigger reactivity
  function updateOption(questionIndex: number, optionIndex: number, updates: Partial<FormQuestionOption>) {
    const question = questions[questionIndex];
    if (!question.options) return;
    question.options[optionIndex] = { ...question.options[optionIndex], ...updates };
    questions = [...questions];
  }

  // Helper to update conditional operator
  function updateConditionalOperator(index: number, value: string) {
    updateQuestion(index, { conditionalOperator: value as any });
  }

  // Validate question text for Zalgo
  function validateQuestionText(text: string): string | null {
    if (containsZalgo(text)) {
      return "Text contains invalid characters. Zalgo/corrupted text is not allowed.";
    }
    return null;
  }

  // Handle question text input with auto-cleaning
  function handleQuestionTextInput(e: Event, index: number) {
    const input = e.currentTarget as HTMLInputElement;
    const cleaned = removeZalgoText(input.value, 2);

    if (cleaned !== input.value) {
      // Zalgo detected and removed
      input.value = cleaned;
      updateQuestion(index, { questionText: cleaned });
      onShowNotification("Excessive combining characters were removed from question text", "error");
    } else {
      updateQuestion(index, { questionText: input.value });
    }
  }

  // Handle option text input with auto-cleaning
  function handleOptionTextInput(e: Event, questionIndex: number, optionIndex: number) {
    const input = e.currentTarget as HTMLInputElement;
    const cleaned = removeZalgoText(input.value, 2);

    if (cleaned !== input.value) {
      // Zalgo detected and removed
      input.value = cleaned;
      updateOption(questionIndex, optionIndex, { optionText: cleaned, optionValue: cleaned });
      onShowNotification("Excessive combining characters were removed from option text", "error");
    } else {
      updateOption(questionIndex, optionIndex, { optionText: input.value, optionValue: input.value });
    }
  }

  // The effects that used to reconcile external users, anonymity and the approval workflow are
  // gone. settingsToForm applies those rules when the form is saved, which is one place rather
  // than a pair of effects that silently reset a toggle somebody had just set.

</script>

{#if loading}
  <div
    class=" rounded-xl border p-12 text-center"
    style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
  >
    <div
      class="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
      style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"
    ></div>
    <p style="color: {$colorStore.muted};">Loading form...</p>
  </div>
{:else}
  <div class="space-y-6">

    <FormSettingsPanel
      bind:settings
      mode="edit"
      {channels}
      {roles}
      {guildEmojis}
      {guildApproveEmote}
      {guildRejectEmote}
      announcedAt={existingForm?.announcedAt ?? null}
    />

    <!-- Questions Section -->
    <div
      class=" rounded-xl border p-4 sm:p-6 transition-all"
      style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg sm:text-xl font-bold" style="color: {$colorStore.text};">
          <i class="fa-solid fa-question-circle mr-2" style="color: {$colorStore.primary};"></i>
          Questions
        </h2>
        <div class="flex items-center gap-2">
        <button
          onclick={addPage}
          class="px-3 py-2 rounded-lg text-sm font-medium transition-all"
          style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}25;"
          type="button"
          title="Splits the form here, so what follows is a separate page"
        >
          <i class="fa-solid fa-file-circle-plus mr-2"></i>
          Add page
        </button>
        <button
          onclick={() => (showQuestionTypeMenu = !showQuestionTypeMenu)}
          onmousemove={(e) => !isMobile && handleButtonMouseMove(e, 'add-question')}
          onmouseleave={() => !isMobile && handleButtonMouseLeave('add-question')}
          class="group px-3 sm:px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] relative overflow-hidden"
          style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
          type="button"
        >
          <!-- Mouse spotlight -->
          {#if buttonMousePositions['add-question'] && !isMobile}
            <div
              class="pointer-events-none absolute w-24 h-24 rounded-full opacity-30 transition-all duration-100 ease-out"
              style="background: radial-gradient(circle at center, {$colorStore.primary}60, transparent 70%);
                       left: {buttonMousePositions['add-question'].x}px;
                       top: {buttonMousePositions['add-question'].y}px;
                       transform: translate(-50%, -50%);
                       filter: blur(20px);"
            ></div>
          {/if}

          <!-- Hover gradient overlay -->
          <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
               style="background: {$colorStore.primary}25;"></div>

          <span class="relative z-10">
              <i class="fa-solid fa-plus mr-2"></i>
              Add Question
            </span>
        </button>
        </div>
      </div>

      <!-- Question Type Menu -->
      {#if showQuestionTypeMenu}
        <div
          class="mb-4 p-4 rounded-lg border"
          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30;"
          in:fly={{ y: 20, duration: 300 }}
        >
          <p class="text-sm mb-3 font-medium" style="color: {$colorStore.text};">
            Select Question Type:
          </p>
          <!-- Section breaks are not offered here. They are what a page is made of, and pages have
               their own controls above, so letting one be added as a "question" would give two
               ways to do the same thing that disagree with each other. -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            {#each QUESTION_TYPES.filter((t) => t.type !== "section_break") as qType, qIndex}
              <button
                onclick={() => addQuestion(qType.type)}
                onmousemove={(e) => !isMobile && handleButtonMouseMove(e, `qtype-${qType.type}`)}
                onmouseleave={() => !isMobile && handleButtonMouseLeave(`qtype-${qType.type}`)}
                class="group p-3 rounded-lg transition-all hover:scale-[1.02] text-left relative overflow-hidden"
                style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;"
                in:fly={{ y: 20, duration: 400, delay: qIndex * 50 }}
                type="button"
              >
                <!-- Mouse spotlight -->
                {#if buttonMousePositions[`qtype-${qType.type}`] && !isMobile}
                  <div
                    class="pointer-events-none absolute w-24 h-24 rounded-full opacity-25 transition-all duration-100 ease-out"
                    style="background: radial-gradient(circle at center, {$colorStore.primary}50, transparent 70%);
                             left: {buttonMousePositions[`qtype-${qType.type}`].x}px;
                             top: {buttonMousePositions[`qtype-${qType.type}`].y}px;
                             transform: translate(-50%, -50%);
                             filter: blur(15px);"
                  ></div>
                {/if}

                <!-- Hover gradient overlay -->
                <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                     style="background: {$colorStore.primary}12;"></div>

                <div class="relative z-10">
                  <i
                    class="fa-solid {qType.icon} mb-2 block"
                    style="color: {$colorStore.primary}; font-size: 20px;"
                  ></i>
                  <span class="font-medium text-sm block" style="color: {$colorStore.text};">
                      {qType.label}
                    </span>
                  <span class="text-xs mt-1 block" style="color: {$colorStore.muted};">
                      {qType.description}
                    </span>
                </div>
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <FormPageBar
        {questions}
        pages={builderPages}
        activePage={safePage}
        createBreak={newPageBreak}
        onQuestionsChange={(next) => (questions = next)}
        onActivePageChange={(page) => (activePage = page)}
        onNotify={onShowNotification}
      />

      <!-- Questions List -->
      {#if questions.length === 0}
        <div class="text-center py-12">
          <i
            class="fa-solid fa-clipboard-question mb-4"
            style="color: {$colorStore.muted}; font-size: 48px; display: block;"
          ></i>
          <p style="color: {$colorStore.muted};">
            No questions yet. Click "Add Question" to get started.
          </p>
        </div>
      {:else if currentBuilderPage.questionIndices.length === 0}
        <div class="text-center py-10">
          <i
            class="fa-solid fa-clipboard-question mb-3"
            style="color: {$colorStore.muted}; font-size: 32px; display: block;"
          ></i>
          <p class="text-sm" style="color: {$colorStore.muted};">
            Nothing on this page yet. Anything you add lands here.
          </p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each currentBuilderPage.questionIndices as index (questions[index].id)}
            {@const question = questions[index]}
            <div
              draggable={!isMobile}
              ondragstart={() => !isMobile && handleDragStart(index)}
              ondragover={(e) => !isMobile && handleDragOver(e, index)}
              ondragend={() => !isMobile && handleDragEnd()}
              role="listitem"
              class=" rounded-lg border p-3 transition-all {draggedQuestionIndex === index ? 'opacity-50' : 'hover:shadow-md'}"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}25; cursor: {isMobile ? 'default' : 'move'};"
              transition:slide
            >
              <!-- Question Header -->
              <div class="flex items-start gap-2 sm:gap-3">
                <div
                  class="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-sm"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                >
                  {index + 1}
                </div>
                <div class="flex-1 min-w-0">
                  <input
                    type="text"
                    value={question.questionText}
                    oninput={(e) => handleQuestionTextInput(e, index)}
                    placeholder="Enter your question..."
                    class="w-full p-2 rounded-lg mb-2 text-sm"
                    style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
                  />
                  <div class="flex flex-wrap items-center gap-2">
                      <span
                        class="px-2 py-1 rounded text-xs"
                        style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
                      >
                        <i class="fa-solid {getQuestionTypeIcon(question.questionType)} mr-1"></i>
                        {getQuestionTypeLabel(question.questionType)}
                      </span>
                    {#if question.isRequired}
                        <span class="px-2 py-1 rounded text-xs" style="background: #ef444420; color: #ef4444;">
                          Required
                        </span>
                    {/if}
                    {#if question.conditionalParentQuestionId}
                        <span
                          class="px-2 py-1 rounded text-xs"
                          style="background: {$colorStore.accent}20; color: {$colorStore.accent};"
                        >
                          <i class="fa-solid fa-code-branch mr-1"></i>
                          Conditional
                        </span>
                    {/if}
                  </div>
                </div>
                <div class="flex-shrink-0 flex flex-col sm:flex-row gap-1">
                  {#if !isMobile}
                    <button
                      onclick={() => moveQuestion(index, "up")}
                      disabled={index === 0}
                      class="p-2 rounded transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                      style="background: {$colorStore.primary}15; color: {$colorStore.text};"
                      title="Move up"
                      aria-label="Move question up"
                    >
                      <i class="fa-solid fa-arrow-up text-sm"></i>
                    </button>
                    <button
                      onclick={() => moveQuestion(index, "down")}
                      disabled={index === questions.length - 1}
                      class="p-2 rounded transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                      style="background: {$colorStore.primary}15; color: {$colorStore.text};"
                      title="Move down"
                      aria-label="Move question down"
                    >
                      <i class="fa-solid fa-arrow-down text-sm"></i>
                    </button>
                  {/if}
                  <button
                    onclick={() => duplicateQuestion(index)}
                    class="p-2 rounded transition-all hover:scale-110"
                    style="background: {$colorStore.secondary}15; color: {$colorStore.text};"
                    title="Duplicate"
                    aria-label="Duplicate question"
                  >
                    <i class="fa-solid fa-copy text-sm"></i>
                  </button>
                  <button
                    onclick={() => deleteQuestion(index)}
                    class="p-2 rounded transition-all hover:scale-110"
                    style="background: #ef444415; color: #ef4444;"
                    title="Delete"
                    aria-label="Delete question"
                  >
                    <i class="fa-solid fa-trash text-sm"></i>
                  </button>
                </div>
              </div>

              <!-- Edit Button - Different behavior for mobile vs desktop -->
              {#if isMobile}
                <button
                  onclick={() => openMobileQuestionEditor(index)}
                  class="w-full mt-2 p-2 rounded text-sm transition-all"
                  style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}10); color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                  type="button"
                >
                  <i class="fa-solid fa-edit mr-2"></i>
                  Edit Question Details
                </button>
              {:else}
                <!-- Desktop: Inline expandable editor -->
                {#if editingQuestionId === question.id}
                  <div
                    class="mt-4 p-4 rounded-lg space-y-4"
                    style="background: {$colorStore.primary}05; border: 1px solid {$colorStore.primary}20;"
                    transition:slide
                  >
                    <!-- Placeholder. On a section break this is the blurb under the heading,
                         which is why the label changes rather than the field disappearing. -->
                    <div>
                        <span class="block text-sm mb-2" style="color: {$colorStore.muted};">
                          {question.questionType === "section_break" ? "Section description" : "Placeholder Text"}
                        </span>
                      <input
                        type="text"
                        value={question.placeholder || ""}
                        oninput={(e) => updateQuestion(index, { placeholder: e.currentTarget.value })}
                        class="w-full p-2 rounded-lg"
                        style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
                        placeholder={question.questionType === "section_break"
                          ? "Shown under the section heading"
                          : "e.g., Type your answer here..."}
                        aria-label="Placeholder text"
                      />
                    </div>

                    {#if question.questionType !== "section_break"}
                      <!-- An illustrated question, for the ones easier to show than to describe -->
                      <div>
                        <span class="block text-sm mb-2" style="color: {$colorStore.muted};">
                          Image URL
                        </span>
                        <input
                          type="url"
                          value={question.imageUrl || ""}
                          oninput={(e) => updateQuestion(index, { imageUrl: e.currentTarget.value })}
                          class="w-full p-2 rounded-lg"
                          style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
                          placeholder="https://..."
                          aria-label="Question image URL"
                        />
                        {#if question.imageUrl && !isSafeUrl(question.imageUrl)}
                          <p class="text-xs mt-1" style="color: #ef4444;">
                            Only http and https addresses can be shown.
                          </p>
                        {:else if question.imageUrl}
                          <img
                            src={question.imageUrl}
                            alt=""
                            class="mt-2 rounded-lg max-h-32 w-auto"
                            style="border: 1px solid {$colorStore.primary}20;"
                          />
                        {/if}
                      </div>
                    {/if}

                    <!-- Required Toggle -->
                    <div class="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="required-{question.id}"
                        checked={question.isRequired}
                        onchange={(e) => updateQuestion(index, { isRequired: e.currentTarget.checked })}
                        class="w-4 h-4 rounded"
                        style="accent-color: {$colorStore.primary};"
                      />
                      <label for="required-{question.id}" style="color: {$colorStore.text};">
                        Required question
                      </label>
                    </div>

                    <!-- Validation (for text/number fields) -->
                    {#if question.questionType === "short_text" || question.questionType === "long_text"}
                      <div class="grid grid-cols-2 gap-3">
                        <div>
                            <span class="block text-sm mb-2" style="color: {$colorStore.muted};">
                              Min Length
                            </span>
                          <input
                            type="number"
                            value={question.minLength ?? ""}
                            oninput={(e) => updateQuestion(index, { minLength: e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined })}
                            min="0"
                            class="w-full p-2 rounded-lg"
                            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
                            aria-label="Minimum length"
                          />
                        </div>
                        <div>
                            <span class="block text-sm mb-2" style="color: {$colorStore.muted};">
                              Max Length
                            </span>
                          <input
                            type="number"
                            value={question.maxLength ?? ""}
                            oninput={(e) => updateQuestion(index, { maxLength: e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined })}
                            min="1"
                            class="w-full p-2 rounded-lg"
                            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
                            aria-label="Maximum length"
                          />
                        </div>
                      </div>
                    {/if}

                    {#if question.questionType === "number"}
                      <div class="grid grid-cols-2 gap-3">
                        <div>
                            <span class="block text-sm mb-2" style="color: {$colorStore.muted};">
                              Min Value
                            </span>
                          <input
                            type="number"
                            value={question.minValue ?? ""}
                            oninput={(e) => updateQuestion(index, { minValue: e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined })}
                            class="w-full p-2 rounded-lg"
                            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
                            aria-label="Minimum value"
                          />
                        </div>
                        <div>
                            <span class="block text-sm mb-2" style="color: {$colorStore.muted};">
                              Max Value
                            </span>
                          <input
                            type="number"
                            value={question.maxValue ?? ""}
                            oninput={(e) => updateQuestion(index, { maxValue: e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined })}
                            class="w-full p-2 rounded-lg"
                            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
                            aria-label="Maximum value"
                          />
                        </div>
                      </div>
                    {/if}

                    <!-- Options (for multiple choice/checkboxes/dropdown) -->
                    {#if question.questionType && supportsOptions(question.questionType)}
                      <div>
                        <div class="flex items-center justify-between mb-2">
                          <span class="text-sm" style="color: {$colorStore.muted};">Options</span>
                          <button
                            onclick={() => addOption(index)}
                            class="px-3 py-1 rounded text-xs font-medium transition-all hover:scale-[1.02]"
                            style="background: {$colorStore.primary}20; color: {$colorStore.text};"
                          >
                            <i class="fa-solid fa-plus mr-1"></i>
                            Add Option
                          </button>
                        </div>
                        <div class="space-y-2">
                          {#if question.options && question.options.length > 0}
                            {#each question.options as option, optIndex}
                              <div class="flex gap-2">
                                <input
                                  type="text"
                                  value={option.optionText}
                                  oninput={(e) => handleOptionTextInput(e, index, optIndex)}
                                  placeholder="Option {optIndex + 1}"
                                  class="flex-1 p-2 rounded-lg"
                                  style="background: {$colorStore.primary}05; border: 1px solid {$colorStore.primary}15; color: {$colorStore.text};"
                                />
                                <button
                                  onclick={() => deleteOption(index, optIndex)}
                                  class="px-3 py-2 rounded transition-all hover:scale-[1.02]"
                                  style="background: #ef444415; color: #ef4444;"
                                  aria-label="Delete option"
                                >
                                  <i class="fa-solid fa-trash text-sm"></i>
                                </button>
                              </div>
                            {/each}
                          {:else}
                            <p class="text-xs text-center py-2" style="color: {$colorStore.muted};">
                              No options yet. Click "Add Option" to create choices.
                            </p>
                          {/if}
                        </div>
                      </div>
                    {/if}

                    <!-- Conditional Logic -->
                    <ConditionalLogicEditor
                      question={question}
                      questionIndex={index}
                      allQuestions={questions}
                      roles={roles}
                      onUpdate={(updates) => updateQuestion(index, updates)}
                    />

                    <!-- Close Details Button -->
                    <div class="flex justify-end">
                      <button
                        onclick={() => (editingQuestionId = null)}
                        class="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:scale-[1.02]"
                        style="background: {$colorStore.primary}20; color: {$colorStore.text};"
                      >
                        <i class="fa-solid fa-check mr-2"></i>
                        Done
                      </button>
                    </div>
                  </div>
                {:else}
                  <!-- Collapsed View - Click to expand -->
                  <button
                    onclick={() => (editingQuestionId = question.id)}
                    class="w-full mt-2 p-2 rounded text-sm transition-all hover:scale-[1.01]"
                    style="background: {$colorStore.primary}05; color: {$colorStore.muted};"
                  >
                    <i class="fa-solid fa-edit mr-2"></i>
                    Click to edit question details
                  </button>
                {/if}
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Version history -->
    <div class="mt-6 pt-6 border-t" style="border-color: {$colorStore.primary}20;">
      <button
        type="button"
        onclick={() => (showVersionHistory = !showVersionHistory)}
        class="w-full flex items-center justify-between p-3 rounded-lg"
        style="background: {$colorStore.primary}08;"
      >
        <span class="text-sm font-medium" style="color: {$colorStore.text};">
          <i class="fa-solid fa-clock-rotate-left mr-2"></i>
          Version history
        </span>
        <i class="fa-solid fa-chevron-{showVersionHistory ? 'up' : 'down'}"
           style="color: {$colorStore.muted};"></i>
      </button>

      {#if showVersionHistory && $userStore?.id}
        <div class="mt-4" transition:slide>
          <FormVersionHistory
            {formId}
            userId={BigInt($userStore.id)}
            onRestored={() => {
              loadForm();
              onShowNotification("Form restored", "success");
            }}
          />
        </div>
      {/if}
    </div>

    <!-- Save Button (Mobile) -->
    {#if isMobile}
      <div class="sticky bottom-4">
        <button
          onclick={saveForm}
          class="w-full py-4 rounded-lg font-bold text-lg transition-all hover:scale-[1.02] shadow-lg border"
          style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}10); color: {$colorStore.text}; border-color: {$colorStore.primary}30; box-shadow: 0 4px 20px {$colorStore.primary}10;"
          type="button"
        >
          <i class="fa-solid fa-check mr-2"></i>
          Save Changes
        </button>
      </div>
    {/if}
  </div>
{/if}

<!-- Mobile Full-Screen Question Editor Portal -->
{#if isMobile && showMobileQuestionEditor && mobileEditingQuestionIndex !== null}
  {@const question = questions[mobileEditingQuestionIndex]}
  <Portal>
    <div
      class="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999]"
      onclick={closeMobileQuestionEditor}
      onkeydown={(e) => { if (e.key === 'Escape') closeMobileQuestionEditor(); }}
      role="presentation"
      transition:fade={{ duration: 200 }}
    >
      <div
        class="w-full h-full flex flex-col"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}95, {$colorStore.gradientMid}98);"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="question-editor-title"
        tabindex="-1"
      >
        <!-- Header -->
        <div
          class="flex items-center justify-between p-4 border-b sticky top-0 z-10"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;"
        >
          <div class="flex items-center gap-2 flex-1 min-w-0">
            <div
              class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
              style="background: {$colorStore.primary}; color: white;"
            >
              {mobileEditingQuestionIndex + 1}
            </div>
            <h3 id="question-editor-title" class="font-bold text-lg truncate" style="color: {$colorStore.text};">
              Edit Question
            </h3>
          </div>
          <button
            type="button"
            onclick={closeMobileQuestionEditor}
            class="p-2 rounded-lg transition-all hover:scale-110 flex-shrink-0"
            style="background: {$colorStore.primary}20; color: {$colorStore.text};"
            aria-label="Close editor"
          >
            <i class="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        <!-- Content (scrollable) -->
        <div class="flex-1 overflow-y-auto p-4">
          <div class="space-y-4 max-w-2xl mx-auto">
            <!-- Question Text -->
            <div>
              <label for="f-FormEdit-label-1594" class="block text-sm mb-2 font-medium" style="color: {$colorStore.text};">
                Question Text <span style="color: #ef4444;">*</span>
              </label>
              <input id="f-FormEdit-label-1594"
                type="text"
                value={question.questionText}
                oninput={(e) => handleQuestionTextInput(e, mobileIdx)}
                placeholder="Enter your question..."
                class="w-full p-3 rounded-lg"
                style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
              />
            </div>

            <!-- Question Type Badge -->
            <div class="flex items-center gap-2">
              <span
                class="px-3 py-2 rounded-lg text-sm font-medium"
                style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};"
              >
                <i class="fa-solid {getQuestionTypeIcon(question.questionType)} mr-2"></i>
                {getQuestionTypeLabel(question.questionType)}
              </span>
            </div>

            <!-- Placeholder -->
            <div>
              <label for="f-FormEdit-placeholder-text-optional-1620" class="block text-sm mb-2" style="color: {$colorStore.muted};">
                Placeholder text
              </label>
              <input id="f-FormEdit-placeholder-text-optional-1620"
                type="text"
                value={question.placeholder || ""}
                oninput={(e) => updateQuestion(mobileIdx, { placeholder: e.currentTarget.value })}
                placeholder="e.g., Type your answer here..."
                class="w-full p-3 rounded-lg"
                style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
              />
            </div>

            <!-- Required Toggle -->
            <div class="flex items-center justify-between p-3 rounded-lg" style="background: {$colorStore.primary}08;">
              <label for="mobile-required-{question.id}" class="font-medium" style="color: {$colorStore.text};">
                Required question
              </label>
              <input
                type="checkbox"
                id="mobile-required-{question.id}"
                checked={question.isRequired}
                onchange={(e) => updateQuestion(mobileIdx, { isRequired: e.currentTarget.checked })}
                class="w-5 h-5 rounded"
                style="accent-color: {$colorStore.primary};"
              />
            </div>

            <!-- Validation (for text/number fields) -->
            {#if question.questionType === "short_text" || question.questionType === "long_text"}
              <div class="space-y-3">
                <h4 class="font-semibold text-sm" style="color: {$colorStore.text};">Text Validation</h4>
                <div>
                  <label for="f-FormEdit-minimum-length-1653" class="block text-sm mb-2" style="color: {$colorStore.muted};">
                    Minimum length
                  </label>
                  <input id="f-FormEdit-minimum-length-1653"
                    type="number"
                    value={question.minLength ?? ""}
                    oninput={(e) => updateQuestion(mobileIdx, { minLength: e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined })}
                    min="0"
                    placeholder="No minimum"
                    class="w-full p-3 rounded-lg"
                    style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                  />
                </div>
                <div>
                  <label for="f-FormEdit-maximum-length-1667" class="block text-sm mb-2" style="color: {$colorStore.muted};">
                    Maximum length
                  </label>
                  <input id="f-FormEdit-maximum-length-1667"
                    type="number"
                    value={question.maxLength ?? ""}
                    oninput={(e) => updateQuestion(mobileIdx, { maxLength: e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined })}
                    min="1"
                    placeholder="No maximum"
                    class="w-full p-3 rounded-lg"
                    style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                  />
                </div>
              </div>
            {/if}

            {#if question.questionType === "number"}
              <div class="space-y-3">
                <h4 class="font-semibold text-sm" style="color: {$colorStore.text};">Number Validation</h4>
                <div>
                  <label for="f-FormEdit-minimum-value-1687" class="block text-sm mb-2" style="color: {$colorStore.muted};">
                    Minimum value
                  </label>
                  <input id="f-FormEdit-minimum-value-1687"
                    type="number"
                    value={question.minValue ?? ""}
                    oninput={(e) => updateQuestion(mobileIdx, { minValue: e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined })}
                    placeholder="No minimum"
                    class="w-full p-3 rounded-lg"
                    style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                  />
                </div>
                <div>
                  <label for="f-FormEdit-maximum-value-1700" class="block text-sm mb-2" style="color: {$colorStore.muted};">
                    Maximum value
                  </label>
                  <input id="f-FormEdit-maximum-value-1700"
                    type="number"
                    value={question.maxValue ?? ""}
                    oninput={(e) => updateQuestion(mobileIdx, { maxValue: e.currentTarget.value ? parseInt(e.currentTarget.value) : undefined })}
                    placeholder="No maximum"
                    class="w-full p-3 rounded-lg"
                    style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                  />
                </div>
              </div>
            {/if}

            <!-- Options (for multiple choice/checkboxes/dropdown) -->
            {#if question.questionType && supportsOptions(question.questionType)}
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="font-semibold text-sm" style="color: {$colorStore.text};">Options</h4>
                  <button
                    onclick={() => addOption(mobileIdx)}
                    class="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style="background: {$colorStore.primary}20; color: {$colorStore.text};"
                    type="button"
                  >
                    <i class="fa-solid fa-plus mr-2"></i>
                    Add Option
                  </button>
                </div>
                <div class="space-y-2">
                  {#if question.options && question.options.length > 0}
                    {#each question.options as option, optIndex}
                      <div class="flex gap-2">
                        <input
                          type="text"
                          value={option.optionText}
                          oninput={(e) => handleOptionTextInput(e, mobileIdx, optIndex)}
                          placeholder="Option {optIndex + 1}"
                          class="flex-1 p-3 rounded-lg"
                          style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                        />
                        <button
                          onclick={() => deleteOption(mobileIdx, optIndex)}
                          class="px-3 py-2 rounded-lg transition-all"
                          style="background: #ef444420; color: #ef4444;"
                          aria-label="Delete option"
                          type="button"
                        >
                          <i class="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    {/each}
                  {:else}
                    <p class="text-sm text-center py-4" style="color: {$colorStore.muted};">
                      No options yet. Click "Add Option" to create choices.
                    </p>
                  {/if}
                </div>
              </div>
            {/if}

            <!-- Conditional Logic -->
            <div class="border-t pt-4" style="border-color: {$colorStore.primary}20;">
              <h4 class="font-semibold text-sm mb-3" style="color: {$colorStore.text};">
                <i class="fa-solid fa-code-branch mr-2" style="color: {$colorStore.primary};"></i>
                Conditional Logic
              </h4>
              <ConditionalLogicEditor
                question={question}
                questionIndex={mobileEditingQuestionIndex}
                allQuestions={questions}
                roles={roles}
                onUpdate={(updates) => updateQuestion(mobileIdx, updates)}
              />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div
          class="p-4 border-t sticky bottom-0"
          style="background: {$colorStore.primary}10; border-color: {$colorStore.primary}30;"
        >
          <button
            type="button"
            onclick={closeMobileQuestionEditor}
            class="w-full py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
            style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}10); color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30; box-shadow: 0 4px 20px {$colorStore.primary}10;"
          >
            <i class="fa-solid fa-check mr-2"></i>
            Done
          </button>
        </div>
      </div>
    </div>
  </Portal>
{/if}

<style>
    /* Mobile-friendly touch targets */
    @media (max-width: 768px) {
        button {
            min-height: 44px; /* Apple's recommended touch target */
        }
    }
</style>
