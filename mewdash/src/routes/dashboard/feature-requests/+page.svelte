<!-- routes/dashboard/feature-requests/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";
  import { ownershipApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import BrowseTab from "./components/BrowseTab.svelte";
  import MineTab from "./components/MineTab.svelte";
  import SettingsTab from "./components/SettingsTab.svelte";
  import SuggestTab from "./components/SuggestTab.svelte";
  import type { TabId } from "./components/requestModel";

  let { data } = $props();

  let owner = $state(false);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");

  const autoSave = createAutoSave();

  const tabs = $derived<Array<{ id: TabId; label: string; icon: string }>>([
    { id: "browse", label: m.featureRequests.tabBrowse(), icon: "fa-solid fa-lightbulb" },
    { id: "suggest", label: m.featureRequests.tabSuggest(), icon: "fa-solid fa-paper-plane" },
    { id: "mine", label: m.featureRequests.tabMine(), icon: "fa-solid fa-user" },
    ...(owner ? [{ id: "settings" as TabId, label: m.common.settings(), icon: "fa-solid fa-gear" }] : [])
  ]);

  const tab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return tabs.find(entry => entry.id === requested)?.id ?? "browse";
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

  onMount(async () => {
    try {
      owner = await ownershipApi.isOwner(BigInt(data.user.id));
    } catch (err) {
      logger.error("Owner check failed:", err);
      owner = false;
    }
  });

  $effect(() => {
    if (!$currentGuild) return;
    if ($currentGuild.icon) {
      const serverIconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${$currentGuild.icon.startsWith("a_") ? "gif" : "png"}`;
      colorStore.extractFromServerIcon(serverIconUrl);
    } else if ($currentInstance?.botAvatar) {
      colorStore.extractFromImage($currentInstance.botAvatar);
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
  icon="fa-lightbulb"
  guildName={$currentGuild?.name ?? "Mewdeko"}
  title={m.features.featureRequestsName()}
  subtitle={m.features.featureRequestsDescription()}
>
  <div
    class="grid grid-cols-2 gap-2 {tabs.length === 4 ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}"
    role="group"
    aria-label={m.features.featureRequestsName()}
  >
    {#each tabs as entry (entry.id)}
      {@const selected = tab === entry.id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => select(entry.id)}
      >
        <i class={entry.icon} aria-hidden="true"></i>
        {entry.label}
      </button>
    {/each}
  </div>

  {#key `${tab}:${owner}`}
    {#if tab === "browse"}
      <BrowseTab {owner} {notify} onsuggest={() => select("suggest")} />
    {:else if tab === "suggest"}
      <SuggestTab {notify} onopenmine={() => select("mine")} />
    {:else if tab === "mine"}
      <MineTab {owner} {notify} onsuggest={() => select("suggest")} />
    {:else if owner}
      <SettingsTab {autoSave} {notify} />
    {/if}
  {/key}
</PluginPage>
