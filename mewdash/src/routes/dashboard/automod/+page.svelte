<!-- routes/dashboard/automod/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import { clientApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import DiscordTab from "./components/discord/DiscordTab.svelte";
  import FiltersTab from "./components/filters/FiltersTab.svelte";
  import ProtectionTab from "./components/protection/ProtectionTab.svelte";
  import { errorText, TABS, type Named, type TabId } from "./components/automodModel";

  let channels: Named[] = $state([]);
  let roles: Named[] = $state([]);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: (err) => notify(errorText(err, m.common.failedToSaveTheSettings()), "error")
  });

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  const tab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TABS.find((id) => id === requested) ?? "protection";
  });

  const tabs = $derived([
    { id: "protection", label: m.common.protection(), icon: "fa-solid fa-shield" },
    { id: "filters", label: m.common.filters(), icon: "fa-solid fa-filter" },
    { id: "discord", label: m.automod.tabDiscord(), icon: "fa-brands fa-discord" }
  ]);

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
      clientApi.getTextChannels(id).then((value) => (channels = value as Named[])),
      clientApi.getRoles(id).then((value) => (roles = value as unknown as Named[]))
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load automod data:", result.reason);
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
  icon="fa-shield-halved"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.automod.title()}
  subtitle={m.automod.subtitle()}
>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-label={m.automod.tabsAria()}>
    {#each tabs as item, index (item.id)}
      {@const selected = tab === item.id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 {index === tabs.length - 1 && tabs.length % 2 === 1 ? 'col-span-2 sm:col-span-1' : ''}"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => select(item.id as TabId)}
      >
        <i class={item.icon} aria-hidden="true"></i>
        {item.label}
      </button>
    {/each}
  </div>

  {#if guildId}
    {#key `${guildId}:${tab}`}
      {#if tab === "protection"}
        <ProtectionTab {guildId} {channels} {roles} {autoSave} {notify} />
      {:else if tab === "filters"}
        <FiltersTab {guildId} {channels} {autoSave} {notify} />
      {:else}
        <DiscordTab {guildId} {channels} {roles} {autoSave} {notify} />
      {/if}
    {/key}
  {/if}
</PluginPage>
