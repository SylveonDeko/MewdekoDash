<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import { fade } from "svelte/transition";
  import { m } from "$lib/i18n";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import ResponsesTab from "../../components/ResponsesTab.svelte";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const formId = $derived.by(() => {
    const parsed = parseInt(page.params.formId ?? "");
    return Number.isNaN(parsed) ? null : parsed;
  });

  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }
</script>

<svelte:head>
  <title>{m.forms.reviewHeadTitle({ guild: $currentGuild?.name || m.common.dashboard() })}</title>
  <meta content={m.forms.reviewHeadDescription()} name="description" />
</svelte:head>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-[10001]" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<PluginPage
  {statusMessages}
  icon="fa-clipboard-check"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.forms.reviewTitle()}
  subtitle={m.forms.reviewSubtitle()}
  actionButtons={[{ label: m.forms.reviewBack(), icon: "fa-arrow-left", action: () => goto("/dashboard/forms") }]}
>
  <ResponsesTab forms={[]} {formId} userId={BigInt(data.user.id)} {notify} fixedForm />
</PluginPage>
