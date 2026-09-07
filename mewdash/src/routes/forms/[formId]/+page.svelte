<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import {
    clientApi,
    type Form,
    type FormQuestion,
    type FormQuestionCondition,
    formsApi,
    type FormSubmissionRequest,
    instanceManagementApi
  } from "$lib/api/index.ts";
  import { guildApi } from "$lib/api/index.ts";
  import { paginateQuestions } from "$lib/api/forms/models";
  import { isSafeUrl, renderFormText, renderFormTextPlain } from "$lib/utils/formMarkdown";
  import { currentInstance } from "$lib/stores/instanceStore";
  import type { PageData } from "./$types";
  import { colorStore } from "$lib/stores/colorStore";
  import { fade, fly, slide } from "svelte/transition";
  import { Turnstile } from "svelte-turnstile";
  import {
    containsZalgo,
    isValidEmail,
    isValidNumber,
    isValidUrl,
    removeZalgoText,
    sanitizeAnswerText,
    sanitizeUrlPath
  } from "$lib/utils/sanitize";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let formId = $state(0);
  let form = $state<Form | null>(null);
  let questions = $state<FormQuestion[]>([]);
  let answers = $state<Record<number, string | string[]>>({});
  let loading = $state(true);
  let submitting = $state(false);
  let error = $state<string | null>(null);
  let success = $state(false);
  let turnstileToken = $state<string | undefined>(undefined);
  let turnstileExpired = $state(false);
  let validationErrors = $state<Record<number, string>>({});
  let isPreviewMode = $state(false);
  let isAdmin = $state(false);
  let currentQuestionIndex = $state(0);
  let showConfirmation = $state(false);
  let showLoginPrompt = $state(false);
  let statusCheckUrl = $state<string>("");
  let statusCheckToken = $state<string>("");
  let userGuildMember = $state<any>(null); // Guild member data for Discord conditionals

  /**
   * The server the form belongs to. A public form link arrives with no context at all, so saying
   * whose form this is matters both on the page and in the link preview.
   */
  let guildName = $state<string | null>(null);
  let guildIconUrl = $state<string | null>(null);

  /**
   * The response being corrected, when the page was opened from a status link to fix an answer a
   * reviewer asked about. The whole form is reused rather than reimplemented, so an edit is
   * checked against exactly the same rules a first submission is.
   */
  let editingResponseId = $state<number | null>(null);
  let editToken = $state<string | null>(null);
  let isEditing = $derived(editingResponseId !== null);

  /** When a temporary refusal lifts, so the page can count down to it instead of just refusing. */
  let retryAt = $state<Date | null>(null);
  let now = $state(new Date());

  /** The page of the form being filled in, counting from zero. */
  let currentPage = $state(0);

  /** When the draft was last saved, shown so somebody can trust the form is holding their work. */
  let draftSavedAt = $state<Date | null>(null);
  let draftRestored = $state(false);
  let savingDraft = $state(false);
  let draftTimer: ReturnType<typeof setTimeout> | null = null;

  // Computed - Filter visible questions based on ALL conditional types
  let visibleQuestions = $derived(
    questions.filter((q) => shouldShowQuestion(q))
  );

  /**
   * The form split into pages at its section breaks. Recomputed from the visible questions, so a
   * page whose every question is conditionally hidden disappears rather than presenting itself as
   * an empty step somebody has to click through.
   */
  let pages = $derived(
    paginateQuestions(visibleQuestions).filter(
      (p) => p.questions.length > 0 || p.heading
    )
  );

  let isPaginated = $derived(pages.length > 1);

  let pageQuestions = $derived(
    isPaginated ? (pages[Math.min(currentPage, pages.length - 1)]?.questions ?? []) : visibleQuestions
  );

  let pageHeading = $derived(
    isPaginated ? (pages[Math.min(currentPage, pages.length - 1)]?.heading ?? null) : null
  );

  let isLastPage = $derived(!isPaginated || currentPage >= pages.length - 1);

  /** Questions that actually take an answer, which excludes the section breaks laying out the form. */
  let answerableQuestions = $derived(
    visibleQuestions.filter((q) => q.questionType !== "section_break")
  );

  let answeredQuestions = $derived(
    answerableQuestions.filter((q) => {
      const answer = answers[q.id];
      if (!answer) return false;
      if (typeof answer === "string") return answer.trim().length > 0;
      if (Array.isArray(answer)) return answer.length > 0;
      return true;
    })
  );

  let progressPercentage = $derived(
    answerableQuestions.length > 0 ? Math.round((answeredQuestions.length / answerableQuestions.length) * 100) : 0
  );

  // Every kind of input writes into `answers`, so watching it here catches the checkboxes and
  // dropdowns as well as the text fields, rather than each having to remember to save.
  $effect(() => {
    // Read the answers so this reruns whenever any of them change.
    JSON.stringify(answers);

    // An edit already has a stored response behind it, so there is nothing a draft would protect.
    if (!form || isPreviewMode || isEditing || success || !data.user) return;
    if (Object.keys(answers).length === 0) return;

    scheduleDraftSave();
  });

  /** What a screen reader is told when the page changes. */
  let pageAnnouncement = $derived(
    pageHeading
      ? `Page ${currentPage + 1} of ${pages.length}: ${renderFormTextPlain(pageHeading.questionText)}`
      : `Page ${currentPage + 1} of ${pages.length}`
  );

  /**
   * The one line the link preview gets. An anonymous form says so here too, since that is what
   * somebody reads before deciding whether to open the link at all.
   */
  let metaDescription = $derived.by(() => {
    const summary =
      form?.description?.trim() ||
      (guildName ? `A form from ${guildName}` : "Fill out this form");

    return form?.allowAnonymous ? `${summary} Your answers are submitted anonymously.` : summary;
  });

  /** How long until a temporary refusal lifts, phrased the way somebody would say it out loud. */
  let retryCountdown = $derived.by(() => {
    if (!retryAt) return null;

    const seconds = Math.max(0, Math.floor((retryAt.getTime() - now.getTime()) / 1000));
    if (seconds <= 0) return null;

    const days = Math.floor(seconds / 86400);
    if (days >= 1) return `${days} day${days === 1 ? "" : "s"}`;

    const hours = Math.floor(seconds / 3600);
    if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"}`;

    const minutes = Math.floor(seconds / 60);
    if (minutes >= 1) return `${minutes} minute${minutes === 1 ? "" : "s"}`;

    return `${seconds} second${seconds === 1 ? "" : "s"}`;
  });

  // Comprehensive conditional evaluation
  function shouldShowQuestion(question: FormQuestion): boolean {
    const condType = question.conditionalType || 0;

    switch (condType) {
      case 0: // QuestionBased
        return evaluateQuestionBasedCondition(question);
      case 1: // DiscordRole
        return evaluateDiscordRoleCondition(question);
      case 2: // ServerTenure
        return evaluateServerTenureCondition(question);
      case 3: // BoostStatus
        return evaluateBoostStatusCondition(question);
      case 4: // Permission
        return evaluatePermissionCondition(question);
      case 5: // MultipleConditions
        return evaluateMultipleConditions(question);
      default:
        return true;
    }
  }

  function evaluateQuestionBasedCondition(question: FormQuestion): boolean {
    if (!question.conditionalParentQuestionId) return true;

    const parentAnswer = answers[question.conditionalParentQuestionId];
    if (!parentAnswer) return false;

    return evaluateCondition(
      parentAnswer,
      question.conditionalOperator || "equals",
      question.conditionalExpectedValue || ""
    );
  }

  function evaluateDiscordRoleCondition(question: FormQuestion): boolean {
    if (!question.conditionalRoleIds || !userGuildMember) return true;

    const requiredRoleIds = question.conditionalRoleIds.split(",").filter(x => x);
    const userRoleIds = userGuildMember.roles || [];
    const logic = question.conditionalRoleLogic || "any";

    switch (logic) {
      case "any":
        return requiredRoleIds.some(roleId => userRoleIds.includes(roleId));
      case "all":
        return requiredRoleIds.every(roleId => userRoleIds.includes(roleId));
      case "none":
        return !requiredRoleIds.some(roleId => userRoleIds.includes(roleId));
      default:
        return true;
    }
  }

  function evaluateServerTenureCondition(question: FormQuestion): boolean {
    if (!userGuildMember) return true;

    const now = new Date();

    // Check days in server
    if (question.conditionalDaysInServer) {
      if (!userGuildMember.joined_at) return false;
      const joinDate = new Date(userGuildMember.joined_at);
      const daysInServer = (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysInServer < question.conditionalDaysInServer) return false;
    }

    // Check account age
    if (question.conditionalAccountAgeDays) {
      // Account created date is in the user snowflake ID
      const userId = BigInt(data.user.id);
      const timestamp = Number(userId >> 22n) + 1420070400000; // Discord epoch
      const accountCreated = new Date(timestamp);
      const accountAgeDays = (now.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24);
      if (accountAgeDays < question.conditionalAccountAgeDays) return false;
    }

    return true;
  }

  function evaluateBoostStatusCondition(question: FormQuestion): boolean {
    if (!userGuildMember) return true;

    // Check boost requirement
    if (question.conditionalRequiresBoost && !userGuildMember.premium_since) {
      return false;
    }

    // Check Nitro requirement using OAuth premium_type
    if (question.conditionalRequiresNitro) {
      const premiumType = (data.user as any).premium_type || 0;
      if (premiumType === 0) return false; // No Nitro
    }

    return true;
  }

  function evaluatePermissionCondition(question: FormQuestion): boolean {
    if (!question.conditionalPermissionFlags || !userGuildMember) return true;

    const userPerms = BigInt(userGuildMember.permissions || "0");
    const requiredPerms = BigInt(question.conditionalPermissionFlags);

    // Check if user has ALL required permissions
    return (userPerms & requiredPerms) === requiredPerms;
  }

  function evaluateMultipleConditions(question: FormQuestion): boolean {
    if (!question.conditions || question.conditions.length === 0) return true;

    // Group conditions by conditionGroup
    const groups: { [key: number]: typeof question.conditions } = {};
    question.conditions.forEach(cond => {
      if (!groups[cond.conditionGroup]) {
        groups[cond.conditionGroup] = [];
      }
      groups[cond.conditionGroup].push(cond);
    });

    // Evaluate each group (conditions within group are ANDed)
    const groupResults: boolean[] = [];

    for (const groupKey of Object.keys(groups)) {
      const groupConditions = groups[parseInt(groupKey)];
      let groupResult = true;

      for (const condition of groupConditions) {
        const conditionResult = evaluateSingleCondition(condition);

        if (condition.logicType.toUpperCase() === "AND") {
          groupResult = groupResult && conditionResult;
        } else {
          groupResult = groupResult || conditionResult;
        }

        // Early exit if AND fails
        if (!groupResult && condition.logicType.toUpperCase() === "AND") {
          break;
        }
      }

      groupResults.push(groupResult);
    }

    // Different groups are ORed together
    return groupResults.some(r => r);
  }

  function evaluateSingleCondition(condition: FormQuestionCondition): boolean {
    switch (condition.conditionType) {
      case 0: // QuestionBased
        if (!condition.targetQuestionId || !answers[condition.targetQuestionId]) {
          return false;
        }
        return evaluateCondition(
          answers[condition.targetQuestionId],
          condition.operator || "equals",
          condition.expectedValue || ""
        );

      case 1: // DiscordRole
        if (!condition.targetRoleIds || !userGuildMember) return true;
        const roleIds = condition.targetRoleIds.split(",").filter(x => x);
        const userRoles = userGuildMember.roles || [];
        // Default to "any" logic for individual conditions
        return roleIds.some(roleId => userRoles.includes(roleId));

      case 2: // ServerTenure
        if (!condition.daysThreshold || !userGuildMember) return true;
        const now = new Date();
        if (userGuildMember.joined_at) {
          const joinDate = new Date(userGuildMember.joined_at);
          const daysInServer = (now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysInServer >= condition.daysThreshold;
        }
        return false;

      case 3: // BoostStatus
        if (!userGuildMember) return true;
        if (condition.requiresBoost && !userGuildMember.premium_since) return false;
        if (condition.requiresNitro) {
          const premiumType = (data.user as any).premium_type || 0;
          if (premiumType === 0) return false;
        }
        return true;

      case 4: // Permission
        if (!condition.permissionFlags || !userGuildMember) return true;
        const userPerms = BigInt(userGuildMember.permissions || "0");
        const requiredPerms = BigInt(condition.permissionFlags);
        return (userPerms & requiredPerms) === requiredPerms;

      default:
        return true;
    }
  }

  function evaluateCondition(
    actualValue: string | string[],
    operator: string,
    expectedValue: string
  ): boolean {
    const actualStr = Array.isArray(actualValue) ? actualValue.join(",") : actualValue.toString();

    switch (operator.toLowerCase()) {
      case "equals":
        return actualStr.toLowerCase() === expectedValue.toLowerCase();
      case "not_equals":
        return actualStr.toLowerCase() !== expectedValue.toLowerCase();
      case "contains":
        return actualStr.toLowerCase().includes(expectedValue.toLowerCase());
      case "greater_than":
        return parseFloat(actualStr) > parseFloat(expectedValue);
      case "less_than":
        return parseFloat(actualStr) < parseFloat(expectedValue);
      default:
        return true;
    }
  }

  // Check if question is conditionally required
  function isQuestionConditionallyRequired(question: FormQuestion): boolean {
    if (!question.requiredWhenParentQuestionId) return false;

    const parentAnswer = answers[question.requiredWhenParentQuestionId];
    if (!parentAnswer) return false;

    return evaluateCondition(
      parentAnswer,
      question.requiredWhenOperator || "equals",
      question.requiredWhenValue || ""
    );
  }

  // Apply answer piping to question text
  function applyAnswerPiping(text: string): string {
    if (!text) return text;

    // Replace {{QX}} with actual answers
    return text?.replace(/\{\{Q(\d+)\}\}/g, (match, questionId) => {
      const qId = parseInt(questionId);
      const answer = answers[qId];

      if (!answer) return "[Not answered]";

      if (Array.isArray(answer)) {
        return answer.join(", ");
      }

      const answerStr = String(answer);
      return answerStr.length > 50 ? answerStr.slice(0, 47) + "..." : answerStr;
    });
  }

  function validateQuestion(question: FormQuestion): string | null {
    // A section break lays the form out, it does not ask anything.
    if (question.questionType === "section_break") return null;

    const answer = answers[question.id];

    // Check if required (base or conditional)
    const isRequired = question.isRequired || isQuestionConditionallyRequired(question);
    if (isRequired) {
      if (!answer || (typeof answer === "string" && !answer.trim())) {
        return "This question is required";
      }
      if (Array.isArray(answer) && answer.length === 0) {
        return "Please select at least one option";
      }
    }

    if (!answer) return null; // Not required and empty is OK

    // Check for Zalgo text in answers
    if (typeof answer === "string" && containsZalgo(answer)) {
      return "Answer contains invalid characters (excessive combining marks)";
    }

    // Validate based on type
    switch (question.questionType) {
      case "short_text":
      case "long_text":
        const textAnswer = answer as string;
        if (question.minLength && textAnswer.length < question.minLength) {
          return `Minimum length is ${question.minLength} characters`;
        }
        if (question.maxLength && textAnswer.length > question.maxLength) {
          return `Maximum length is ${question.maxLength} characters`;
        }
        break;

      case "number":
        const numAnswer = parseFloat(answer as string);
        if (isNaN(numAnswer)) {
          return "Please enter a valid number";
        }
        if (!isValidNumber(numAnswer, question.minValue, question.maxValue)) {
          if (question.minValue !== undefined && question.maxValue !== undefined) {
            return `Value must be between ${question.minValue} and ${question.maxValue}`;
          } else if (question.minValue !== undefined) {
            return `Value must be at least ${question.minValue}`;
          } else if (question.maxValue !== undefined) {
            return `Value must be at most ${question.maxValue}`;
          }
        }
        break;

      case "email":
        if (!isValidEmail(answer as string)) {
          return "Please enter a valid email address";
        }
        break;

      case "url":
        if (!isValidUrl(answer as string)) {
          return "Please enter a valid URL (must start with http:// or https://)";
        }
        break;
    }

    return null;
  }

  function validateAllQuestions(): boolean {
    validationErrors = {};
    let isValid = true;
    let firstErrorQuestionId: number | null = null;

    for (const question of visibleQuestions) {
      const errorMsg = validateQuestion(question);
      if (errorMsg) {
        validationErrors[question.id] = errorMsg;
        if (firstErrorQuestionId === null) {
          firstErrorQuestionId = question.id;
        }
        isValid = false;
      }
    }

    // Scroll to first error
    if (!isValid && firstErrorQuestionId !== null) {
      setTimeout(() => {
        const errorElement = document.querySelector(`[data-question-id="${firstErrorQuestionId}"]`);
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }

    return isValid;
  }

  // Clear validation error when user updates an answer
  function clearValidationError(questionId: number) {
    if (validationErrors[questionId]) {
      const { [questionId]: _, ...rest } = validationErrors;
      validationErrors = rest;
    }
  }

  async function loadForm() {
    try {
      loading = true;
      error = null;

      form = await formsApi.getForm(formId);
      questions = await formsApi.getFormQuestions(formId);

      // Loaded before the eligibility check, so even a refused form still says which server
      // turned the person away.
      try {
        const guild = await guildApi.getGuildInfo(form.guildId);
        guildName = guild?.name ?? null;
        guildIconUrl = guild?.iconUrl ?? null;
      } catch {
        // The form is still perfectly usable without the server's name on it.
      }

      // Load guild member data for Discord-based conditionals
      try {
        userGuildMember = await clientApi.getUser(form.guildId, data.user.id);
      } catch (err) {
        // Continue anyway - Discord conditionals will show by default
      }

      // Correcting an existing response is not a new submission, so the checks that stop somebody
      // submitting twice do not apply to it. Whether the response is still open to changes was
      // already settled by the status endpoint that sent them here.
      if (isEditing) {
        await loadAnswersForEditing();
        return;
      }

      // One eligibility call covers every form type. The server holds the whole policy, which is
      // what stops the page and the submit endpoint disagreeing about who may submit.
      if (!isPreviewMode) {
        try {
          const eligibilityCheck = await formsApi.checkEligibility(formId, data.user.id);
          if (!eligibilityCheck.isEligible) {
            error = eligibilityCheck.reason || "You are not eligible to submit this form";
            retryAt = eligibilityCheck.retryAt ? new Date(eligibilityCheck.retryAt) : null;
            // Clear the form so it's not displayed
            form = null;
            questions = [];
            return;
          }
        } catch (err) {
          error = "Failed to verify eligibility. Please try again later.";
          // Clear the form so it's not displayed
          form = null;
          questions = [];
          return;
        }
      }

      // Check admin permissions for preview mode
      if (isPreviewMode) {
        try {
          const userGuilds = await clientApi.getMutualGuilds(data.user.id, true); // adminOnly = true
          const guild = userGuilds?.find((g) => g.id.toString() === form!.guildId.toString());

          if (!guild) {
            error = "Preview mode is only available to server administrators";
            // Clear the form so it's not displayed
            form = null;
            questions = [];
            return;
          }
          isAdmin = true;
        } catch {
          error = "Failed to verify administrator permissions";
          // Clear the form so it's not displayed
          form = null;
          questions = [];
          return;
        }
      }

      // Whether the form is open, expired or full is part of the eligibility answer above, so it
      // is not re-derived here where the two could drift apart and contradict each other.

      if (!isPreviewMode) {
        await restoreDraft();
      }
    } catch (err: any) {
      // Check if it's a specific error message
      if (err?.message?.toLowerCase().includes("not found") || err?.status === 404) {
        error = "Form not found. It may have been deleted or the link may be incorrect.";
      } else {
        error = err instanceof Error ? err.message : "Failed to load form";
      }
      // Clear the form so nothing is displayed
      form = null;
      questions = [];
    } finally {
      loading = false;
    }
  }

  /** Fills the form with what the submitter already sent, so they correct it rather than retype it. */
  async function loadAnswersForEditing() {
    if (editingResponseId === null) return;

    try {
      const details = await formsApi.getResponseDetails(editingResponseId);

      const existing: Record<number, string | string[]> = {};
      for (const answer of details.answers ?? []) {
        existing[answer.questionId] =
          answer.answerValues && answer.answerValues.length > 0
            ? answer.answerValues
            : (answer.answerText ?? "");
      }

      answers = existing;
    } catch {
      error = "We could not load your answers. Try the link in your submission again.";
      form = null;
      questions = [];
    }
  }

  /**
   * Loads whatever the submitter had already typed, so a long form survives a closed tab. A draft
   * is never validated on the way in, because it is incomplete by definition.
   */
  async function restoreDraft() {
    try {
      const draft = await formsApi.getDraft(formId, data.user.id);
      if (!draft?.hasDraft || !draft.answers) return;

      const restored: Record<number, string | string[]> = {};
      for (const [questionId, value] of Object.entries(draft.answers)) {
        restored[parseInt(questionId)] = value;
      }

      answers = restored;
      currentPage = draft.page ?? 0;
      draftSavedAt = draft.updatedAt ? new Date(draft.updatedAt) : null;
      draftRestored = true;
    } catch {
      // A draft that cannot be read is not worth blocking the form over. The submitter simply
      // starts from an empty form, which is where they would have been anyway.
    }
  }

  /**
   * Saves the answers so far. Debounced, because this runs on every keystroke and the point is to
   * not lose work, not to write a row per character.
   */
  function scheduleDraftSave() {
    if (isPreviewMode || !form || !data.user) return;

    if (draftTimer) clearTimeout(draftTimer);
    draftTimer = setTimeout(saveDraft, 1500);
  }

  async function saveDraft() {
    if (isPreviewMode || !form || !data.user || savingDraft) return;

    savingDraft = true;

    try {
      const result = await formsApi.saveDraft(formId, data.user.id, answers, currentPage);
      draftSavedAt = new Date(result.savedAt);
    } catch {
      // A draft that fails to save is not worth interrupting somebody mid-sentence over. The next
      // keystroke schedules another attempt.
    } finally {
      savingDraft = false;
    }
  }

  /** Throws away the saved draft and empties the form, for when somebody wants to start over. */
  async function discardDraft() {
    if (draftTimer) clearTimeout(draftTimer);

    answers = {};
    validationErrors = {};
    currentPage = 0;
    draftRestored = false;
    draftSavedAt = null;

    try {
      await formsApi.deleteDraft(formId, data.user.id);
    } catch {
      // Nothing to do. The answers are already cleared on screen, which is what was asked for.
    }
  }

  /** Whether every answer on the current page is acceptable, checked before moving on. */
  function currentPageIsValid(): boolean {
    let valid = true;

    for (const question of pageQuestions) {
      const message = validateQuestion(question);

      if (message) {
        validationErrors[question.id] = message;
        valid = false;
      }
    }

    validationErrors = { ...validationErrors };

    return valid;
  }

  function goToNextPage() {
    // Catching an error here rather than at the end means somebody is told about a missed
    // question while it is still on screen.
    if (!currentPageIsValid()) {
      error = "Please fix the highlighted answers before continuing";
      return;
    }

    error = null;
    currentPage = Math.min(currentPage + 1, pages.length - 1);
    saveDraft();
    scrollToTop();
  }

  function goToPreviousPage() {
    error = null;
    currentPage = Math.max(currentPage - 1, 0);
    scrollToTop();
  }

  function scrollToTop() {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function proceedToConfirmation() {
    // Validate before showing confirmation
    if (!validateAllQuestions()) {
      const errorCount = Object.keys(validationErrors).length;
      error = `Please fix ${errorCount} error${errorCount > 1 ? "s" : ""} highlighted below`;
      return;
    }

    // The captcha lives on the review step below, so it is not checked here.
    showConfirmation = true;
    error = null;
    scrollToTop();
  }

  function backToEditing() {
    showConfirmation = false;
  }

  async function submitForm() {
    if (submitting) return;

    submitting = true;
    error = null;

    try {
      // Sanitize all answers
      const sanitizedAnswers: Record<number, string | string[]> = {};
      for (const [qId, answer] of Object.entries(answers)) {
        const questionId = parseInt(qId);
        if (Array.isArray(answer)) {
          sanitizedAnswers[questionId] = answer.map((a) => sanitizeAnswerText(String(a)));
        } else {
          sanitizedAnswers[questionId] = sanitizeAnswerText(String(answer));
        }
      }

      const request: FormSubmissionRequest = {
        userId: data.user.id,
        username: data.user.username,
        answers: sanitizedAnswers,
        turnstileToken,
        premiumType: (data.user as any).premium_type
      };

      if (isEditing) {
        await formsApi.editResponse(editingResponseId!, request);

        success = true;
        statusCheckToken = editToken ?? "";
        statusCheckUrl = editToken ? `/forms/status/${editToken}` : "";

        return;
      }

      const result = await formsApi.submitForm(formId, request);
      success = true;
      statusCheckToken = result.statusCheckToken;
      // Validate URL before using in href to prevent XSS
      const rawUrl = result.statusCheckUrl || `/forms/status/${result.statusCheckToken}`;
      const validatedUrl = sanitizeUrlPath(rawUrl);
      if (!validatedUrl) {
        throw new Error("Invalid status check URL received from server");
      }

      statusCheckUrl = validatedUrl;

      if (draftTimer) clearTimeout(draftTimer);
    } catch (err: any) {
      // The server checks every answer again on arrival, and reports what failed per question, so
      // the page marks the answers that need fixing where they sit rather than showing one
      // message at the foot of a long form.
      const serverErrors = err?.body?.errors ?? err?.errors;

      if (serverErrors && typeof serverErrors === "object") {
        const mapped: Record<number, string> = {};
        for (const [questionId, message] of Object.entries(serverErrors)) {
          mapped[parseInt(questionId)] = String(message);
        }

        validationErrors = mapped;
        showConfirmation = false;

        // Send them back to the first page that actually has a problem on it.
        const firstBadPage = pages.findIndex((p) =>
          p.questions.some((q) => mapped[q.id])
        );
        if (firstBadPage >= 0) currentPage = firstBadPage;

        error = "Some answers need fixing before this can be submitted";
      } else {
        error = err instanceof Error ? err.message : "Failed to submit form";
      }

      success = false;
    } finally {
      submitting = false;
    }
  }

  function onTurnstileSuccess(event: CustomEvent<{ token: string }>) {
    turnstileToken = event.detail.token;
    turnstileExpired = false;
  }

  /**
   * A Turnstile token is short lived, and the server rejects an expired one. Clearing it here
   * re-locks the submit button rather than letting somebody press it and be refused.
   */
  function onTurnstileExpired() {
    turnstileToken = undefined;
    turnstileExpired = true;
  }

  // Handle text input with Zalgo cleaning
  function handleAnswerInput(e: Event, questionId: number) {
    const input = e.currentTarget as HTMLInputElement | HTMLTextAreaElement;
    const cleaned = removeZalgoText(input.value, 2);

    if (cleaned !== input.value) {
      // Zalgo detected and removed
      input.value = cleaned;
      answers[questionId] = cleaned;
      error = "Excessive combining characters were removed from your answer";
      // Clear error after 3 seconds
      setTimeout(() => {
        if (error === "Excessive combining characters were removed from your answer") {
          error = null;
        }
      }, 3000);
    } else {
      answers[questionId] = input.value;
    }

    // Clear validation error when user types
    clearValidationError(questionId);
  }

  onMount(async () => {
    const shareCode = $page.params.formId;

    // First, get all instances to find which one has this share code
    let instances: any[] = [];
    try {
      instances = await instanceManagementApi.getBotInstances();
    } catch (err) {
      error = "Failed to load bot instances. Please try again later.";
      loading = false;
      return;
    }

    // Try to resolve the share code on each instance WITHOUT changing the global instance
    let resolved: any = null;
    let targetInstance: any = null;

    for (const instance of instances) {
      try {
        // Make a direct API call with specific instance headers instead of changing the global store
        const response = await fetch(`/api/forms/share/${shareCode}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "X-Instance-Port": instance.port.toString()
          }
        });

        const responseText = await response.text();
        let resolveResult: any;
        try {
          resolveResult = JSON.parse(responseText);
        } catch {
          // Invalid response, try next instance
          continue;
        }

        // Check if the result is actually valid (not an error response)
        if (response.ok && resolveResult && !resolveResult.error && resolveResult.formId) {
          resolved = resolveResult;
          targetInstance = instance;
          break; // Found it, stop searching
        } else {
          // Got a response but it's an error, try next instance

        }
      } catch (err: any) {
        // This instance doesn't have the share code, try next one

      }
    }

    if (!resolved || !targetInstance) {
      error = "This form link is invalid or has expired. Please request a new link from the server administrator.";
      loading = false;
      // Clear the instance since we didn't find the form
      currentInstance.set(null);
      return;
    }

    formId = resolved.formId;

    // NOW set the correct instance only once, after we've found it
    currentInstance.set(targetInstance);

    if (!data.user) {
      showLoginPrompt = true;
      loading = false;
      return;
    }

    isPreviewMode = $page.url.searchParams.get("preview") === "true";

    // A status link can send somebody back here to correct an answer. The token proves which
    // response is theirs, and the server checks ownership again when the edit arrives.
    const requestedEdit = $page.url.searchParams.get("edit");
    if (requestedEdit) {
      try {
        const status = await formsApi.getResponseStatus(requestedEdit);

        if (status.canEdit && status.responseId) {
          editToken = requestedEdit;
          editingResponseId = status.responseId;
        } else {
          error = status.editReason ?? "This response can no longer be changed";
          loading = false;
          return;
        }
      } catch {
        error = "That edit link is not valid any more";
        loading = false;
        return;
      }
    }

    await loadForm();
  });

  onMount(() => {
    // Keeps the "you can try again in..." line honest while somebody sits on the page.
    const tick = setInterval(() => (now = new Date()), 30_000);

    return () => {
      clearInterval(tick);
      if (draftTimer) clearTimeout(draftTimer);
    };
  });
</script>

<svelte:head>
  <title>{form?.name || "Form"} - Mewdeko</title>
  <meta content={metaDescription} name="description" />

  <!-- These forms get shared by pasting the link into Discord, so the unfurl is most of the first
       impression: whose server is asking, what for, and whether it is anonymous. -->
  <meta content={form?.name || "Form"} property="og:title" />
  <meta content={metaDescription} property="og:description" />
  <meta content="website" property="og:type" />
  {#if guildIconUrl}
    <meta content={guildIconUrl} property="og:image" />
  {/if}
  <meta content="summary" name="twitter:card" />
  <meta content={form?.name || "Form"} name="twitter:title" />
  <meta content={metaDescription} name="twitter:description" />
  {#if guildIconUrl}
    <meta content={guildIconUrl} name="twitter:image" />
  {/if}
  <meta content={$colorStore.primary} name="theme-color" />
</svelte:head>

<main
  class="min-h-screen py-8 px-4"
  style="background: linear-gradient(135deg, {$colorStore.primary}08 0%, {$colorStore.secondary}05 100%);"
>
  <div class="container mx-auto max-w-3xl">
    {#if showLoginPrompt}
      <div
        class=" rounded-xl border p-8 text-center"
        style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
        in:fly={{ y: 20, duration: 300 }}
      >
        <div
          class="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
          style="background: linear-gradient(135deg, {$colorStore.primary}30, {$colorStore.secondary}40);"
        >
          <i class="fa-brands fa-discord" style="color: {$colorStore.primary}; font-size: 40px;"></i>
        </div>

        <h1 class="text-3xl font-bold mb-4" style="color: {$colorStore.text};">
          Login Required
        </h1>

        <p class="text-lg mb-6" style="color: {$colorStore.muted};">
          You need to login with Discord to access this form
        </p>

        <div
          class="mb-6 p-4 rounded-lg text-left"
          style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}20;"
        >
          <div class="font-semibold mb-3" style="color: {$colorStore.text};">
            <i class="fa-solid fa-shield-check mr-2" style="color: {$colorStore.primary};"></i>
            Why login is required:
          </div>
          <ul class="space-y-2 text-sm" style="color: {$colorStore.muted};">
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-check flex-shrink-0 mt-1" style="color: {$colorStore.primary};"></i>
              <span>Verify you're a member of the server</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-check flex-shrink-0 mt-1" style="color: {$colorStore.primary};"></i>
              <span>Prevent spam and abuse</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-check flex-shrink-0 mt-1" style="color: {$colorStore.primary};"></i>
              <span>Ensure only authorized members can access this form</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-check flex-shrink-0 mt-1" style="color: {$colorStore.primary};"></i>
              <span>Protect potentially sensitive information</span>
            </li>
          </ul>
        </div>

        <button
          onclick={() => goto(`/api/discord/login?redirect_to=${encodeURIComponent($page.url.pathname)}`)}
          class="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] shadow-lg border"
          style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}10); color: {$colorStore.text}; border-color: {$colorStore.primary}30; box-shadow: 0 4px 20px {$colorStore.primary}10;"
        >
          <i class="fa-brands fa-discord mr-2"></i>
          Login with Discord
        </button>

        <p class="mt-6 text-sm" style="color: {$colorStore.muted};">
          You'll be redirected back to this form after logging in
        </p>
      </div>
    {:else if loading}
      <div
        class=" rounded-xl border p-12 text-center"
        style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
        in:fade
      >
        <div
          class="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
          style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"
        ></div>
        <p style="color: {$colorStore.muted};">Loading form...</p>
      </div>
    {:else if error && !form}
      <!-- Only show full error page for critical errors (when form failed to load) -->
      <div
        class=" rounded-xl border p-8 text-center"
        style="background: #ef444410; border-color: #ef444430;"
        in:fly={{ y: 20, duration: 300 }}
      >
        <div class="flex justify-center mb-4">
          <i class="fa-solid fa-triangle-exclamation" style="color: #ef4444; font-size: 48px;"></i>
        </div>
        <h2 class="text-2xl font-bold mb-4" style="color: #ef4444;">Error</h2>
        <p class="text-lg" style="color: {$colorStore.text};">{error}</p>

        <!-- Some refusals lift on their own. Saying when beats leaving somebody to keep checking. -->
        {#if retryCountdown}
          <div
            class="mt-6 inline-flex items-center gap-2 px-4 py-3 rounded-xl"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30;"
          >
            <i class="fa-solid fa-hourglass-half" style="color: {$colorStore.primary};"></i>
            <span style="color: {$colorStore.text};">
              You can try again in about {retryCountdown}
            </span>
          </div>
          {#if retryAt}
            <p class="text-sm mt-2" style="color: {$colorStore.muted};">
              {retryAt.toLocaleString()}
            </p>
          {/if}
        {/if}
      </div>
    {:else if success}
      <div class="space-y-6">
        <div
          class=" rounded-xl border p-8 text-center"
          style="background: #10B98110; border-color: #10B98130;"
          in:fly={{ y: 20, duration: 300 }}
        >
          <div class="flex justify-center mb-4">
            <i class="fa-solid fa-check-circle" style="color: #10B981; font-size: 48px;"></i>
          </div>
          <h2 class="text-2xl font-bold mb-4" style="color: #10B981;">
            {isEditing ? "Answers updated" : "Success!"}
          </h2>
          <p class="text-lg mb-6" style="color: {$colorStore.text};">
            {#if isEditing}
              Your changes have been saved and the reviewers can see them.
            {:else if form?.successMessage}
              {(form.successMessage)}
            {:else if form?.formType === 1}
              Your ban appeal has been submitted and is now pending review.
            {:else if form?.formType === 2}
              Your join application has been submitted and is now pending review.
            {:else}
              Your response has been submitted successfully.
            {/if}
          </p>

          {#if form?.formType !== 0}
            <div
              class="mb-6 p-4 rounded-lg text-left"
              style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30;"
            >
              <div class="font-semibold mb-2" style="color: {$colorStore.text};">
                <i class="fa-solid fa-info-circle mr-2" style="color: {$colorStore.primary};"></i>
                What happens next?
              </div>
              <ul class="space-y-2 text-sm" style="color: {$colorStore.muted};">
                {#if form?.formType === 1}
                  <li class="flex items-start gap-2">
                    <i class="fa-solid fa-check flex-shrink-0 mt-1" style="color: {$colorStore.primary};"></i>
                    <span>Your appeal will be reviewed by the moderation team</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <i class="fa-solid fa-check flex-shrink-0 mt-1" style="color: {$colorStore.primary};"></i>
                    <span>If approved, you will be automatically unbanned</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <i class="fa-solid fa-check flex-shrink-0 mt-1" style="color: {$colorStore.primary};"></i>
                    <span>Check your status on the page linked below</span>
                  </li>
                {:else if form?.formType === 2}
                  <li class="flex items-start gap-2">
                    <i class="fa-solid fa-check flex-shrink-0 mt-1" style="color: {$colorStore.primary};"></i>
                    <span>Your application will be reviewed by the moderation team</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <i class="fa-solid fa-check flex-shrink-0 mt-1" style="color: {$colorStore.primary};"></i>
                    <span>If approved, you'll receive an invite link to join the server</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <i class="fa-solid fa-check flex-shrink-0 mt-1" style="color: {$colorStore.primary};"></i>
                    <span>Your assigned roles will be applied automatically when you join</span>
                  </li>
                {/if}
              </ul>
            </div>

            <!-- Status Check Link -->
            <div
              class="mb-6 p-4 rounded-lg"
              style="background: {$colorStore.primary}15; border: 2px dashed {$colorStore.primary}50;"
            >
              <div class="font-semibold mb-2" style="color: {$colorStore.text};">
                <i class="fa-solid fa-bookmark mr-2" style="color: {$colorStore.primary};"></i>
                Check Your Status
              </div>
              <p class="text-sm mb-3" style="color: {$colorStore.muted};">
                Bookmark this link to check your submission status at any time:
              </p>
              <a
                href={statusCheckUrl}
                class="block p-3 rounded-lg font-mono text-sm text-center mb-3 transition-all hover:scale-[1.02]"
                style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.primary}; text-decoration: none;"
              >
                {window.location.origin}{statusCheckUrl}
              </a>
              <button
                onclick={() => navigator.clipboard.writeText(window.location.origin + statusCheckUrl)}
                class="w-full py-2 rounded-lg font-medium transition-all hover:scale-[1.02]"
                style="background: {$colorStore.primary}20; color: {$colorStore.text};"
              >
                <i class="fa-solid fa-copy mr-2"></i>
                Copy Link
              </button>
            </div>
          {/if}

          <button
            onclick={() => goto("/dashboard")}
            class="px-6 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
            style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    {:else if form}
      <div class="space-y-6">
        <!-- Preview Mode Banner -->
        {#if isPreviewMode}
          <div
            class=" rounded-xl border p-4"
            style="background: #f59e0b20; border-color: #f59e0b;"
            in:slide
          >
            <div class="flex items-center justify-center gap-3">
              <i class="fa-solid fa-eye" style="color: #f59e0b; font-size: 20px;"></i>
              <div>
                <div class="font-bold" style="color: #f59e0b;">Preview Mode</div>
                <div class="text-sm" style="color: {$colorStore.muted};">
                  You're previewing this form. Submissions are disabled.
                </div>
              </div>
            </div>
          </div>
        {/if}

        <!-- Ban Appeal / Join Application Info Banner -->
        {#if form.formType === 1 && !isPreviewMode}
          <div
            class=" rounded-xl border p-6"
            style="background: #ef444410; border-color: #ef444430;"
            in:slide
          >
            <div class="flex items-start gap-4">
              <div
                class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style="background: #ef444420;"
              >
                <i class="fa-solid fa-gavel" style="color: #ef4444; font-size: 24px;"></i>
              </div>
              <div>
                <h3 class="font-bold text-lg mb-2" style="color: #ef4444;">
                  Ban Appeal Form
                </h3>
                <p class="text-sm mb-3" style="color: {$colorStore.text};">
                  This is a ban appeal form. Your submission will be reviewed by the moderation team. If approved,
                  you will be automatically unbanned from the server.
                </p>
                <p class="text-xs" style="color: {$colorStore.muted};">
                  Please be honest and provide as much detail as possible in your responses.
                </p>
              </div>
            </div>
          </div>
        {:else if form.formType === 2 && !isPreviewMode}
          <div
            class=" rounded-xl border p-6"
            style="background: #3b82f610; border-color: #3b82f630;"
            in:slide
          >
            <div class="flex items-start gap-4">
              <div
                class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style="background: #3b82f620;"
              >
                <i class="fa-solid fa-user-plus" style="color: #3b82f6; font-size: 24px;"></i>
              </div>
              <div>
                <h3 class="font-bold text-lg mb-2" style="color: #3b82f6;">
                  Join Application Form
                </h3>
                <p class="text-sm mb-3" style="color: {$colorStore.text};">
                  This is a join application form. Your submission will be reviewed by the moderation team. If approved,
                  you'll receive an invite link to join the server with pre-assigned roles.
                </p>
                <p class="text-xs" style="color: {$colorStore.muted};">
                  Please provide accurate information to help us process your application.
                </p>
              </div>
            </div>
          </div>
        {/if}

        <!-- Anonymous Mode Privacy Notice -->
        {#if form.allowAnonymous && !isPreviewMode}
          <div
            class=" rounded-xl border p-6"
            style="background: #8b5cf610; border-color: #8b5cf630;"
            in:slide
          >
            <div class="flex items-start gap-4">
              <div
                class="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                style="background: #8b5cf620;"
              >
                <i class="fa-solid fa-user-secret" style="color: #8b5cf6; font-size: 24px;"></i>
              </div>
              <div>
                <h3 class="font-bold text-lg mb-2" style="color: #8b5cf6;">
                  Anonymous Submission
                </h3>
                <p class="text-sm mb-3" style="color: {$colorStore.text};">
                  This form accepts <strong>anonymous submissions</strong>. Your Discord login is required to verify
                  guild membership and prevent spam, but your identity <strong>will not be stored</strong>.
                </p>
                <div
                  class="p-3 rounded-lg text-sm"
                  style="background: {$colorStore.primary}10; border-left: 3px solid #8b5cf6;"
                >
                  <div class="font-semibold mb-2" style="color: {$colorStore.text};">What we collect:</div>
                  <ul class="space-y-1 text-xs" style="color: {$colorStore.muted};">
                    <li>✓ Your answers to form questions</li>
                    <li>✓ Submission timestamp</li>
                  </ul>
                  <div class="font-semibold mt-3 mb-2" style="color: {$colorStore.text};">What we DON'T collect:</div>
                  <ul class="space-y-1 text-xs" style="color: {$colorStore.muted};">
                    <li>✗ Your username</li>
                    <li>✗ Your user ID</li>
                    <li>✗ Your IP address</li>
                  </ul>
                  <p class="mt-3 text-xs italic" style="color: {$colorStore.muted};">
                    Your Discord login is used only for verification and is not saved with your submission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        {/if}

        <!-- Form Header -->
        <div
          class=" rounded-xl border p-8 text-center"
          style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
          in:fade
        >
          <!-- The server's own icon rather than a generic clipboard, because a public form link
               arrives with no context and whose form this is comes first. -->
          {#if guildIconUrl}
            <img
              src={guildIconUrl}
              alt=""
              class="w-16 h-16 mx-auto mb-4 rounded-full"
              style="border: 1px solid {$colorStore.primary}30;"
            />
          {:else}
            <div
              class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style="background: linear-gradient(135deg, {$colorStore.primary}30, {$colorStore.secondary}40);"
            >
              <i class="fa-solid fa-clipboard-list" style="color: {$colorStore.primary}; font-size: 32px;"></i>
            </div>
          {/if}
          <h1 class="text-3xl font-bold mb-1" style="color: {$colorStore.text};">
            {form.name}
          </h1>
          {#if guildName}
            <p class="text-sm mb-3" style="color: {$colorStore.muted};">{guildName}</p>
          {/if}
          {#if form.description}
            <p class="text-lg" style="color: {$colorStore.muted};">
              {form.description}
            </p>
          {/if}
          <div class="mt-4 flex items-center justify-center gap-4 flex-wrap">
            <span class="text-sm" style="color: {$colorStore.muted};">
              <i class="fa-solid fa-user mr-1"></i>
              {data.user.username}
            </span>
            {#if form.maxResponses}
              <span class="text-sm" style="color: {$colorStore.muted};">
                <i class="fa-solid fa-chart-bar mr-1"></i>
                {form.responseCount || 0} / {form.maxResponses} responses
              </span>
            {/if}
            {#if form.expiresAt}
              {@const timeRemaining = new Date(form.expiresAt).getTime() - Date.now()}
              {@const isExpired = timeRemaining <= 0}
              <span
                class="text-sm px-3 py-1 rounded-full"
                style="background: {isExpired ? '#ef444420' : '#10B98120'}; color: {isExpired ? '#ef4444' : '#10B981'};"
              >
                <i class="fa-solid fa-clock mr-1"></i>
                {#if isExpired}
                  Expired
                {:else if timeRemaining < 3600000}
                  Expires in {Math.floor(timeRemaining / 60000)}m
                {:else if timeRemaining < 86400000}
                  Expires in {Math.floor(timeRemaining / 3600000)}h
                {:else}
                  Expires {new Date(form.expiresAt).toLocaleDateString()}
                {/if}
              </span>
            {/if}
          </div>
        </div>

        <!-- Editing an already submitted response -->
        {#if isEditing}
          <div
            class="rounded-xl border p-4"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}40;"
            in:slide
          >
            <div class="flex items-center gap-3">
              <i class="fa-solid fa-pen" style="color: {$colorStore.primary};"></i>
              <div>
                <div class="font-semibold" style="color: {$colorStore.text};">
                  You are changing a response you already sent
                </div>
                <div class="text-sm" style="color: {$colorStore.muted};">
                  The reviewers keep a copy of what you wrote before, so they can see what changed.
                </div>
              </div>
            </div>
          </div>
        {/if}

        <!-- Resumed draft notice -->
        {#if draftRestored && !isPreviewMode && !isEditing && !showConfirmation}
          <div
            class="rounded-xl border p-4 flex items-center justify-between gap-4 flex-wrap"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}40;"
            in:slide
          >
            <div class="flex items-center gap-3">
              <i class="fa-solid fa-clock-rotate-left" style="color: {$colorStore.primary};"></i>
              <div>
                <div class="font-semibold" style="color: {$colorStore.text};">
                  We brought back what you had already written
                </div>
                {#if draftSavedAt}
                  <div class="text-sm" style="color: {$colorStore.muted};">
                    Saved {draftSavedAt.toLocaleString()}
                  </div>
                {/if}
              </div>
            </div>
            <button
              type="button"
              onclick={discardDraft}
              class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              style="background: {$colorStore.primary}15; color: {$colorStore.text};"
            >
              Start over
            </button>
          </div>
        {/if}

        <!-- Paging happens without a navigation, so the change is announced here. The visible
             copy below repeats it and is hidden from the accessibility tree, so it is not read
             out twice. -->
        {#if isPaginated && !showConfirmation}
          <p class="sr-only" role="status" aria-live="polite">
            {pageAnnouncement}
          </p>
        {/if}

        <!-- Progress Indicator -->
        {#if answerableQuestions.length > 1 && !isPreviewMode}
          <div
            class=" rounded-xl border p-4"
            style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
            in:slide
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-list-check" style="color: {$colorStore.primary};"></i>
                <span
                  class="font-semibold"
                  style="color: {$colorStore.text};"
                  aria-hidden={isPaginated ? "true" : undefined}
                >
                  {#if isPaginated}
                    Page {currentPage + 1} of {pages.length}, {answeredQuestions.length} of {answerableQuestions.length} answered
                  {:else}
                    Progress: {answeredQuestions.length} of {answerableQuestions.length} questions
                  {/if}
                </span>
              </div>
              <span class="font-bold" style="color: {$colorStore.primary};">
                {progressPercentage}%
              </span>
            </div>
            <div
              class="w-full h-2 rounded-full overflow-hidden"
              style="background: {$colorStore.primary}15;"
            >
              <div
                class="h-full transition-all duration-500 ease-out"
                style="background: linear-gradient(to right, {$colorStore.primary}, {$colorStore.secondary}); width: {progressPercentage}%;"
              ></div>
            </div>
          </div>
        {/if}

        <!-- Confirmation Screen -->
        {#if showConfirmation}
          <div
            class=" rounded-xl border p-6"
            style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
            in:slide
          >
            <h2 class="text-2xl font-bold mb-4" style="color: {$colorStore.text};">
              <i class="fa-solid fa-clipboard-check mr-2" style="color: {$colorStore.primary};"></i>
              Review Your Answers
            </h2>
            <p class="mb-6" style="color: {$colorStore.muted};">
              Please review your responses before submitting. Click "Edit" to make changes.
            </p>

            <div class="space-y-4 mb-6">
              {#each answerableQuestions as question}
                {#if answers[question.id]}
                  <div
                    class="p-4 rounded-lg"
                    style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20;"
                  >
                    <div class="font-semibold mb-2" style="color: {$colorStore.text};">
                      {renderFormTextPlain(question.enableAnswerPiping ? applyAnswerPiping(question.questionText) : question.questionText)}
                    </div>
                    <div
                      class="p-3 rounded"
                      style="background: {$colorStore.primary}05; color: {$colorStore.text};"
                    >
                      {#if Array.isArray(answers[question.id])}
                        <ul class="list-disc list-inside space-y-1">
                          {#each answers[question.id] as value}
                            <li>{(value)}</li>
                          {/each}
                        </ul>
                      {:else}
                        <div class="whitespace-pre-wrap">
                          {(String(answers[question.id] || ""))}
                        </div>
                      {/if}
                    </div>
                  </div>
                {/if}
              {/each}
            </div>

            <!-- The challenge is only rendered once the review step is reached, so nobody verifies
                 themselves and then discovers more pages of questions. The token expires, so the
                 submit button locks again when it does. -->
            {#if form.requireCaptcha && !isEditing}
              <div
                class="rounded-xl border p-6 mb-6"
                style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
                in:slide
              >
                <p class="text-sm mb-4 text-center" style="color: {$colorStore.muted};">
                  {turnstileExpired
                    ? "That verification timed out, please complete it again"
                    : "Please complete the verification below"}
                </p>
                <div class="flex justify-center">
                  <Turnstile
                    siteKey="0x4AAAAAAAAvvAPaJgbIJWh-"
                    theme="auto"
                    on:callback={onTurnstileSuccess}
                    on:expired={onTurnstileExpired}
                    on:error={onTurnstileExpired}
                    on:timeout={onTurnstileExpired}
                  />
                </div>
              </div>
            {/if}

            <div class="flex gap-4">
              <button
                onclick={backToEditing}
                class="flex-1 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
              >
                <i class="fa-solid fa-arrow-left mr-2"></i>
                Edit Answers
              </button>
              <button
                onclick={submitForm}
                disabled={submitting || (form.requireCaptcha && !turnstileToken)}
                class="flex-1 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] disabled:opacity-50 border"
                style="background: linear-gradient(135deg, {$colorStore.secondary}15, {$colorStore.primary}10); color: {$colorStore.text}; border-color: {$colorStore.secondary}30; box-shadow: 0 4px 20px {$colorStore.secondary}10;"
              >
                {#if submitting}
                  <i class="fa-solid fa-spinner fa-spin mr-2"></i>
                  Submitting...
                {:else}
                  <i class="fa-solid fa-check mr-2"></i>
                  Confirm & Submit
                {/if}
              </button>
            </div>
          </div>
        {:else}
          <!-- Questions -->
          <form onsubmit={(e) => { e.preventDefault(); proceedToConfirmation(); }}>
            <!-- Error Banners -->
            {#if error}
              <div
                class=" rounded-xl border p-4 mb-4"
                style="background: #ef444410; border-color: #ef4444;"
                in:slide
              >
                <div class="flex items-center gap-3">
                  <i class="fa-solid fa-exclamation-triangle flex-shrink-0"
                     style="color: #ef4444; font-size: 20px;"></i>
                  <div>
                    <div class="font-semibold" style="color: #ef4444;">{error}</div>
                    {#if Object.keys(validationErrors).length > 0}
                      <div class="text-sm mt-1" style="color: {$colorStore.muted};">
                        Questions with errors are highlighted in red. Scroll down to see them.
                      </div>
                    {/if}
                  </div>
                </div>
              </div>
            {/if}

            {#if pageHeading}
              <div class="mb-6 pb-4 border-b" style="border-color: {$colorStore.primary}25;">
                <h2 class="text-xl font-bold mb-1" style="color: {$colorStore.text};">
                  {renderFormTextPlain(pageHeading.questionText)}
                </h2>
                {#if pageHeading.placeholder}
                  <div class="form-prose text-sm" style="color: {$colorStore.muted};">
                    {@html renderFormText(pageHeading.placeholder)}
                  </div>
                {/if}
              </div>
            {/if}

            <div class="space-y-4">
              {#each pageQuestions as question, index (question.id)}
                <div
                  data-question-id={question.id}
                  class=" rounded-xl p-6 transition-all"
                  style="background: {validationErrors[question.id] ? '#ef444408' : $colorStore.primary + '05'};
                         border: {validationErrors[question.id] ? '2px' : '1px'} solid {validationErrors[question.id] ? '#ef4444' : $colorStore.primary + '30'};"
                  in:slide={{ duration: 300, delay: index * 50 }}
                >
                  <label class="block mb-3">
                    <div class="flex items-start gap-2 mb-3">
                    <span
                      class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                    >
                      {visibleQuestions.filter((q) => q.questionType !== "section_break").indexOf(question) + 1}
                    </span>
                      <div class="flex-1">
                        <!-- Rendered Markdown produces block elements, so this is a div rather
                             than a span. -->
                        <div class="form-prose font-semibold inline-block" style="color: {$colorStore.text};">
                          {#if question.enableAnswerPiping}
                            {@html renderFormText(applyAnswerPiping(question.questionText))}
                          {:else}
                            {@html renderFormText(question.questionText)}
                          {/if}
                        </div>
                        {#if question.isRequired || isQuestionConditionallyRequired(question)}
                          <span style="color: #ef4444;"> *</span>
                        {/if}
                      </div>
                    </div>

                    {#if question.imageUrl && isSafeUrl(question.imageUrl)}
                      <img
                        src={question.imageUrl}
                        alt=""
                        loading="lazy"
                        class="mb-3 rounded-lg max-h-64 w-auto"
                        style="border: 1px solid {$colorStore.primary}20;"
                      />
                    {/if}

                    <!-- Question Input Based on Type -->
                    {#if question.questionType === "short_text"}
                      <input
                        type="text"
                        value={answers[question.id] || ""}
                        oninput={(e) => handleAnswerInput(e, question.id)}
                        placeholder={question.enableAnswerPiping && question.placeholder ? applyAnswerPiping(question.placeholder) : (question.placeholder || "Type your answer...")}
                        class="w-full p-3 rounded-lg"
                        style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                        minlength={question.minLength}
                        maxlength={question.maxLength}
                      />
                    {:else if question.questionType === "long_text"}
                    <textarea
                      value={answers[question.id] || ""}
                      oninput={(e) => handleAnswerInput(e, question.id)}
                      placeholder={question.enableAnswerPiping && question.placeholder ? applyAnswerPiping(question.placeholder) : (question.placeholder || "Type your answer...")}
                      rows="4"
                      class="w-full p-3 rounded-lg resize-none"
                      style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                      minlength={question.minLength}
                      maxlength={question.maxLength}
                    ></textarea>
                    {:else if question.questionType === "number"}
                      <input
                        type="number"
                        bind:value={answers[question.id]}
                        oninput={() => clearValidationError(question.id)}
                        placeholder={question.enableAnswerPiping && question.placeholder ? applyAnswerPiping(question.placeholder) : (question.placeholder || "Enter a number...")}
                        class="w-full p-3 rounded-lg"
                        style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                        min={question.minValue}
                        max={question.maxValue}
                      />
                    {:else if question.questionType === "email"}
                      <input
                        type="email"
                        value={answers[question.id] || ""}
                        oninput={(e) => handleAnswerInput(e, question.id)}
                        placeholder={question.enableAnswerPiping && question.placeholder ? applyAnswerPiping(question.placeholder) : (question.placeholder || "your.email@example.com")}
                        class="w-full p-3 rounded-lg"
                        style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                      />
                    {:else if question.questionType === "url"}
                      <input
                        type="url"
                        value={answers[question.id] || ""}
                        oninput={(e) => handleAnswerInput(e, question.id)}
                        placeholder={question.enableAnswerPiping && question.placeholder ? applyAnswerPiping(question.placeholder) : (question.placeholder || "https://example.com")}
                        class="w-full p-3 rounded-lg"
                        style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                      />
                    {:else if question.questionType === "multiple_choice"}
                      <div class="space-y-2">
                        {#if question.options}
                          {#each question.options as option}
                            <label
                              class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.01]"
                              style="background: {$colorStore.primary}08; border: 1px solid {answers[question.id] === option.optionValue ? $colorStore.primary : 'transparent'};"
                            >
                              <input
                                type="radio"
                                name="question-{question.id}"
                                value={option.optionValue}
                                bind:group={answers[question.id]}
                                onchange={() => clearValidationError(question.id)}
                                class="w-4 h-4"
                                style="accent-color: {$colorStore.primary};"
                              />
                              <span style="color: {$colorStore.text};">{(option.optionText)}</span>
                            </label>
                          {/each}
                        {/if}
                      </div>
                    {:else if question.questionType === "checkboxes"}
                      <div class="space-y-2">
                        {#if question.options}
                          {#each question.options as option}
                            {@const checkboxAnswers = Array.isArray(answers[question.id]) ? answers[question.id] : []}
                            <label
                              class="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.01]"
                              style="background: {$colorStore.primary}08; border: 1px solid {checkboxAnswers.includes(option.optionValue) ? $colorStore.primary : 'transparent'};"
                            >
                              <input
                                type="checkbox"
                                value={option.optionValue}
                                checked={checkboxAnswers.includes(option.optionValue)}
                                onchange={(e) => {
                                const checked = e.currentTarget.checked;
                                const current = Array.isArray(answers[question.id]) ? answers[question.id] : [];
                                if (checked) {
                                  answers[question.id] = [...current, option.optionValue];
                                } else {
                                  answers[question.id] = (Array.isArray(current) ? current : []).filter((v) => v !== option.optionValue);
                                }
                                clearValidationError(question.id);
                              }}
                                class="w-4 h-4 rounded"
                                style="accent-color: {$colorStore.primary};"
                              />
                              <span style="color: {$colorStore.text};">{(option.optionText)}</span>
                            </label>
                          {/each}
                        {/if}
                      </div>
                    {:else if question.questionType === "dropdown"}
                      <select
                        bind:value={answers[question.id]}
                        onchange={() => clearValidationError(question.id)}
                        class="w-full p-3 rounded-lg"
                        style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                      >
                        <option value="">Select an option...</option>
                        {#if question.options}
                          {#each question.options as option}
                            <option value={option.optionValue}>{option.optionText}</option>
                          {/each}
                        {/if}
                      </select>
                    {/if}
                  </label>

                  <!-- Validation Error -->
                  {#if validationErrors[question.id]}
                    <div
                      class="mt-2 p-2 rounded-lg flex items-center gap-2"
                      style="background: #ef444410; border: 1px solid #ef444430;"
                      transition:slide
                    >
                      <i class="fa-solid fa-exclamation-circle flex-shrink-0"
                         style="color: #ef4444; font-size: 14px;"></i>
                      <span class="text-sm" style="color: #ef4444;">
                      {validationErrors[question.id]}
                    </span>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>

            <!-- Page navigation. The captcha and the submit button only appear on the last page,
                 so nobody verifies themselves and then discovers three more pages of questions. -->
            {#if isPaginated && !isLastPage}
              <div class="mt-6 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onclick={goToPreviousPage}
                  disabled={currentPage === 0}
                  class="px-5 py-3 rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                >
                  <i class="fa-solid fa-arrow-left mr-2"></i>
                  Back
                </button>

                {#if savingDraft}
                  <span class="text-sm" style="color: {$colorStore.muted};">
                    <i class="fa-solid fa-cloud-arrow-up mr-1"></i>
                    Saving
                  </span>
                {:else if draftSavedAt && !isPreviewMode}
                  <span class="text-sm" style="color: {$colorStore.muted};">
                    <i class="fa-solid fa-check mr-1"></i>
                    Saved
                  </span>
                {/if}

                <button
                  type="button"
                  onclick={goToNextPage}
                  class="px-5 py-3 rounded-xl font-bold transition-all hover:scale-[1.02] border"
                  style="background: linear-gradient(135deg, {$colorStore.secondary}15, {$colorStore.primary}10); color: {$colorStore.text}; border-color: {$colorStore.secondary}30;"
                >
                  Next
                  <i class="fa-solid fa-arrow-right ml-2"></i>
                </button>
              </div>
            {/if}

            <!-- Submit Button -->
            <div class="mt-6" class:hidden={!isLastPage}>
              {#if isPaginated}
                <button
                  type="button"
                  onclick={goToPreviousPage}
                  class="w-full mb-3 py-3 rounded-xl font-medium transition-all"
                  style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
                >
                  <i class="fa-solid fa-arrow-left mr-2"></i>
                  Back
                </button>
              {/if}
              {#if isPreviewMode}
                <div
                  class="w-full py-4 rounded-xl font-bold text-lg text-center"
                  style="background: #f59e0b20; color: #f59e0b; border: 2px dashed #f59e0b;"
                >
                  <i class="fa-solid fa-eye mr-2"></i>
                  Preview Mode - Submission Disabled
                </div>
              {:else}
                <button
                  type="submit"
                  disabled={submitting || (form.requireCaptcha && !turnstileToken)}
                  class="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border"
                  style="background: linear-gradient(135deg, {$colorStore.secondary}15, {$colorStore.primary}10); color: {$colorStore.text}; border-color: {$colorStore.secondary}30; box-shadow: 0 4px 20px {$colorStore.secondary}10;"
                >
                  {#if submitting}
                    <i class="fa-solid fa-spinner fa-spin mr-2"></i>
                    Submitting...
                  {:else}
                    <i class="fa-solid fa-clipboard-check mr-2"></i>
                    Review & Continue
                  {/if}
                </button>
              {/if}
            </div>
          </form>
        {/if}
      </div>
    {/if}
  </div>
</main>

<style>
  /* Question text is rendered as a small subset of Markdown, so it needs the handful of element
     styles Tailwind's reset takes away. Everything here is scoped to the rendered fragment. */
  .form-prose :global(p) {
    margin: 0 0 0.5em;
  }

  .form-prose :global(p:last-child) {
    margin-bottom: 0;
  }

  .form-prose :global(strong) {
    font-weight: 700;
  }

  .form-prose :global(em) {
    font-style: italic;
  }

  .form-prose :global(del) {
    text-decoration: line-through;
  }

  .form-prose :global(a) {
    text-decoration: underline;
  }

  .form-prose :global(code) {
    font-family: ui-monospace, monospace;
    font-size: 0.9em;
    padding: 0.1em 0.35em;
    border-radius: 0.25rem;
    background: rgb(127 127 127 / 0.15);
  }

  .form-prose :global(pre) {
    padding: 0.75rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    background: rgb(127 127 127 / 0.12);
  }

  .form-prose :global(blockquote) {
    padding-left: 0.75rem;
    border-left: 3px solid rgb(127 127 127 / 0.35);
    opacity: 0.85;
  }

  .form-prose :global(ul),
  .form-prose :global(ol) {
    margin: 0.25em 0 0.5em;
    padding-left: 1.35em;
  }

  .form-prose :global(ul) {
    list-style: disc;
  }

  .form-prose :global(ol) {
    list-style: decimal;
  }

  .form-prose :global(h1),
  .form-prose :global(h2),
  .form-prose :global(h3),
  .form-prose :global(h4) {
    font-weight: 700;
    margin: 0.25em 0;
  }

  .form-prose :global(hr) {
    margin: 0.75em 0;
    border-color: rgb(127 127 127 / 0.3);
  }
</style>
