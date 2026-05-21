<!-- routes/dashboard/forms/+page.svelte -->
<script lang="ts">
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
  import FormResponses from "$lib/components/forms/FormResponses.svelte";
  import FormWorkflowReview from "$lib/components/forms/FormWorkflowReview.svelte";

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
        showNotificationMessage("Responses exported successfully", "success");
      } catch (err) {
        showNotificationMessage("Failed to export responses", "error");
      }
    }, "operation", "Exporting responses...");
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

        console.log(`Loaded ${sanitizedForms.length} forms for guild ${$currentGuild.id}:`, sanitizedForms);
        forms = sanitizedForms;
      } catch (err) {
        console.error("Failed to load forms:", err);
        error = err instanceof Error ? err.message : "Failed to load forms";
      } finally {
        loading = false;
      }
    }, "api", "Loading forms...");
  }

  async function toggleFormStatus(form: Form) {
    return await loadingStore.wrap("toggle-form", async () => {
      try {
        await formsApi.setFormActiveStatus(form.id, !form.isActive);
        form.isActive = !form.isActive;
        showNotificationMessage(
          `Form ${form.isActive ? "activated" : "deactivated"} successfully`
        );
      } catch (err) {
        showNotificationMessage("Failed to update form status", "error");
      }
    }, "operation", "Updating form...");
  }

  async function deleteForm(form: Form) {
    if (!confirm(`Are you sure you want to delete "${form.name}"? This will delete all responses.`)) {
      return;
    }

    return await loadingStore.wrap("delete-form", async () => {
      try {
        await formsApi.deleteForm(form.id);
        forms = forms.filter((f) => f.id !== form.id);
        showNotificationMessage("Form deleted successfully");
        // If we were viewing this form, go back to list
        if (selectedFormId === form.id) {
          selectedFormId = null;
          activeTab = "list";
        }
      } catch (err) {
        showNotificationMessage("Failed to delete form", "error");
      }
    }, "operation", "Deleting form...");
  }

  async function duplicateForm(form: Form) {
    return await loadingStore.wrap("duplicate-form", async () => {
      try {
        const duplicated = await formsApi.duplicateForm(form.id, data.user.id);
        await loadForms(); // Reload to show new form
        showNotificationMessage(`Form duplicated as "${duplicated.name}"`);
      } catch (err) {
        showNotificationMessage("Failed to duplicate form", "error");
      }
    }, "operation", "Duplicating form...");
  }

  async function publishForm(form: Form) {
    return await loadingStore.wrap("publish-form", async () => {
      try {
        await formsApi.publishForm(form.id);
        form.isDraft = false;
        showNotificationMessage("Form published successfully!");
      } catch (err) {
        showNotificationMessage("Failed to publish form", "error");
      }
    }, "operation", "Publishing form...");
  }

  async function copyFormLink(formId: number) {
    return await loadingStore.wrap("generate-link", async () => {
      try {
        const instance = $currentInstance;
        if (!instance) {
          showNotificationMessage("No instance selected", "error");
          return;
        }

        const instanceId = instance.port.toString();
        console.log(`Generating/retrieving share link for form ${formId} with instance ${instanceId}`);

        const { shareCode } = await formsApi.generateShareLink(formId, instanceId);
        const link = `${window.location.origin}/forms/${shareCode}`;

        console.log(`Share link generated successfully: ${link} (code: ${shareCode})`);

        currentShareLink = link;
        showShareLinkModal = true;
      } catch (err: any) {
        console.error("Failed to generate share link:", err);
        console.error("Error details:", err?.error || err);

        // Provide more detailed error message
        const errorMessage = err?.error?.message || err?.message || "Failed to generate share link";
        showNotificationMessage(errorMessage, "error");
      }
    }, "operation", "Getting share link...");
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(currentShareLink).then(() => {
      showNotificationMessage("Link copied to clipboard!");
      showShareLinkModal = false;
    }).catch(() => {
      showNotificationMessage("Failed to copy to clipboard", "error");
    });
  }

  async function previewForm(formId: number) {
    return await loadingStore.wrap("generate-preview", async () => {
      try {
        const instance = $currentInstance;
        if (!instance) {
          showNotificationMessage("No instance selected", "error");
          return;
        }

        const instanceId = instance.port.toString();
        console.log(`Generating preview link for form ${formId} with instance ${instanceId}`);

        const { shareCode } = await formsApi.generateShareLink(formId, instanceId);
        console.log(`Preview link generated: /forms/${shareCode}?preview=true`);

        window.open(`/forms/${shareCode}?preview=true`, "_blank");
      } catch (err: any) {
        console.error("Failed to generate preview link:", err);
        const errorMessage = err?.error?.message || err?.message || "Failed to generate preview link";
        showNotificationMessage(errorMessage, "error");
      }
    }, "operation", "Generating preview...");
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

  function handleReview(formId: number) {
    selectedFormId = formId;
    activeTab = "review";
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
      console.warn(`Created form with ID ${formId} not found in forms list`);
      activeTab = "list";
      selectedFormId = null;
      showNotificationMessage("Form created successfully", "success");
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
      { id: "list", label: "Forms", icon: "fa-list" },
      { id: "create", label: "Create", icon: "fa-plus" }
    ];

    if (selectedFormId) {
      const selectedForm = forms.find(f => f.id === selectedFormId);

      // Only add tabs if the form exists in our forms array
      if (selectedForm) {
        baseTabs.push(
          { id: "edit", label: "Edit", icon: "fa-edit" },
          { id: "responses", label: "Responses", icon: "fa-chart-bar" }
        );

        // Add Review tab for forms that require workflow (formType !== 0 means not Regular)
        if (selectedForm.formType !== 0) {
          baseTabs.push({
            id: "review",
            label: `Review${selectedForm.pendingCount ? ` (${selectedForm.pendingCount})` : ""}`,
            icon: "fa-clipboard-check"
          });
        }
      }
    }

    return baseTabs;
  })());

  // Action buttons - context-aware based on active tab
  let actionButtons = $derived((() => {
    if (activeTab === "create") {
      return [
        {
          label: "Save Form",
          icon: "fa-check",
          action: () => formCreateRef?.saveForm()
        }
      ];
    } else if (activeTab === "edit") {
      return [
        {
          label: "Save Changes",
          icon: "fa-check",
          action: () => formEditRef?.saveForm()
        }
      ];
    } else if (activeTab === "responses" && selectedFormId) {
      return [
        {
          label: "Export CSV",
          icon: "fa-download",
          action: exportResponses
        },
        {
          label: "Edit Form",
          icon: "fa-edit",
          action: () => selectedFormId !== null && handleEdit(selectedFormId)
        }
      ];
    } else {
      return [
        {
          label: "Create Form",
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
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-clipboard-list"
  ontabChange={handleTabChange}
  subtitle="Create and manage custom forms for your community"
  {tabs}
  title="Forms"
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
            Share Form
          </h2>
          <button
            onclick={() => (showShareLinkModal = false)}
            class="p-2 rounded-lg transition-all hover:scale-110"
            style="background: {$colorStore.primary}20; color: {$colorStore.text};"
            aria-label="Close share modal"
          >
            <i class="fa-solid fa-times"></i>
          </button>
        </div>

        <div class="mb-4 p-3 rounded-lg border" style="background: #3b82f608; border-color: #3b82f620;">
          <div class="flex items-start gap-2 text-xs">
            <i class="fa-solid fa-info-circle flex-shrink-0 mt-0.5" style="color: #3b82f6;"></i>
            <span style="color: {$colorStore.muted};">
              This link is permanent and reusable. Share it anywhere - clicking "Copy" again won't invalidate it.
            </span>
          </div>
        </div>

        <div class="mb-4">
          <label for="f-+page-share-link-428" class="block text-sm mb-2" style="color: {$colorStore.muted};">
            Share Link
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
            Copy to Clipboard
          </button>
          <button
            onclick={() => (showShareLinkModal = false)}
            class="px-6 py-3 rounded-lg font-medium transition-all hover:scale-[1.02]"
            style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
          >
            Close
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
  {:else if activeTab === "responses" && selectedFormId}
    <FormResponses
      formId={selectedFormId}
      onShowNotification={showNotificationMessage}
    />
  {:else if activeTab === "review" && selectedFormId}
    <FormWorkflowReview
      formId={selectedFormId}
      userId={data.user.id}
      onShowNotification={showNotificationMessage}
    />
  {/if}
</DashboardPageLayout>
