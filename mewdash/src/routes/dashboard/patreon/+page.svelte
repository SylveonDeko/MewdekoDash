<!-- routes/dashboard/patreon/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { clientApi, patreonApi, type PatreonOAuthStatusResponse } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import OverviewTab from "./components/OverviewTab.svelte";
  import SupportersTab from "./components/SupportersTab.svelte";
  import TiersTab from "./components/TiersTab.svelte";
  import SettingsTab from "./components/SettingsTab.svelte";
  import { errorText, TABS, type Named, type TabId } from "./components/patreonModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let status: PatreonOAuthStatusResponse | null = $state(null);
  let channels: Named[] = $state([]);
  let roles: Named[] = $state([]);
  let loading = $state(true);
  let error: string | null = $state(null);
  let connecting = $state(false);
  let refreshKey = $state(0);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: () => notify(m.patreon.notifyConfigFailed(), "error")
  });

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  const tab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TABS.find((id) => id === requested) ?? "overview";
  });

  const labels = $derived<Record<TabId, { label: string; icon: string }>>({
    overview: { label: m.common.overview(), icon: "fa-solid fa-heart" },
    supporters: { label: m.patreon.supportersTitle(), icon: "fa-solid fa-users" },
    tiers: { label: m.patreon.tabTiers(), icon: "fa-solid fa-star" },
    settings: { label: m.common.settings(), icon: "fa-solid fa-gear" }
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

  async function loadStatus(id: bigint) {
    loading = true;
    error = null;
    try {
      status = await patreonApi.getPatreonOAuthStatus(id);
    } catch (err) {
      logger.error("Failed to load Patreon status:", err);
      error = errorText(err, m.common.failedToLoadData());
    } finally {
      loading = false;
    }
  }

  async function loadGuildData(id: bigint) {
    const results = await Promise.allSettled([
      clientApi.getTextChannels(id).then((value) => (channels = value as Named[])),
      clientApi.getRoles(id).then((value) => (roles = value as Named[])),
      loadStatus(id)
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load Patreon data:", result.reason);
    }
  }

  async function connect() {
    if (!guildId) return;
    connecting = true;
    try {
      const oauth = await patreonApi.getPatreonOAuthUrl(guildId);
      window.location.href = oauth.authorizationUrl;
    } catch (err) {
      logger.error("Failed to get the Patreon OAuth URL:", err);
      notify(errorText(err, m.patreon.errorOauthStart()), "error");
      connecting = false;
    }
  }

  async function refresh() {
    if (!guildId) return;
    await loadStatus(guildId);
    refreshKey++;
  }

  async function handleReturn() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const success = url.searchParams.get("success");
    const failure = url.searchParams.get("error");
    if (!code && !state && !success && !failure) return;

    for (const key of ["code", "state", "success", "error"]) url.searchParams.delete(key);
    void goto(url, { replaceState: true, noScroll: true });

    if (code && state) {
      if (!state.split(":")[0]) {
        notify(m.patreon.errorOauthState(), "error");
        return;
      }
      try {
        const result = await patreonApi.handlePatreonOAuthCallback(code, state);
        notify(result.message || m.patreon.notifyConfigured());
        if (guildId) await loadStatus(guildId);
      } catch (err) {
        logger.error("Patreon OAuth callback failed:", err);
        notify(errorText(err, m.patreon.errorConfigureFailed()), "error");
      }
    } else if (success === "true") {
      notify(m.patreon.notifyConfigured());
    } else if (failure) {
      notify(decodeURIComponent(failure), "error");
    }
  }

  onMount(() => {
    void handleReturn();
  });

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
      status = null;
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
  icon="fa-heart"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.patreon.pageTitle()}
  subtitle={m.patreon.pageSubtitle()}
  actionButtons={status?.isConfigured
    ? [{ label: m.common.refreshData(), icon: "fa-arrows-rotate", action: refresh, loading }]
    : []}
>
  {#if loading && !status}
    <div class="flex justify-center py-12">
      <div class="w-10 h-10 border-4 rounded-full animate-spin"
           style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"></div>
    </div>
  {:else if error}
    <PluginCard title={m.common.error()} alwaysOpen>
      <p class="text-sm" style="color: {$colorStore.text}">{error}</p>
      <button type="button" class="px-5 rounded-xl min-h-[50px] font-medium"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              onclick={refresh}>
        {m.common.retry()}
      </button>
    </PluginCard>
  {:else if status && !status.isConfigured}
    <PluginCard title={m.patreon.connectTitle()} alwaysOpen>
      <button type="button" class="px-6 rounded-xl min-h-[50px] font-semibold flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50"
              style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
              disabled={connecting} onclick={connect}>
        <i class="fa-solid fa-heart" aria-hidden="true"></i>
        {connecting ? m.patreon.connectConnecting() : m.patreon.connectButton()}
      </button>
    </PluginCard>
  {:else if status && guildId}
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1" role="group" aria-label={m.patreon.tabsAria()}>
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

    {#key `${guildId}:${tab}:${refreshKey}`}
      {#if tab === "overview"}
        <OverviewTab {guildId} {status} {notify} ondisconnect={refresh} />
      {:else if tab === "supporters"}
        <SupportersTab {guildId} {notify} />
      {:else if tab === "tiers"}
        <TiersTab {guildId} {roles} {notify} />
      {:else}
        <SettingsTab {guildId} {channels} {autoSave} user={data.user} {notify} />
      {/if}
    {/key}
  {/if}
</PluginPage>
