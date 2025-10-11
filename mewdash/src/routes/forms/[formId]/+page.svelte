<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import {
    clientApi,
    type Form,
    type FormQuestion,
    formsApi,
    type FormSubmissionRequest,
    instanceManagementApi
  } from "$lib/api/index.ts";
  import { currentInstance } from "$lib/stores/instanceStore";
  import type { PageData } from "./$types";
  import { colorStore } from "$lib/stores/colorStore";
  import { fade, fly, slide } from "svelte/transition";
  import { Turnstile } from "svelte-turnstile";
  import {
    escapeHtml,
    isValidEmail,
    isValidNumber,
    isValidUrl,
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
  let isShareCode = $state(false);
  let submitting = $state(false);
  let error = $state<string | null>(null);
  let success = $state(false);
  let turnstileToken = $state<string | undefined>(undefined);
  let validationErrors = $state<Record<number, string>>({});
  let isPreviewMode = $state(false);
  let isAdmin = $state(false);
  let currentQuestionIndex = $state(0);
  let showConfirmation = $state(false);
  let showLoginPrompt = $state(false);
  let statusCheckUrl = $state<string>("");
  let statusCheckToken = $state<string>("");

  // Computed
  let visibleQuestions = $derived(
    questions.filter((q) => {
      if (!q.conditionalParentQuestionId) return true;

      const parentAnswer = answers[q.conditionalParentQuestionId];
      if (!parentAnswer) return false;

      return evaluateCondition(
        parentAnswer,
        q.conditionalOperator || "equals",
        q.conditionalExpectedValue || ""
      );
    })
  );

  let answeredQuestions = $derived(
    visibleQuestions.filter((q) => {
      const answer = answers[q.id];
      if (!answer) return false;
      if (typeof answer === "string") return answer.trim().length > 0;
      if (Array.isArray(answer)) return answer.length > 0;
      return true;
    })
  );

  let progressPercentage = $derived(
    visibleQuestions.length > 0 ? Math.round((answeredQuestions.length / visibleQuestions.length) * 100) : 0
  );

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

  function validateQuestion(question: FormQuestion): string | null {
    const answer = answers[question.id];

    // Check if required
    if (question.isRequired) {
      if (!answer || (typeof answer === "string" && !answer.trim())) {
        return "This question is required";
      }
      if (Array.isArray(answer) && answer.length === 0) {
        return "Please select at least one option";
      }
    }

    if (!answer) return null; // Not required and empty is OK

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

    for (const question of visibleQuestions) {
      const errorMsg = validateQuestion(question);
      if (errorMsg) {
        validationErrors[question.id] = errorMsg;
        isValid = false;
      }
    }

    return isValid;
  }

  async function loadForm() {
    try {
      loading = true;
      error = null;

      form = await formsApi.getForm(formId);
      questions = await formsApi.getFormQuestions(formId);

      // Check eligibility for ban appeals and join applications (formType !== 0 means not Regular)
      if (!isPreviewMode && form.formType !== 0) {
        try {
          const eligibilityCheck = await formsApi.checkEligibility(formId, data.user.id);
          if (!eligibilityCheck.isEligible) {
            error = eligibilityCheck.reason || "You are not eligible to submit this form";
            return;
          }
        } catch (err) {
          error = "Failed to verify eligibility";
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
            return;
          }
          isAdmin = true;
        } catch {
          error = "Failed to verify administrator permissions";
          return;
        }
      }

      // Skip validation checks in preview mode
      if (!isPreviewMode) {
        if (!form.isActive) {
          error = "This form is no longer accepting responses";
          return;
        }

        // Check if form has expired
        if (form.expiresAt && new Date(form.expiresAt) < new Date()) {
          error = "This form has expired and is no longer accepting responses";
          return;
        }

        // Check if max responses reached
        if (form.maxResponses && form.responseCount && form.responseCount >= form.maxResponses) {
          error = "This form has reached its maximum number of responses";
          return;
        }
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to load form";
    } finally {
      loading = false;
    }
  }

  function proceedToConfirmation() {
    // Validate before showing confirmation
    if (!validateAllQuestions()) {
      error = "Please fix the errors below before proceeding";
      return;
    }

    // Check captcha
    if (form?.requireCaptcha && !turnstileToken) {
      error = "Please complete the captcha verification";
      return;
    }

    showConfirmation = true;
    error = null;
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
          sanitizedAnswers[questionId] = answer.map((a) => sanitizeAnswerText(a));
        } else {
          sanitizedAnswers[questionId] = sanitizeAnswerText(answer);
        }
      }

      const request: FormSubmissionRequest = {
        userId: data.user.id,
        username: data.user.username,
        answers: sanitizedAnswers,
        turnstileToken
      };

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
    } catch (err) {
      error = err instanceof Error ? err.message : "Failed to submit form";
      success = false;
    } finally {
      submitting = false;
    }
  }

  function onTurnstileSuccess(event: CustomEvent<{ token: string }>) {
    turnstileToken = event.detail.token;
  }

  onMount(async () => {
    const formIdParam = $page.params.formId;

    // Check if param is a share code (alphanumeric) or numeric form ID
    const numericFormId = parseInt(formIdParam);
    if (isNaN(numericFormId)) {
      // It's a share code
      isShareCode = true;
      try {
        const resolved = await formsApi.resolveShareLink(formIdParam);
        formId = resolved.formId;

        // Set the correct instance
        const instances = await instanceManagementApi.getBotInstances();
        const targetInstance = instances.find((i) => i.port.toString() === resolved.instanceIdentifier);
        if (targetInstance) {
          currentInstance.set(targetInstance);
        }
      } catch (err) {
        error = "Invalid or expired form link";
        loading = false;
        return;
      }
    } else {
      // It's a numeric form ID (legacy support)
      formId = numericFormId;
    }

    if (!data.user) {
      showLoginPrompt = true;
      loading = false;
      return;
    }

    isPreviewMode = $page.url.searchParams.get("preview") === "true";
    await loadForm();
  });
