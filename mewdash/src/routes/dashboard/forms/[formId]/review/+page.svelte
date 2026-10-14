<script lang="ts">
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import FormResponseQueue from "$lib/components/forms/FormResponseQueue.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { fade } from "svelte/transition";
  import { m } from "$lib/i18n";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let formId = $derived(parseInt($page.params.formId ?? ""));
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
  <title>{m.forms.reviewHeadTitle({ guild: $currentGuild?.name || m.common.dashboard() })}</title>
  <meta content={m.forms.reviewHeadDescription()} name="description" />
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
      label: m.forms.reviewBack(),
      icon: "fa-arrow-left",
      action: goBackToForms,
    }
  ]}
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-clipboard-check"
  subtitle={m.forms.reviewSubtitle()}
  tabs={[
    { id: "back", label: m.forms.reviewBack(), icon: "fa-arrow-left" }
  ]}
  title={m.forms.reviewTitle()}
  statusMessages={statusMessagesSnippet}
>
  <FormResponseQueue
    {formId}
    onShowNotification={showNotificationMessage}
    userId={data.user.id}
  />
</DashboardPageLayout>
