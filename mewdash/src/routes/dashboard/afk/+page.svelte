<!-- routes/dashboard/afk/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { clientApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import SettingsTab from "./components/SettingsTab.svelte";
  import MembersTab from "./components/MembersTab.svelte";
  import { TABS, type Named, type TabId } from "./components/afkModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let channels: Named[] = $state([]);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: () => notify(m.afk.notifySaveFailed(), "error")
  });

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  const tab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TABS.find((id) => id === requested) ?? "settings";
  });

  const labels = $derived<Record<TabId, { label: string; icon: string }>>({
    settings: { label: m.common.settings(), icon: "fa-solid fa-gear" },
    members: { label: m.common.members(), icon: "fa-solid fa-users" }
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

  async function loadChannels(id: bigint) {
    try {
      channels = await clientApi.getTextChannels(id);
    } catch (err) {
      logger.error("Failed to load channels:", err);
    }
  }

  $effect(() => {
    if (!$currentGuild) {
      void goto("/dashboard");
      return;
    }
    if ($currentGuild.icon) {
      const serverIconUrl = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${$currentGuild.icon.startsWith("a_") ? "gif" : "png"}`;
      colorStore.extractFromServerIcon(serverIconUrl);
    } else if ($currentInstance?.botAvatar) {
      colorStore.extractFromImage($currentInstance.botAvatar);
    }
    if (loadedGuildId !== $currentGuild.id.toString()) {
      loadedGuildId = $currentGuild.id.toString();
      void loadChannels(BigInt($currentGuild.id));
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
  icon="fa-moon"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.afk.pageTitle()}
  subtitle={m.afk.pageSubtitle()}
>
  <div class="grid grid-cols-2 gap-2 [&>:last-child:nth-child(odd)]:col-span-2" role="group" aria-label={m.afk.tabsAria()}>
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
      {#if tab === "settings"}
        <SettingsTab {guildId} {channels} {autoSave} user={data.user} {notify} />
      {:else}
        <MembersTab {guildId} {notify} />
      {/if}
    {/key}
  {/if}
</PluginPage>
