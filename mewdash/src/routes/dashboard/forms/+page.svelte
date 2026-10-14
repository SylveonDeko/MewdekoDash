<!-- routes/dashboard/forms/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { type Form, formsApi } from "$lib/api/index.ts";
  import type { PageData } from "./$types";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { colorStore } from "$lib/stores/colorStore";
  import { loadingStore } from "$lib/stores/loadingStore";
  import { fade } from "svelte/transition";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import FormsList from "$lib/components/forms/FormsList.svelte";
  import FormCreate from "$lib/components/forms/FormCreate.svelte";
  import FormEdit from "$lib/components/forms/FormEdit.svelte";
  import FormResponseQueue from "$lib/components/forms/FormResponseQueue.svelte";
  import FormGuildSettings from "$lib/components/forms/FormGuildSettings.svelte";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { logger } from "$lib/logger";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  // State
  let forms = $state<Form[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let showShareLinkModal = $state(false);
  let currentShareLink = $state("");

  // Tab and selection state
  let activeTab = $state("list");
  let selectedFormId = $state<number | null>(null);

  // Component references for calling methods
  let formCreateRef = $state<any>(null);
  let formEditRef = $state<any>(null);

  async function exportResponses() {
    if (!selectedFormId) return;
    const formId = selectedFormId;

    return await loadingStore.wrap("export-responses", async () => {
      try {
        const blob = await formsApi.exportResponses(formId);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `form_${formId}_responses_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showNotificationMessage(m.forms.pageNotifyExported(), "success");
      } catch (err) {
        showNotificationMessage(m.forms.pageErrorExport(), "error");
      }
    }, "operation", m.forms.pageLoadingExport());
  }

  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => (showNotification = false), 3000);
  }

  async function loadForms() {
    if (!$currentGuild?.id) return;

    return await loadingStore.wrap("load-forms", async () => {
      try {
        loading = true;
        error = null;
        const fetchedForms = await formsApi.getGuildForms($currentGuild.id);

        // Sanitize forms - fix PostgreSQL infinity dates
        const sanitizedForms = fetchedForms.map(form => ({
          ...form,
          expiresAt: form.expiresAt && form.expiresAt !== "-infinity" && form.expiresAt !== "infinity"
            ? form.expiresAt
            : null
        }));

        logger.debug(`Loaded ${sanitizedForms.length} forms for guild ${$currentGuild.id}:`, sanitizedForms);
        forms = sanitizedForms;
      } catch (err) {
        logger.error("Failed to load forms:", err);
        error = err instanceof Error ? err.message : m.forms.pageErrorLoad();
      } finally {
        loading = false;
      }
    }, "api", m.forms.listLoading());
  }

  async function toggleFormStatus(form: Form) {
    return await loadingStore.wrap("toggle-form", async () => {
      try {
        await formsApi.setFormActiveStatus(form.id, !form.isActive);
        form.isActive = !form.isActive;
        showNotificationMessage(
          form.isActive ? m.forms.pageNotifyActivated() : m.forms.pageNotifyDeactivated()
        );
      } catch (err) {
        showNotificationMessage(m.forms.pageErrorStatus(), "error");
      }
    }, "operation", m.forms.pageLoadingStatus());
  }

  async function deleteForm(form: Form) {
    if (!(await requestConfirmation({ message: m.forms.pageConfirmDelete({ name: form.name }), confirmText: m.common.delete() }))) {
      return;
    }

    return await loadingStore.wrap("delete-form", async () => {
      try {
        await formsApi.deleteForm(form.id);
        forms = forms.filter((f) => f.id !== form.id);
        showNotificationMessage(m.forms.pageNotifyDeleted());
        // If we were viewing this form, go back to list
        if (selectedFormId === form.id) {
          selectedFormId = null;
          activeTab = "list";
        }
      } catch (err) {
        showNotificationMessage(m.forms.pageErrorDelete(), "error");
      }
    }, "operation", m.forms.pageLoadingDelete());
  }

  async function duplicateForm(form: Form) {
    return await loadingStore.wrap("duplicate-form", async () => {
      try {
        const duplicated = await formsApi.duplicateForm(form.id, data.user.id);
        await loadForms(); // Reload to show new form
        showNotificationMessage(m.forms.pageNotifyDuplicated({ name: duplicated.name }));
      } catch (err) {
        showNotificationMessage(m.forms.pageErrorDuplicate(), "error");
      }
    }, "operation", m.forms.pageLoadingDuplicate());
  }

  async function publishForm(form: Form) {
    return await loadingStore.wrap("publish-form", async () => {
      try {
        await formsApi.publishForm(form.id);
        form.isDraft = false;
        showNotificationMessage(m.forms.pageNotifyPublished());
      } catch (err: any) {
        // Publishing is where the checks spanning the whole form run, so a refusal usually names
        // something specific and fixable. Saying what beats saying that it failed.
        const reasons = err?.body?.errors;

        showNotificationMessage(
          Array.isArray(reasons) && reasons.length > 0
            ? reasons.join(". ")
            : err?.message || m.forms.pageErrorPublish(),
          "error"
        );
      }
    }, "operation", m.forms.pageLoadingPublish());
  }

  async function copyFormLink(formId: number) {
    return await loadingStore.wrap("generate-link", async () => {
      try {
        const instance = $currentInstance;
        if (!instance) {
          showNotificationMessage(m.forms.pageErrorNoInstance(), "error");
          return;
        }

        const instanceId = instance.port.toString();
        logger.debug(`Generating/retrieving share link for form ${formId} with instance ${instanceId}`);

        const { shareCode } = await formsApi.generateShareLink(formId, instanceId);
        const link = `${window.location.origin}/forms/${shareCode}`;

        logger.debug(`Share link generated successfully: ${link} (code: ${shareCode})`);

        currentShareLink = link;
        showShareLinkModal = true;
      } catch (err: any) {
        logger.error("Failed to generate share link:", err);
        logger.error("Error details:", err?.error || err);

        // Provide more detailed error message
        const errorMessage = err?.error?.message || err?.message || m.forms.pageErrorShareLink();
        showNotificationMessage(errorMessage, "error");
      }
    }, "operation", m.forms.pageLoadingShareLink());
  }

  /**
   * The clipboard API needs a secure context and is missing in a few browsers, so a copy button
   * that only knows about it silently does nothing for some people. The textarea route is the
   * fallback for those.
   */
  async function writeToClipboard(text: string): Promise<boolean> {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // Fall through and try the older approach.
      }
    }

    try {
      const scratch = document.createElement("textarea");
      scratch.value = text;
      scratch.setAttribute("readonly", "");
      scratch.style.position = "fixed";
      scratch.style.opacity = "0";
      document.body.appendChild(scratch);
      scratch.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(scratch);
      return copied;
    } catch {
      return false;
    }
  }

  async function copyToClipboard() {
    if (await writeToClipboard(currentShareLink)) {
      showNotificationMessage(m.forms.pageNotifyLinkCopied());
      showShareLinkModal = false;
      return;
    }

    // The modal stays open with the link visible, so it can still be copied by hand.
    showNotificationMessage(m.forms.pageErrorCopyFailed(), "error");
  }

  async function previewForm(formId: number) {
    return await loadingStore.wrap("generate-preview", async () => {
      try {
        const instance = $currentInstance;
        if (!instance) {
          showNotificationMessage(m.forms.pageErrorNoInstance(), "error");
          return;
        }

        const instanceId = instance.port.toString();
        logger.debug(`Generating preview link for form ${formId} with instance ${instanceId}`);

        const { shareCode } = await formsApi.generateShareLink(formId, instanceId);
        logger.debug(`Preview link generated: /forms/${shareCode}?preview=true`);

        window.open(`/forms/${shareCode}?preview=true`, "_blank");
      } catch (err: any) {
        logger.error("Failed to generate preview link:", err);
        const errorMessage = err?.error?.message || err?.message || m.forms.pageErrorPreview();
        showNotificationMessage(errorMessage, "error");
      }
    }, "operation", m.forms.pageLoadingPreview());
  }

  // Tab navigation handlers
  function handleCreateNew() {
    activeTab = "create";
    selectedFormId = null;
  }

  function handleEdit(formId: number) {
    selectedFormId = formId;
    activeTab = "edit";
  }

  function handleViewResponses(formId: number) {
    selectedFormId = formId;
    activeTab = "responses";
  }

  /** Review happens on the responses screen, so both entry points land in the same place. */
  function handleReview(formId: number) {
    selectedFormId = formId;
    activeTab = "responses";
  }

  async function handleFormCreated(formId: number) {
    await loadForms(); // Wait for forms to load before setting selectedFormId

    // Verify the form exists in our forms array before setting it as selected
    const createdForm = forms.find(f => f.id === formId);
    if (createdForm) {
      selectedFormId = formId;
      activeTab = "responses";
    } else {
      // If form not found, stay on list view
      logger.warn(`Created form with ID ${formId} not found in forms list`);
      activeTab = "list";
      selectedFormId = null;
      showNotificationMessage(m.forms.pageNotifyCreated(), "success");
    }
  }

  async function handleFormUpdated() {
    await loadForms(); // Wait for reload to complete
    activeTab = "list";
    selectedFormId = null;
  }

  // Tabs configuration - dynamically show edit/responses/review tabs only when form is selected
  let tabs = $derived((() => {
    const baseTabs = [
      { id: "list", label: m.features.formsName(), icon: "fa-list" },
      { id: "create", label: m.common.create(), icon: "fa-plus" },
      { id: "settings", label: m.common.settings(), icon: "fa-sliders" }
    ];

    if (selectedFormId) {
      const selectedForm = forms.find(f => f.id === selectedFormId);

      // Only add tabs if the form exists in our forms array
      if (selectedForm) {
        // Reading a response and deciding on it are the same task, so they are one tab. The
        // pending count rides on it, since that is the number a reviewer is looking for.
        const responsesLabel = selectedForm.pendingCount ? m.forms.pageTabResponsesPending({ count: selectedForm.pendingCount }) : m.common.responses();

        baseTabs.push(
          { id: "edit", label: m.common.edit(), icon: "fa-edit" },
          { id: "responses", label: responsesLabel, icon: "fa-inbox" }
        );
      }
    }

    return baseTabs;
  })());

  // Action buttons - context-aware based on active tab
  let actionButtons = $derived((() => {
    if (activeTab === "create") {
      return [
        {
          label: m.forms.pageActionSaveForm(),
          icon: "fa-check",
          action: () => formCreateRef?.saveForm()
        }
      ];
    } else if (activeTab === "edit") {
      return [
        {
          label: m.common.saveChanges(),
          icon: "fa-check",
          action: () => formEditRef?.saveForm()
        }
      ];
    } else if (activeTab === "responses" && selectedFormId) {
      return [
        {
          label: m.forms.queueExportCsv(),
          icon: "fa-download",
          action: exportResponses
        },
        {
          label: m.forms.pageActionEditForm(),
          icon: "fa-edit",
          action: () => selectedFormId !== null && handleEdit(selectedFormId)
        }
      ];
    } else {
      return [
        {
          label: m.forms.pageActionCreateForm(),
          icon: "fa-plus",
          action: handleCreateNew
        }
      ];
    }
  })());

  // Handle tab change
  function handleTabChange(detail: { tabId: string }) {
    const newTab = detail.tabId;

    // If switching away from edit/responses without a selected form, go to list
    if ((newTab === "edit" || newTab === "responses") && !selectedFormId) {
      activeTab = "list";
      return;
    }

    activeTab = newTab;
  }

  onMount(async () => {
    if (!$currentGuild) {
      return;
    }
    await loadForms();
  });

  $effect(() => {
    if ($currentGuild) {
      loadForms();
    }
  });
</script>

<DashboardPageLayout
  {actionButtons}
  bind:activeTab
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-clipboard-check"
  ontabChange={handleTabChange}
  subtitle={m.forms.pageSubtitle()}
  {tabs}
  title={m.features.formsName()}
>
  {#snippet statusMessages()}
    {#if showNotification}
      <div class="fixed top-4 right-4 z-50" transition:fade>
        <Notification message={notificationMessage} type={notificationType} />
      </div>
    {/if}
  {/snippet}

  <!-- Share Link Modal -->
  {#if showShareLinkModal}
    <div
      class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onclick={() => (showShareLinkModal = false)}
      onkeydown={(e) => e.key === 'Escape' && (showShareLinkModal = false)}
      role="button"
      tabindex="-1"
      transition:fade
    >
      <div
        class="w-full max-w-lg backdrop-blur-md rounded-xl border p-6 shadow-2xl"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}95, {$colorStore.gradientMid}98); border-color: {$colorStore.primary}30;"
        onclick={(e) => e.stopPropagation()}
        onkeydown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        tabindex="-1"
      >
        <div class="flex items-start justify-between mb-4">
          <h2 class="text-2xl font-bold" style="color: {$colorStore.text};">
            <i class="fa-solid fa-link mr-2" style="color: {$colorStore.primary};"></i>
            {m.forms.pageShareTitle()}
          </h2>
          <button
            onclick={() => (showShareLinkModal = false)}
            class="p-2 rounded-lg transition-all hover:scale-110"
            style="background: {$colorStore.primary}20; color: {$colorStore.text};"
            aria-label={m.forms.pageShareCloseAria()}
          >
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <div class="mb-4 p-3 rounded-lg border" style="background: #3b82f608; border-color: #3b82f620;">
          <div class="flex items-start gap-2 text-xs">
            <i class="fa-solid fa-info-circle flex-shrink-0 mt-0.5" style="color: #3b82f6;"></i>
            <span style="color: {$colorStore.muted};">
              {m.forms.pageShareHint()}
            </span>
          </div>
        </div>

        <div class="mb-4">
          <label for="f-+page-share-link-428" class="block text-sm mb-2" style="color: {$colorStore.muted};">
            {m.forms.pageShareLinkLabel()}
          </label>
          <input id="f-+page-share-link-428"
            type="text"
            readonly
            value={currentShareLink}
            onclick={(e) => e.currentTarget.select()}
            class="w-full p-3 rounded-lg font-mono text-sm"
            style="background: {$colorStore.primary}10; border: 1px solid {$colorStore.primary}30; color: {$colorStore.text};"
          />
        </div>

        <div class="flex gap-3">
          <button
            onclick={copyToClipboard}
            class="flex-1 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] border"
            style="background: linear-gradient(135deg, {$colorStore.primary}15, {$colorStore.secondary}10); color: {$colorStore.text}; border-color: {$colorStore.primary}30; box-shadow: 0 4px 20px {$colorStore.primary}10;"
          >
            <i class="fa-solid fa-copy mr-2"></i>
            {m.common.copyToClipboard()}
          </button>
          <button
            onclick={() => (showShareLinkModal = false)}
            class="px-6 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
            style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
          >
            {m.common.close()}
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Tab Content -->
  {#if activeTab === "list"}
    <FormsList
      {forms}
      {loading}
      {error}
      onEdit={handleEdit}
      onViewResponses={handleViewResponses}
      onPreview={previewForm}
      onCopyLink={copyFormLink}
      onDuplicate={duplicateForm}
      onToggleStatus={toggleFormStatus}
      onDelete={deleteForm}
      onPublish={publishForm}
      onCreateNew={handleCreateNew}
      onReview={handleReview}
    />
  {:else if activeTab === "create"}
    <FormCreate
      bind:this={formCreateRef}
      userId={data.user.id}
      onSuccess={handleFormCreated}
      onShowNotification={showNotificationMessage}
    />
  {:else if activeTab === "edit" && selectedFormId}
    <FormEdit
      bind:this={formEditRef}
      formId={selectedFormId}
      onSuccess={handleFormUpdated}
      onShowNotification={showNotificationMessage}
    />
  {:else if activeTab === "settings"}
    <FormGuildSettings
      userId={data.user.id}
      onShowNotification={showNotificationMessage}
    />
  {:else if activeTab === "responses" && selectedFormId}
    <FormResponseQueue
      formId={selectedFormId}
      userId={data.user.id}
      onShowNotification={showNotificationMessage}
    />
  {/if}
</DashboardPageLayout>
