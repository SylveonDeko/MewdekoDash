<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import FormWorkflowReview from "$lib/components/forms/FormWorkflowReview.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let formId = $derived(parseInt($page.params.formId));
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");

  function showNotificationMessage(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => (showNotification = false), 3000);
  }

  function goBackToForms() {
    goto("/dashboard/forms");
  }
</script>

<svelte:head>
  <title>Review Responses - {$currentGuild?.name || "Dashboard"} - Mewdeko</title>
  <meta content="Review and manage form submissions" name="description" />
</svelte:head>

{#snippet statusMessagesSnippet()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-50" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<DashboardPageLayout
  actionButtons={[
    {
      label: "Back to Forms",
      icon: "fa-arrow-left",
      action: goBackToForms,
    }
  ]}
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-clipboard-check"
  subtitle="Approve or reject pending submissions"
  tabs={[
    { id: "back", label: "Back to Forms", icon: "fa-arrow-left" }
  ]}
  title="Review Form Responses"
  statusMessages={statusMessagesSnippet}
>
  <FormWorkflowReview
    {formId}
    onShowNotification={showNotificationMessage}
    userId={data.user.id}
  />
</DashboardPageLayout>
