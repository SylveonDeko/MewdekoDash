<!-- routes/dashboard/votes/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { clientApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import RolesTab from "./components/RolesTab.svelte";
  import SetupTab from "./components/SetupTab.svelte";
  import StatsTab from "./components/StatsTab.svelte";
  import { TABS, type Named, type TabId } from "./components/votesModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let channels: Named[] = $state([]);
  let roles: Named[] = $state([]);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: () => notify(m.votes.pageErrorAutosave(), "error")
  });

  const guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  const tab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TABS.find(id => id === requested) ?? "setup";
  });

  const labels = $derived<Record<TabId, { label: string; icon: string }>>({
    setup: { label: m.common.configuration(), icon: "fa-solid fa-gear" },
    roles: { label: m.votes.pageTabRoles(), icon: "fa-solid fa-crown" },
    stats: { label: m.common.statistics(), icon: "fa-solid fa-chart-column" }
  });

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  function select(id: TabId) {
    if (id === tab) return;
    void autoSave.flush();
    const url = new URL(page.url);
    url.search = "";
    url.searchParams.set("tab", id);
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  async function loadGuildData(id: bigint) {
    const results = await Promise.allSettled([
      clientApi.getTextChannels(id).then(value => (channels = value as Named[])),
      clientApi.getRoles(id).then(value => {
        roles = (value as Named[])
          .filter(role => !role.name.startsWith("@"))
          .sort((a, b) => a.name.localeCompare(b.name));
      })
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load vote data:", result.reason);
    }
  }

  $effect(() => {
    if (!$currentGuild) {
      void goto("/dashboard");
      return;
    }
    if (loadedGuildId !== $currentGuild.id.toString()) {
      loadedGuildId = $currentGuild.id.toString();
      void loadGuildData(BigInt($currentGuild.id));
    }
  });
</script>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-[10001]" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

<PluginPage
  {statusMessages}
  {autoSave}
  icon="fa-circle-check"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.votes.pageTitle()}
  subtitle={m.votes.pageSubtitle()}
>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1" role="group" aria-label={m.votes.tabAria()}>
    {#each TABS as id (id)}
      {@const selected = tab === id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => select(id)}
      >
        <i class={labels[id].icon} aria-hidden="true"></i>
        {labels[id].label}
      </button>
    {/each}
  </div>

  {#if guildId}
    {#key `${guildId}:${tab}`}
      {#if tab === "setup"}
        <SetupTab {guildId} {channels} {autoSave} user={data.user} {notify} />
      {:else if tab === "roles"}
        <RolesTab {guildId} {roles} {autoSave} {notify} />
      {:else}
        <StatsTab {guildId} {notify} />
      {/if}
    {/key}
  {/if}
</PluginPage>