</script>

<svelte:head>
  <title>{form?.name || "Form"} - Mewdeko</title>
  <meta content={form?.description || "Fill out this form"} name="description" />
</svelte:head>

<main
  class="min-h-screen py-8 px-4"
  style="background: linear-gradient(135deg, {$colorStore.primary}08 0%, {$colorStore.secondary}05 100%);"
>
  <div class="container mx-auto max-w-3xl">
    {#if showLoginPrompt}
      <div
        class="backdrop-blur-xs rounded-xl border p-8 text-center"
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
          class="px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] shadow-lg"
          style="background: linear-gradient(135deg, #5865F2, #7289DA); color: white; box-shadow: 0 4px 20px #5865F230;"
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
        class="backdrop-blur-xs rounded-xl border p-12 text-center"
        style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
        in:fade
      >
        <div
          class="w-12 h-12 border-4 rounded-full animate-spin mx-auto mb-4"
          style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"
        ></div>
        <p style="color: {$colorStore.muted};">Loading form...</p>
      </div>
    {:else if error}
      <div
        class="backdrop-blur-xs rounded-xl border p-8 text-center"
        style="background: #ef444410; border-color: #ef444430;"
        in:fly={{ y: 20, duration: 300 }}
      >
        <i class="fa-solid fa-triangle-exclamation mb-4" style="color: #ef4444; font-size: 48px; display: block;"></i>
        <h2 class="text-2xl font-bold mb-4" style="color: #ef4444;">Error</h2>
        <p class="text-lg" style="color: {$colorStore.text};">{error}</p>
      </div>
    {:else if success}
      <div class="space-y-6">
        <div
          class="backdrop-blur-xs rounded-xl border p-8 text-center"
          style="background: #10B98110; border-color: #10B98130;"
          in:fly={{ y: 20, duration: 300 }}
        >
          <i class="fa-solid fa-check-circle mb-4" style="color: #10B981; font-size: 48px; display: block;"></i>
          <h2 class="text-2xl font-bold mb-4" style="color: #10B981;">Success!</h2>
          <p class="text-lg mb-6" style="color: {$colorStore.text};">
            {#if form?.successMessage}
              {@html escapeHtml(form.successMessage)}
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
                {#if form.formType === 1}
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
                {:else if form.formType === 2}
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
            class="backdrop-blur-xs rounded-xl border p-4"
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
            class="backdrop-blur-xs rounded-xl border p-6"
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
            class="backdrop-blur-xs rounded-xl border p-6"
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
            class="backdrop-blur-xs rounded-xl border p-6"
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
          class="backdrop-blur-xs rounded-xl border p-8 text-center"
          style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
          in:fade
        >
          <div
            class="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
            style="background: linear-gradient(135deg, {$colorStore.primary}30, {$colorStore.secondary}40);"
          >
            <i class="fa-solid fa-clipboard-list" style="color: {$colorStore.primary}; font-size: 32px;"></i>
          </div>
          <h1 class="text-3xl font-bold mb-3" style="color: {$colorStore.text};">
            {form.name}
          </h1>
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

        <!-- Progress Indicator -->
        {#if visibleQuestions.length > 1 && !isPreviewMode}
          <div
            class="backdrop-blur-xs rounded-xl border p-4"
            style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
            in:slide
          >
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-list-check" style="color: {$colorStore.primary};"></i>
                <span class="font-semibold" style="color: {$colorStore.text};">
                  Progress: {answeredQuestions.length} of {visibleQuestions.length} questions
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
            class="backdrop-blur-xs rounded-xl border p-6"
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
              {#each visibleQuestions as question}
                {#if answers[question.id]}
                  <div
                    class="p-4 rounded-lg"
                    style="background: {$colorStore.primary}08; border: 1px solid {$colorStore.primary}20;"
                  >
                    <div class="font-semibold mb-2" style="color: {$colorStore.text};">
                      {@html escapeHtml(question.questionText)}
                    </div>
                    <div
                      class="p-3 rounded"
                      style="background: {$colorStore.primary}05; color: {$colorStore.text};"
                    >
                      {#if Array.isArray(answers[question.id])}
                        <ul class="list-disc list-inside space-y-1">
                          {#each answers[question.id] as value}
                            <li>{@html escapeHtml(value)}</li>
                          {/each}
                        </ul>
                      {:else}
                        <div class="whitespace-pre-wrap">
                          {@html escapeHtml(answers[question.id])}
                        </div>
                      {/if}
                    </div>
                  </div>
                {/if}
              {/each}
            </div>

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
                disabled={submitting}
                class="flex-1 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
                style="background: linear-gradient(135deg, {$colorStore.primary}, {$colorStore.secondary}); color: white;"
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
            <div class="space-y-4">
              {#each visibleQuestions as question, index (question.id)}
                <div
                  class="backdrop-blur-xs rounded-xl border p-6 transition-all"
                  style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
                  in:slide={{ duration: 300, delay: index * 50 }}
                >
                  <label class="block mb-3">
                    <div class="flex items-start gap-2 mb-3">
                    <span
                      class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                      style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
                    >
                      {index + 1}
                    </span>
                      <div class="flex-1">
                      <span class="font-semibold" style="color: {$colorStore.text};">
                        {@html escapeHtml(question.questionText)}
                      </span>
                        {#if question.isRequired}
                          <span style="color: #ef4444;"> *</span>
                        {/if}
                      </div>
                    </div>

                    <!-- Question Input Based on Type -->
                    {#if question.questionType === "short_text"}
                      <input
                        type="text"
                        bind:value={answers[question.id]}
                        placeholder={question.placeholder || "Type your answer..."}
                        class="w-full p-3 rounded-lg"
                        style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                        minlength={question.minLength}
                        maxlength={question.maxLength}
                      />
                    {:else if question.questionType === "long_text"}
                    <textarea
                      bind:value={answers[question.id]}
                      placeholder={question.placeholder || "Type your answer..."}
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
                        placeholder={question.placeholder || "Enter a number..."}
                        class="w-full p-3 rounded-lg"
                        style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                        min={question.minValue}
                        max={question.maxValue}
                      />
                    {:else if question.questionType === "email"}
                      <input
                        type="email"
                        bind:value={answers[question.id]}
                        placeholder={question.placeholder || "your.email@example.com"}
                        class="w-full p-3 rounded-lg"
                        style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
                      />
                    {:else if question.questionType === "url"}
                      <input
                        type="url"
                        bind:value={answers[question.id]}
                        placeholder={question.placeholder || "https://example.com"}
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
                                class="w-4 h-4"
                                style="accent-color: {$colorStore.primary};"
                              />
                              <span style="color: {$colorStore.text};">{@html escapeHtml(option.optionText)}</span>
                            </label>
                          {/each}
                        {/if}
                      </div>
                    {:else if question.questionType === "checkboxes"}
                      <div class="space-y-2">
                        {#if question.options}
                          {#each question.options as option}
                            {@const checkboxAnswers = (answers[question.id]; as string[]) || []}
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
                                let current = (answers[question.id]; as; string[];) || [];
                                if (checked) {
                                  answers[question.id] = [...current, option.optionValue];
                                } else {
                                  answers[question.id] = current.filter((v) => v !== option.optionValue);
                                }
                              }}
                                class="w-4 h-4 rounded"
                                style="accent-color: {$colorStore.primary};"
                              />
                              <span style="color: {$colorStore.text};">{@html escapeHtml(option.optionText)}</span>
                            </label>
                          {/each}
                        {/if}
                      </div>
                    {:else if question.questionType === "dropdown"}
                      <select
                        bind:value={answers[question.id]}
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
                      <i class="fa-solid fa-exclamation-circle" style="color: #ef4444; font-size: 14px;"></i>
                      <span class="text-sm" style="color: #ef4444;">
                      {validationErrors[question.id]}
                    </span>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>

            <!-- Captcha (if required) -->
            {#if form.requireCaptcha}
              <div
                class="backdrop-blur-xs rounded-xl border p-6 mt-6"
                style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}30;"
                in:slide
              >
                <p class="text-sm mb-4 text-center" style="color: {$colorStore.muted};">
                  Please complete the verification below
                </p>
                <div class="flex justify-center">
                  <Turnstile siteKey="0x4AAAAAAAAvvAPaJgbIJWh-" on:callback={onTurnstileSuccess} />
                </div>
              </div>
            {/if}

            <!-- Submit Button -->
            <div class="mt-6">
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
                  class="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  style="background: linear-gradient(135deg, {$colorStore.primary}, {$colorStore.secondary}); color: white; box-shadow: 0 4px 20px {$colorStore.primary}30;"
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
