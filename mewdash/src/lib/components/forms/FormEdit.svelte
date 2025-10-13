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
    type QuestionType
  } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { loadingStore } from "$lib/stores/loadingStore";
  import { fly, slide } from "svelte/transition";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import { sanitizeFormName, sanitizeInput, sanitizeQuestionText } from "$lib/utils/sanitize";
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
      options: []
    };

    questions = [...questions, newQuestion];
    editingQuestionId = newQuestion.id;
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
          notificationWebhookUrl: notificationWebhookUrl || undefined
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

  // Ensure external users is always enabled for BanAppeal and JoinApplication
  $effect(() => {
    if (formType === "BanAppeal" || formType === "JoinApplication") {
      allowExternalUsers = true; // Force enable for these types
    }
  });
</script>

{#if loading}
  <div
    class="backdrop-blur-xs rounded-xl border p-12 text-center"
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
      class="backdrop-blur-xs rounded-xl border p-6 transition-all"
      style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
    >
      <h2 class="text-xl font-bold mb-4" style="color: {$colorStore.text};">
        <i class="fa-solid fa-gear mr-2" style="color: {$colorStore.primary};"></i>
        Form Settings
      </h2>

      <div class="space-y-4">
        <!-- Form Type (Read-only in edit mode) -->
        <div>
          <label class="block text-sm mb-2" style="color: {$colorStore.muted};">
            Form Type
          </label>
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
              on:change={(e) => (submitChannelId = e.detail.selected)}
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
                on:change={(e) => (requiredRoleId = e.detail.selected)}
              />
            </div>
          {/if}
        </div>

        <!-- Options Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <!-- Draft Mode -->
          <div class="flex items-center justify-between p-2.5 rounded-lg" style="background: {$colorStore.primary}08;">
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
          <div class="flex items-center justify-between p-2.5 rounded-lg" style="background: {$colorStore.primary}08;">
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
          <div class="flex items-center justify-between p-2.5 rounded-lg" style="background: {$colorStore.primary}08;">
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
          <div class="flex items-center justify-between p-2.5 rounded-lg" style="background: {$colorStore.primary}08;">
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
            class="p-3 rounded-lg border text-xs"
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
            class="p-3 rounded-lg border text-xs"
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
        <div>
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
    </div>

    <!-- Join Application Settings -->
    {#if formType === "JoinApplication"}
      <div
        class="backdrop-blur-xs rounded-xl border p-6 transition-all"
        style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
        transition:slide
      >
        <h2 class="text-xl font-bold mb-4" style="color: {$colorStore.text};">
          <i class="fa-solid fa-user-plus mr-2" style="color: {$colorStore.primary};"></i>
          Join Application Settings
        </h2>

        <div class="space-y-4">
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
              on:change={(e) => (autoApproveRoleIds = e.detail.selected)}
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
      </div>
    {/if}

    <!-- Questions Section -->
    <div
      class="backdrop-blur-xs rounded-xl border p-6 transition-all"
      style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
    >
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold" style="color: {$colorStore.text};">
          <i class="fa-solid fa-question-circle mr-2" style="color: {$colorStore.primary};"></i>
          Questions
        </h2>
        <button
          onclick={() => (showQuestionTypeMenu = !showQuestionTypeMenu)}
          onmousemove={(e) => handleButtonMouseMove(e, 'add-question')}
          onmouseleave={() => handleButtonMouseLeave('add-question')}
          class="group px-4 py-2 rounded-lg font-medium transition-all hover:scale-[1.02] relative overflow-hidden"
          style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        >
          <!-- Mouse spotlight -->
          {#if buttonMousePositions['add-question']}
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
            {#each QUESTION_TYPES as qType, index}
              <button
                onclick={() => addQuestion(qType.type)}
                onmousemove={(e) => handleButtonMouseMove(e, `qtype-${qType.type}`)}
                onmouseleave={() => handleButtonMouseLeave(`qtype-${qType.type}`)}
                class="group p-3 rounded-lg transition-all hover:scale-[1.02] text-left relative overflow-hidden"
                style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;"
                in:fly={{ y: 20, duration: 400, delay: index * 50 }}
              >
                <!-- Mouse spotlight -->
                {#if buttonMousePositions[`qtype-${qType.type}`]}
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
        <div class="space-y-4">
          {#each questions as question, index (question.id || index)}
            <div
              draggable="true"
              ondragstart={() => handleDragStart(index)}
              ondragover={(e) => handleDragOver(e, index)}
              ondragend={handleDragEnd}
              role="listitem"
              class="backdrop-blur-xs rounded-lg border p-4 transition-all {draggedQuestionIndex ===
                index
                  ? 'opacity-50'
                  : 'hover:shadow-md'}"
              style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}25; cursor: move;"
              transition:slide
            >
              <!-- Question Header -->
              <div class="flex items-start gap-3 mb-3">
                <div
                  class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                >
                  {index + 1}
                </div>
                <div class="flex-1 min-w-0">
                  <input
                    type="text"
                    value={question.questionText}
                    oninput={(e) => {
                        question.questionText = e.currentTarget.value;
                        questions = [...questions];
                      }}
                    placeholder="Enter your question..."
                    class="w-full p-2 rounded-lg mb-2"
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
                <div class="flex-shrink-0 flex gap-1 flex-wrap">
                  <button
                    onclick={() => moveQuestion(index, "up")}
                    disabled={index === 0}
                    class="p-2 rounded transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                    style="background: {$colorStore.primary}15; color: {$colorStore.text};"
                    title="Move up"
                  >
                    <i class="fa-solid fa-arrow-up text-sm"></i>
                  </button>
                  <button
                    onclick={() => moveQuestion(index, "down")}
                    disabled={index === questions.length - 1}
                    class="p-2 rounded transition-all hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                    style="background: {$colorStore.primary}15; color: {$colorStore.text};"
                    title="Move down"
                  >
                    <i class="fa-solid fa-arrow-down text-sm"></i>
                  </button>
                  <button
                    onclick={() => duplicateQuestion(index)}
                    class="p-2 rounded transition-all hover:scale-110"
                    style="background: {$colorStore.secondary}15; color: {$colorStore.text};"
                    title="Duplicate"
                  >
                    <i class="fa-solid fa-copy text-sm"></i>
                  </button>
                  <button
                    onclick={() => deleteQuestion(index)}
                    class="p-2 rounded transition-all hover:scale-110"
                    style="background: #ef444415; color: #ef4444;"
                    title="Delete"
                  >
                    <i class="fa-solid fa-trash text-sm"></i>
                  </button>
                </div>
              </div>

              <!-- Question Details (Expandable) -->
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
                                oninput={(e) => updateOption(index, optIndex, { optionText: e.currentTarget.value, optionValue: e.currentTarget.value })}
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
                  <div>
                      <span class="block text-sm mb-2 font-medium" style="color: {$colorStore.muted};">
                        <i class="fa-solid fa-code-branch mr-1"></i>
                        Conditional Logic (Optional)
                      </span>
                    <p class="text-xs mb-3" style="color: {$colorStore.muted};">
                      Show this question only if a previous answer meets a condition
                    </p>

                    <div class="space-y-3">
                      <!-- Parent Question Selector -->
                      <div>
                          <span class="block text-xs mb-1" style="color: {$colorStore.muted};">
                            Show when question:
                          </span>
                        <DiscordSelector
                          type="custom"
                          options={[
                              { id: "", name: "Always show (no condition)" },
                              ...questions.slice(0, index)
                                .filter(q => q.questionText)
                                .map((q, i) => ({
                                  id: String(q.id),
                                  name: `Q${i + 1}: ${q.questionText.slice(0, 50)}`
                                }))
                            ]}
                          selected={question.conditionalParentQuestionId ? String(question.conditionalParentQuestionId) : ""}
                          placeholder="Select parent question"
                          on:change={(e) => updateQuestion(index, {
                              conditionalParentQuestionId: e.detail.selected ? parseInt(e.detail.selected) : undefined
                            })}
                          searchable={false}
                        />
                      </div>

                      {#if question.conditionalParentQuestionId}
                        <!-- Operator Selector -->
                        <div>
                            <span class="block text-xs mb-1" style="color: {$colorStore.muted};">
                              Operator:
                            </span>
                          <DiscordSelector
                            type="custom"
                            options={CONDITIONAL_OPERATORS.map(op => ({ id: op.value, name: op.label }))}
                            selected={question.conditionalOperator || "equals"}
                            placeholder="Select operator"
                            on:change={(e) => updateConditionalOperator(index, e.detail.selected)}
                            searchable={false}
                          />
                        </div>

                        <!-- Expected Value -->
                        <div>
                            <span class="block text-xs mb-1" style="color: {$colorStore.muted};">
                              Expected value:
                            </span>
                          <input
                            type="text"
                            value={question.conditionalExpectedValue || ""}
                            oninput={(e) => updateQuestion(index, { conditionalExpectedValue: e.currentTarget.value })}
                            placeholder="Enter expected value..."
                            class="w-full p-2 rounded-lg"
                            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20; color: {$colorStore.text};"
                            aria-label="Conditional expected value"
                          />
                        </div>
                      {/if}
                    </div>
                  </div>

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
        >
          <i class="fa-solid fa-check mr-2"></i>
          Save Changes
        </button>
      </div>
    {/if}
  </div>
{/if}
