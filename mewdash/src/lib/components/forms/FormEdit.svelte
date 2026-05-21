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

  // Form settings
  let formName = $state("");
  let formDescription = $state("");
  let submitChannelId = $state("");
  let allowMultipleSubmissions = $state(false);
  let maxResponses = $state<number | null>(null);
  let requireCaptcha = $state(false);
  let isActive = $state(true);
  let expiresAt = $state<string>("");
  let requiredRoleId = $state<string>("");
  let successMessage = $state<string>("");
  let isDraft = $state(false);
  let allowAnonymous = $state(false);
  let formType = $state<FormType>("Regular");
  let allowExternalUsers = $state(false);
  let autoApproveRoleIds = $state<string[]>([]);
  let inviteMaxUses = $state<number>(1);
  let inviteMaxAge = $state<number>(86400);
  let notificationWebhookUrl = $state<string>("");

  // Approval workflow (Regular forms only)
  let requireApproval = $state(false);
  let approvalActionType = $state<number>(0);
  let approvalRoleIds = $state<string[]>([]);
  let rejectionActionType = $state<number>(0);
  let rejectionRoleIds = $state<string[]>([]);

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
  let expandedSections = $state({
    basicSettings: true,
    advancedOptions: false,
    approvalWorkflow: false,
    joinAppSettings: false
  });

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
      console.error("Failed to load channels:", err);
    }
  }

  async function loadRoles() {
    if (!$currentGuild?.id) return;
    try {
      const rolesData = await clientApi.getRoles($currentGuild.id);
      roles = rolesData.map((r) => ({ id: r.id, name: r.name }));
    } catch (err) {
      console.error("Failed to load roles:", err);
    }
  }

  async function loadForm() {
    return await loadingStore.wrap("load-form", async () => {
      try {
        loading = true;
        existingForm = await formsApi.getForm(formId);
        const loadedQuestions = await formsApi.getFormQuestions(formId);

        // Populate form data
        formName = existingForm.name;
        formDescription = existingForm.description || "";
        submitChannelId = existingForm.submitChannelId?.toString() || "";
        allowMultipleSubmissions = existingForm.allowMultipleSubmissions;
        maxResponses = existingForm.maxResponses || null;
        requireCaptcha = existingForm.requireCaptcha;
        isActive = existingForm.isActive;
        expiresAt = existingForm.expiresAt ? new Date(existingForm.expiresAt).toISOString().slice(0, 16) : "";
        requiredRoleId = existingForm.requiredRoleId?.toString() || "";
        successMessage = existingForm.successMessage || "";
        isDraft = existingForm.isDraft;
        allowAnonymous = existingForm.allowAnonymous;
        formType = intToFormType(existingForm.formType);
        allowExternalUsers = existingForm.allowExternalUsers;
        autoApproveRoleIds = existingForm.autoApproveRoleIds?.split(",").filter(x => x) || [];
        inviteMaxUses = existingForm.inviteMaxUses || 1;
        inviteMaxAge = existingForm.inviteMaxAge || 86400;
        notificationWebhookUrl = existingForm.notificationWebhookUrl || "";
        requireApproval = existingForm.requireApproval || false;
        approvalActionType = existingForm.approvalActionType || 0;
        approvalRoleIds = existingForm.approvalRoleIds?.split(",").filter(x => x) || [];
        rejectionActionType = existingForm.rejectionActionType || 0;
        rejectionRoleIds = existingForm.rejectionRoleIds?.split(",").filter(x => x) || [];
        questions = loadedQuestions;
      } catch (err) {
        onShowNotification("Failed to load form", "error");
      } finally {
        loading = false;
      }
    }, "api", "Loading form...");
  }

  function addQuestion(type: QuestionType) {
    const newQuestion: FormQuestion = {
      id: 0, // Will be assigned by backend
      formId: formId,
      questionText: "",
      questionType: type,
      isRequired: false,
      displayOrder: questions.length,
      createdAt: new Date().toISOString(),
      options: [],
      conditionalType: 0, // Default to QuestionBased
      enableAnswerPiping: false
    };

    questions = [...questions, newQuestion];

    if (isMobile) {
      mobileEditingQuestionIndex = questions.length - 1;
      showMobileQuestionEditor = true;
    } else {
      editingQuestionId = newQuestion.id;
    }

    showQuestionTypeMenu = false;
  }

  function deleteQuestion(index: number) {
    questions = questions.filter((_, i) => i !== index);
    questions.forEach((q, i) => (q.displayOrder = i));
  }

  function duplicateQuestion(index: number) {
    const question = questions[index];
    const duplicated: FormQuestion = {
      ...question,
      id: 0,
      questionText: question.questionText + " (Copy)",
      displayOrder: questions.length,
      createdAt: new Date().toISOString(),
      options: question.options?.map((opt) => ({ ...opt, id: 0 }))
    };
    questions = [...questions, duplicated];
  }

  function moveQuestion(index: number, direction: "up" | "down") {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[index]];
    newQuestions.forEach((q, i) => (q.displayOrder = i));
    questions = newQuestions;
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
        const validationErrors = validateForm(formName, questions);
        if (validationErrors.length > 0) {
          onShowNotification(validationErrors[0].message, "error");
          console.error("Validation errors:", validationErrors);
          return;
        }

        // Sanitize form data
        const sanitizedName = sanitizeFormName(formName);
        const sanitizedDescription = formDescription ? sanitizeInput(formDescription) : undefined;

        // Ensure we have existing form data
        if (!existingForm) {
          throw new Error("Missing form data");
        }

        // Update form - Start with ALL existing fields, then override only what changed
        await formsApi.updateForm(formId, {
          ...existingForm, // ✅ Preserve ALL existing fields
          // Override with edited values
          name: sanitizedName,
          description: sanitizedDescription,
          submitChannelId: submitChannelId ? BigInt(submitChannelId) : undefined,
          allowMultipleSubmissions,
          maxResponses: maxResponses || undefined,
          requireCaptcha,
          isActive,
          expiresAt: expiresAt || undefined,
          requiredRoleId: requiredRoleId ? BigInt(requiredRoleId) : undefined,
          successMessage: successMessage || undefined,
          isDraft,
          allowAnonymous,
          formType: formTypeToInt(formType) as any,
          allowExternalUsers,
          autoApproveRoleIds: autoApproveRoleIds.length > 0 ? autoApproveRoleIds.join(",") : undefined,
          inviteMaxUses: formType === "JoinApplication" ? inviteMaxUses : undefined,
          inviteMaxAge: formType === "JoinApplication" ? inviteMaxAge : undefined,
          notificationWebhookUrl: notificationWebhookUrl || undefined,
          requireApproval: formType === "Regular" ? requireApproval : false,
          approvalActionType: formType === "Regular" && requireApproval ? approvalActionType : 0,
          approvalRoleIds: formType === "Regular" && requireApproval && approvalRoleIds.length > 0 ? approvalRoleIds.join(",") : undefined,
          rejectionActionType: formType === "Regular" && requireApproval ? rejectionActionType : 0,
          rejectionRoleIds: formType === "Regular" && requireApproval && rejectionRoleIds.length > 0 ? rejectionRoleIds.join(",") : undefined
        });

        // Delete all existing questions first (backend will handle cascade)
        const existingQuestions = await formsApi.getFormQuestions(formId);
        for (const q of existingQuestions) {
          await formsApi.deleteQuestion(q.id);
        }

        // Re-create questions with new order and data
        for (const question of questions) {
          if (!question.questionText?.trim()) continue;

          const sanitizedQuestionText = sanitizeQuestionText(question.questionText);

          const createdQuestion = await formsApi.addQuestion(formId, {
            questionText: sanitizedQuestionText,
            questionType: question.questionType,
            isRequired: question.isRequired || false,
            displayOrder: question.displayOrder,
            placeholder: question.placeholder ? sanitizeInput(question.placeholder) : undefined,
            minValue: question.minValue,
            maxValue: question.maxValue,
            minLength: question.minLength,
            maxLength: question.maxLength,
            conditionalParentQuestionId: question.conditionalParentQuestionId,
            conditionalOperator: question.conditionalOperator,
            conditionalExpectedValue: question.conditionalExpectedValue
              ? sanitizeInput(question.conditionalExpectedValue)
              : undefined
          });

          // Add options if applicable
          if (
            question.options &&
            question.options.length > 0 &&
            ["multiple_choice", "checkboxes", "dropdown"].includes(question.questionType)
          ) {
            for (const option of question.options) {
              if (!option.optionText?.trim()) continue;

              await formsApi.addQuestionOption(createdQuestion.id, {
                optionText: sanitizeInput(option.optionText),
                optionValue: sanitizeInput(option.optionValue || option.optionText),
                displayOrder: option.displayOrder
              });
            }
          }
        }

        onShowNotification("Form updated successfully!", "success");
        setTimeout(() => onSuccess(), 1500);
      } catch (err) {
        console.error("Failed to update form:", err);
        onShowNotification(
          err instanceof Error ? err.message : "Failed to update form",
          "error"
        );
      }
    }, "operation", "Updating form...");
  }

  onMount(() => {
    checkMobile();
    loadChannels();
    loadRoles();
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

  // Ensure external users is always enabled for BanAppeal and JoinApplication
  $effect(() => {
    if (formType === "BanAppeal" || formType === "JoinApplication") {
      allowExternalUsers = true; // Force enable for these types
      requireApproval = false; // Ban appeals and join apps have their own workflow
    }
  });

  // Validation: Anonymous forms cannot have approval workflows with role actions
  $effect(() => {
    if (allowAnonymous && requireApproval && (approvalActionType !== 0 || rejectionActionType !== 0)) {
      // Warn user and disable role actions
      approvalActionType = 0;
      rejectionActionType = 0;
      approvalRoleIds = [];
      rejectionRoleIds = [];
    }
  });

  function toggleSection(section: keyof typeof expandedSections) {
    expandedSections[section] = !expandedSections[section];
  }
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
    <!-- Form Settings -->
    <div
      class=" rounded-xl border p-4 sm:p-6 transition-all"
      style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
    >
      {#if isMobile}
        <button
          type="button"
          onclick={() => toggleSection('basicSettings')}
          class="w-full flex items-center justify-between mb-4"
        >
          <h2 class="text-lg font-bold" style="color: {$colorStore.text};">
            <i class="fa-solid fa-gear mr-2" style="color: {$colorStore.primary};"></i>
            Form Settings
          </h2>
          <i class="fa-solid fa-chevron-{expandedSections.basicSettings ? 'up' : 'down'}"
             style="color: {$colorStore.muted};"></i>
        </button>
      {:else}
        <h2 class="text-xl font-bold mb-4" style="color: {$colorStore.text};">
          <i class="fa-solid fa-gear mr-2" style="color: {$colorStore.primary};"></i>
          Form Settings
        </h2>
      {/if}

      {#if !isMobile || expandedSections.basicSettings}
        <div class="space-y-4" transition:slide>
          <!-- Form Type (Read-only in edit mode) -->
          <div>
            <span class="block text-sm mb-2" style="color: {$colorStore.muted};">
              Form Type
            </span>
            <div
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg"
              style="background: {$colorStore.primary}15; border: 1px solid {$colorStore.primary}30;"
            >
              <i class="fa-solid {FORM_TYPES.find(ft => ft.type === formType)?.icon}"
                 style="color: {$colorStore.primary};"></i>
              <span class="font-medium" style="color: {$colorStore.text};">
                  {FORM_TYPES.find(ft => ft.type === formType)?.label}
                </span>
              <span class="text-xs" style="color: {$colorStore.muted};">(Cannot be changed)</span>
            </div>
          </div>

          <!-- Form Name & Description -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="form-name" class="block text-sm mb-1.5" style="color: {$colorStore.muted};">
                Form Name <span style="color: #ef4444;">*</span>
              </label>
              <input
                id="form-name"
                type="text"
                bind:value={formName}
                maxlength="255"
                class="w-full p-2.5 rounded-lg text-sm"
                style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                placeholder="e.g., Staff Application"
              />
            </div>

            <div>
              <label for="form-description" class="block text-sm mb-1.5" style="color: {$colorStore.muted};">
                Description (Optional)
              </label>
              <input
                id="form-description"
                type="text"
                bind:value={formDescription}
                maxlength="500"
                class="w-full p-2.5 rounded-lg text-sm"
                style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                placeholder="Brief description..."
              />
            </div>
          </div>

          <!-- Advanced Options Toggle for Mobile -->
          {#if isMobile}
            <button
              type="button"
              onclick={() => toggleSection('advancedOptions')}
              class="w-full flex items-center justify-between p-3 rounded-lg"
              style="background: {$colorStore.primary}08;"
            >
              <span class="text-sm font-medium" style="color: {$colorStore.text};">
                <i class="fa-solid fa-sliders mr-2"></i>
                Advanced Options
              </span>
              <i class="fa-solid fa-chevron-{expandedSections.advancedOptions ? 'up' : 'down'}"
                 style="color: {$colorStore.muted};"></i>
            </button>
          {/if}

          {#if !isMobile || expandedSections.advancedOptions}
            <div transition:slide>
              <!-- Two-Column Layout for Compact Settings -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Max Responses -->
                <div>
                  <label for="max-responses" class="block text-xs mb-1.5" style="color: {$colorStore.muted};">
                    Max Responses (Optional)
                  </label>
                  <input
                    id="max-responses"
                    type="number"
                    bind:value={maxResponses}
                    min="1"
                    class="w-full p-2 rounded-lg text-sm"
                    style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                    placeholder="Unlimited"
                  />
                </div>

                <!-- Expiration Date/Time -->
                <div>
                  <label for="expires-at" class="block text-xs mb-1.5" style="color: {$colorStore.muted};">
                    <i class="fa-solid fa-clock mr-1"></i>
                    Expiration (Optional)
                  </label>
                  <input
                    id="expires-at"
                    type="datetime-local"
                    bind:value={expiresAt}
                    class="w-full p-2 rounded-lg text-sm"
                    style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                  />
                </div>

                <!-- Notification Channel -->
                <div class="{formType === 'Regular' ? '' : 'md:col-span-2'}">
                  <label for="submit-channel" class="block text-xs mb-1.5" style="color: {$colorStore.muted};">
                    Notification Channel (Optional)
                  </label>
                  <DiscordSelector
                    type="channel"
                    options={channels}
                    selected={submitChannelId}
                    placeholder="Select a channel..."
                    onchange={(e) => (submitChannelId = e.selected as string)}
                  />
                </div>

                <!-- Required Role (only for Regular forms) -->
                {#if formType === "Regular"}
                  <div>
                    <label for="required-role" class="block text-xs mb-1.5" style="color: {$colorStore.muted};">
                      <i class="fa-solid fa-shield mr-1"></i>
                      Required Role (Optional)
                    </label>
                    <DiscordSelector
                      type="role"
                      options={roles}
                      selected={requiredRoleId}
                      placeholder="Select a role..."
                      onchange={(e) => (requiredRoleId = e.selected as string)}
                    />
                  </div>
                {/if}
              </div>

              <!-- Options Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                <!-- Draft Mode -->
                <div class="flex items-center justify-between p-2.5 rounded-lg"
                     style="background: {$colorStore.primary}08;">
                  <div class="text-sm" style="color: {$colorStore.text};">
                    Draft Mode
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" bind:checked={isDraft} />
                    <span
                      class="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all block"
                      style:background-color={isDraft ? "#f59e0b" : "#10B981"}
                    ></span>
                  </label>
                </div>

                <!-- Form Active -->
                <div class="flex items-center justify-between p-2.5 rounded-lg"
                     style="background: {$colorStore.primary}08;">
                  <div class="text-sm" style="color: {$colorStore.text};">
                    Form Active
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" bind:checked={isActive} />
                    <span
                      class="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all block"
                      style:background-color={isActive ? "#10B981" : "#EF4444"}
                    ></span>
                  </label>
                </div>

                <!-- Allow Anonymous (only for Regular forms) -->
                {#if formType === "Regular"}
                  <div class="flex items-center justify-between p-2.5 rounded-lg"
                       style="background: {$colorStore.primary}08;">
                    <div class="text-sm" style="color: {$colorStore.text};">
                      <i class="fa-solid fa-user-secret mr-1.5"></i>
                      Anonymous
                    </div>
                    <label class="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" class="sr-only peer" bind:checked={allowAnonymous} />
                      <span
                        class="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all block"
                        style:background-color={allowAnonymous ? "#8b5cf6" : "#4b5563"}
                      ></span>
                    </label>
                  </div>
                {/if}

                <!-- Multiple Submissions -->
                <div class="flex items-center justify-between p-2.5 rounded-lg"
                     style="background: {$colorStore.primary}08;">
                  <div class="text-sm" style="color: {$colorStore.text};">
                    Multiple Submissions
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" bind:checked={allowMultipleSubmissions} />
                    <span
                      class="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all block"
                      style:background-color={allowMultipleSubmissions ? $colorStore.primary : "#4b5563"}
                    ></span>
                  </label>
                </div>

                <!-- Require Captcha -->
                <div class="flex items-center justify-between p-2.5 rounded-lg"
                     style="background: {$colorStore.primary}08;">
                  <div class="text-sm" style="color: {$colorStore.text};">Require Captcha</div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer" bind:checked={requireCaptcha} />
                    <span
                      class="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all block"
                      style:background-color={requireCaptcha ? $colorStore.primary : "#4b5563"}
                    ></span>
                  </label>
                </div>

                <!-- Allow External Users -->
                <div class="flex items-center justify-between p-2.5 rounded-lg"
                     style="background: {$colorStore.primary}08; opacity: {formType !== 'Regular' ? '0.6' : '1'};">
                  <div class="text-sm" style="color: {$colorStore.text};">
                    <i class="fa-solid fa-globe mr-1.5"></i>
                    Allow External Users
                    {#if formType !== "Regular"}
                      <span class="text-xs ml-1" style="color: {$colorStore.muted};">(required)</span>
                    {/if}
                  </div>
                  <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox"
                           class="sr-only peer"
                           bind:checked={allowExternalUsers}
                           disabled={formType !== "Regular"} />
                    <span
                      class="w-9 h-5 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all block peer-disabled:cursor-not-allowed"
                      style:background-color={allowExternalUsers ? $colorStore.primary : "#4b5563"}
                    ></span>
                  </label>
                </div>
              </div>

              {#if allowExternalUsers}
                <div
                  class="p-3 rounded-lg border text-xs mt-4"
                  style="background: #3b82f608; border-color: #3b82f620;"
                  transition:slide
                >
                  <div class="flex items-start gap-2">
                    <i class="fa-solid fa-info-circle flex-shrink-0 mt-0.5" style="color: #3b82f6;"></i>
                    <span style="color: {$colorStore.muted};">
                      Users can submit this form even if they're not in your server. Perfect for applications and feedback.
                    </span>
                  </div>
                </div>
              {/if}

              {#if allowAnonymous}
                <div
                  class="p-3 rounded-lg border text-xs mt-4"
                  style="background: #8b5cf608; border-color: #8b5cf620;"
                  transition:slide
                >
                  <div class="flex items-start gap-2">
                    <i class="fa-solid fa-info-circle flex-shrink-0 mt-0.5" style="color: #8b5cf6;"></i>
                    <span style="color: {$colorStore.muted};">
                        Users log in for verification but identity is not stored. Only answers are saved.
                      </span>
                  </div>
                </div>
              {/if}

              <!-- Custom Success Message -->
              <div class="mt-4">
                <label for="success-message" class="block text-xs mb-1.5" style="color: {$colorStore.muted};">
                  <i class="fa-solid fa-message mr-1"></i>
                  Success Message (Optional)
                </label>
                <textarea
                  id="success-message"
                  bind:value={successMessage}
                  rows="2"
                  maxlength="1000"
                  class="w-full p-2 rounded-lg resize-none text-sm"
                  style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                  placeholder="Thank you for your submission!"
                ></textarea>
              </div>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <!-- Approval Workflow Settings (Regular Forms Only) -->
    {#if formType === "Regular"}
      <div
        class=" rounded-xl border p-4 sm:p-6 transition-all"
        style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
        transition:slide
      >
        {#if isMobile}
          <button
            type="button"
            onclick={() => toggleSection('approvalWorkflow')}
            class="w-full flex items-center justify-between mb-4"
          >
            <h2 class="text-lg font-bold" style="color: {$colorStore.text};">
              <i class="fa-solid fa-clipboard-check mr-2" style="color: {$colorStore.primary};"></i>
              Approval Workflow
            </h2>
            <i class="fa-solid fa-chevron-{expandedSections.approvalWorkflow ? 'up' : 'down'}"
               style="color: {$colorStore.muted};"></i>
          </button>
        {:else}
          <h2 class="text-xl font-bold mb-4" style="color: {$colorStore.text};">
            <i class="fa-solid fa-clipboard-check mr-2" style="color: {$colorStore.primary};"></i>
            Approval Workflow (Optional)
          </h2>
        {/if}

        {#if !isMobile || expandedSections.approvalWorkflow}
          <div class="space-y-4" transition:slide>
            <!-- Require Approval Toggle -->
            <div class="flex items-center justify-between p-3 rounded-lg" style="background: {$colorStore.primary}08;">
              <div>
                <div class="font-semibold mb-1" style="color: {$colorStore.text};">
                  <i class="fa-solid fa-user-check mr-2" style="color: {$colorStore.primary};"></i>
                  Require Manual Approval
                </div>
                <p class="text-xs" style="color: {$colorStore.muted};">
                  Form submissions will need to be manually approved or rejected
                </p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" bind:checked={requireApproval} />
                <span
                  class="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all block"
                  style:background-color={requireApproval ? $colorStore.primary : "#4b5563"}
                ></span>
              </label>
            </div>

            <!-- Warning: Anonymous + Approval with Role Actions -->
            {#if allowAnonymous && requireApproval}
              <div
                class="p-3 rounded-lg border text-xs"
                style="background: #ef444408; border-color: #ef444430;"
                transition:slide
              >
                <div class="flex items-start gap-2">
                  <i class="fa-solid fa-exclamation-triangle flex-shrink-0 mt-0.5" style="color: #ef4444;"></i>
                  <span style="color: #ef4444;">
                    <strong>Warning:</strong> Anonymous forms cannot have role actions because user identity is not stored. Role action settings will be ignored.
                  </span>
                </div>
              </div>
            {/if}

            {#if requireApproval}
              <!-- Approval Actions -->
              <div
                class="p-4 rounded-lg border space-y-4"
                style="background: #10B98108; border-color: #10B98130;"
                transition:slide
              >
                <div class="flex items-center gap-2">
                  <i class="fa-solid fa-check-circle" style="color: #10B981; font-size: 18px;"></i>
                  <h3 class="font-semibold" style="color: {$colorStore.text};">When Approved</h3>
                </div>

                <!-- Approval Action Type -->
                <div>
                  <label for="f-FormEdit-action-type-907" class="block text-sm mb-2" style="color: {$colorStore.muted};">
                    <i class="fa-solid fa-cog mr-1"></i>
                    Action Type
                  </label>
                  <DiscordSelector id="f-FormEdit-action-type-907"
                    type="custom"
                    options={ROLE_ACTION_TYPES.map(t => ({ id: String(t.value), name: `${t.label} - ${t.description}` }))}
                    selected={String(approvalActionType)}
                    placeholder="Select action type..."
                    onchange={(e) => {
                      approvalActionType = parseInt(e.selected as string);
                    }}
                    searchable={false}
                  />
                </div>

                <!-- Approval Roles (only show if action type is not None) -->
                {#if approvalActionType !== 0}
                  <div transition:slide>
                    <label for="f-FormEdit-roles-to-approvalactiontype-1--926" class="block text-sm mb-2" style="color: {$colorStore.muted};">
                      <i class="fa-solid fa-shield mr-1"></i>
                      Roles to {approvalActionType === 1 ? "Add" : "Remove"}
                    </label>
                    <DiscordSelector id="f-FormEdit-roles-to-approvalactiontype-1--926"
                      type="role"
                      options={roles}
                      selected={approvalRoleIds}
                      placeholder="Select roles to {approvalActionType === 1 ? 'add' : 'remove'} on approval..."
                      multiple
                      onchange={(e) => {
                        approvalRoleIds = e.selected as string[];
                      }}
                    />
                    <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                      {#if approvalActionType === 1}
                        These roles will be added to the user when their response is approved
                      {:else}
                        These roles will be removed from the user when their response is approved
                      {/if}
                    </p>
                  </div>
                {/if}
              </div>

              <!-- Rejection Actions -->
              <div
                class="p-4 rounded-lg border space-y-4"
                style="background: #ef444408; border-color: #ef444430;"
                transition:slide
              >
                <div class="flex items-center gap-2">
                  <i class="fa-solid fa-times-circle" style="color: #ef4444; font-size: 18px;"></i>
                  <h3 class="font-semibold" style="color: {$colorStore.text};">When Rejected</h3>
                </div>

                <!-- Rejection Action Type -->
                <div>
                  <label for="f-FormEdit-action-type-964" class="block text-sm mb-2" style="color: {$colorStore.muted};">
                    <i class="fa-solid fa-cog mr-1"></i>
                    Action Type
                  </label>
                  <DiscordSelector id="f-FormEdit-action-type-964"
                    type="custom"
                    options={ROLE_ACTION_TYPES.map(t => ({ id: String(t.value), name: `${t.label} - ${t.description}` }))}
                    selected={String(rejectionActionType)}
                    placeholder="Select action type..."
                    onchange={(e) => {
                      rejectionActionType = parseInt(e.selected as string);
                    }}
                    searchable={false}
                  />
                </div>

                <!-- Rejection Roles (only show if action type is not None) -->
                {#if rejectionActionType !== 0}
                  <div transition:slide>
                    <label for="f-FormEdit-roles-to-rejectionactiontype-1-983" class="block text-sm mb-2" style="color: {$colorStore.muted};">
                      <i class="fa-solid fa-shield mr-1"></i>
                      Roles to {rejectionActionType === 1 ? "Add" : "Remove"}
                    </label>
                    <DiscordSelector id="f-FormEdit-roles-to-rejectionactiontype-1-983"
                      type="role"
                      options={roles}
                      selected={rejectionRoleIds}
                      placeholder="Select roles to {rejectionActionType === 1 ? 'add' : 'remove'} on rejection..."
                      multiple
                      onchange={(e) => {
                        rejectionRoleIds = e.selected as string[];
                      }}
                    />
                    <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                      {#if rejectionActionType === 1}
                        These roles will be added to the user when their response is rejected
                      {:else}
                        These roles will be removed from the user when their response is rejected
                      {/if}
                    </p>
                  </div>
                {/if}
              </div>

              <!-- Info Banner -->
              <div
                class="p-3 rounded-lg border text-xs"
                style="background: #3b82f608; border-color: #3b82f620;"
                transition:slide
              >
                <div class="flex items-start gap-2">
                  <i class="fa-solid fa-info-circle flex-shrink-0 mt-0.5" style="color: #3b82f6;"></i>
                  <div style="color: {$colorStore.muted};">
                    <strong>Note:</strong> Approval workflow requires users to be guild members for role actions to
                    work. Submissions will appear in the "Pending" tab until reviewed.
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>
    {/if}

    <!-- Join Application Settings -->
    {#if formType === "JoinApplication"}
      <div
        class=" rounded-xl border p-4 sm:p-6 transition-all"
        style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
        transition:slide
      >
        {#if isMobile}
          <button
            type="button"
            onclick={() => toggleSection('joinAppSettings')}
            class="w-full flex items-center justify-between mb-4"
          >
            <h2 class="text-lg font-bold" style="color: {$colorStore.text};">
              <i class="fa-solid fa-user-plus mr-2" style="color: {$colorStore.primary};"></i>
              Join Application Settings
            </h2>
            <i class="fa-solid fa-chevron-{expandedSections.joinAppSettings ? 'up' : 'down'}"
               style="color: {$colorStore.muted};"></i>
          </button>
        {:else}
          <h2 class="text-xl font-bold mb-4" style="color: {$colorStore.text};">
            <i class="fa-solid fa-user-plus mr-2" style="color: {$colorStore.primary};"></i>
            Join Application Settings
          </h2>
        {/if}

        {#if !isMobile || expandedSections.joinAppSettings}
          <div class="space-y-4" transition:slide>
            <!-- Auto-Approve Roles -->
            <div>
              <label for="auto-approve-roles" class="block text-sm mb-2" style="color: {$colorStore.muted};">
                <i class="fa-solid fa-shield mr-1"></i>
                Roles to Assign on Join (Optional)
              </label>
              <DiscordSelector
                type="role"
                options={roles}
                selected={autoApproveRoleIds}
                placeholder="Select roles to assign when approved..."
                multiple
                onchange={(e) => (autoApproveRoleIds = e.selected as string[])}
              />
              <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                These roles will be automatically assigned when the user joins the server after approval
              </p>
            </div>

            <!-- Invite Settings -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="invite-max-uses" class="block text-sm mb-2" style="color: {$colorStore.muted};">
                  <i class="fa-solid fa-ticket mr-1"></i>
                  Invite Max Uses
                </label>
                <input
                  id="invite-max-uses"
                  type="number"
                  bind:value={inviteMaxUses}
                  min="1"
                  max="100"
                  class="w-full p-3 rounded-lg"
                  style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                />
                <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                  How many times the invite can be used (default: 1)
                </p>
              </div>

              <div>
                <label for="invite-max-age" class="block text-sm mb-2" style="color: {$colorStore.muted};">
                  <i class="fa-solid fa-clock mr-1"></i>
                  Invite Expiry (seconds)
                </label>
                <input
                  id="invite-max-age"
                  type="number"
                  bind:value={inviteMaxAge}
                  min="60"
                  max="604800"
                  class="w-full p-3 rounded-lg"
                  style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                />
                <p class="text-xs mt-1" style="color: {$colorStore.muted};">
                  How long before the invite expires (default: 86400 = 24 hours)
                </p>
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/if}

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
          <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
            {#each QUESTION_TYPES as qType, qIndex}
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
      {:else}
        <div class="space-y-3">
          {#each questions as question, index (question.id || index)}
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
                    <!-- Placeholder -->
                    <div>
                        <span class="block text-sm mb-2" style="color: {$colorStore.muted};">
                          Placeholder Text
                        </span>
                      <input
                        type="text"
                        value={question.placeholder || ""}
                        oninput={(e) => updateQuestion(index, { placeholder: e.currentTarget.value })}
                        class="w-full p-2 rounded-lg"
                        style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
                        placeholder="e.g., Type your answer here..."
                        aria-label="Placeholder text"
                      />
                    </div>

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
                Placeholder Text (Optional)
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
                Required Question
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
                    Minimum Length
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
                    Maximum Length
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
                    Minimum Value
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
                    Maximum Value
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
