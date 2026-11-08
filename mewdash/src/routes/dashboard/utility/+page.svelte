<!-- routes/dashboard/utility/+page.svelte -->
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
  import AliasesTab from "./components/AliasesTab.svelte";
  import QuotesTab from "./components/QuotesTab.svelte";
  import AutoPublishTab from "./components/AutoPublishTab.svelte";
  import StreamRoleTab from "./components/StreamRoleTab.svelte";
  import AiTab from "./components/AiTab.svelte";
  import NsfwTab from "./components/NsfwTab.svelte";
  import RoleMonitorTab from "./components/RoleMonitorTab.svelte";
  import { TABS, errorText, type Named, type TabId } from "./components/utilityModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let channels: Named[] = $state([]);
  let newsChannels: Named[] = $state([]);
  let roles: Named[] = $state([]);
  let members: Named[] = $state([]);
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
    return TABS.find((id) => id === requested) ?? "aliases";
  });

  const tabs = $derived<Array<{ id: TabId; label: string; icon: string }>>([
    { id: "aliases", label: m.utility.tabAliases(), icon: "fa-terminal" },
    { id: "quotes", label: m.common.quotes(), icon: "fa-quote-left" },
    { id: "autopublish", label: m.utility.tabAutopublish(), icon: "fa-bullhorn" },
    { id: "streamrole", label: m.utility.tabStreamrole(), icon: "fa-video" },
    { id: "ai", label: m.utility.tabAi(), icon: "fa-robot" },
    { id: "nsfw", label: m.utility.tabNsfw(), icon: "fa-eye-slash" },
    { id: "rolemonitor", label: m.utility.rmCardTitle(), icon: "fa-user-shield" }
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
      clientApi.getTextChannels(id).then((value) => (channels = value.map((x) => ({ id: String(x.id), name: x.name })))),
      clientApi.getChannelsByType(id, 5).then((value) => (newsChannels = value.map((x) => ({ id: String(x.id), name: x.name })))),
      clientApi.getRoles(id).then((value) => (roles = value.map((x) => ({ id: String(x.id), name: x.name })))),
      clientApi.getMembers(id).then(
        (value) =>
          (members = value
            .map((x) => ({ id: String(x.id), name: x.displayName || x.username || String(x.id) }))
            .sort((a, b) => a.name.localeCompare(b.name)))
      )
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load utility data:", result.reason);
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
  icon="fa-wrench"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.utilityName()}
  subtitle={m.utility.pageSubtitle()}
>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1" role="group" aria-label={m.utility.tabsAria()}>
    {#each tabs as item (item.id)}
      {@const selected = tab === item.id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => select(item.id)}
      >
        <i class="fa-solid {item.icon}" aria-hidden="true"></i>
        <span class="truncate">{item.label}</span>
      </button>
    {/each}
  </div>

  {#if guildId}
    {#key `${guildId}:${tab}`}
      {@const shared = { guildId, onerror: (message: string) => notify(message, "error"), onsuccess: (message: string) => notify(message) }}
      {#if tab === "aliases"}
        <AliasesTab {...shared} />
      {:else if tab === "quotes"}
        <QuotesTab {...shared} />
      {:else if tab === "autopublish"}
        <AutoPublishTab {...shared} {newsChannels} {members} />
      {:else if tab === "streamrole"}
        <StreamRoleTab {...shared} {roles} {members} {autoSave} />
      {:else if tab === "ai"}
        <AiTab {...shared} {channels} {autoSave} user={data.user} />
      {:else if tab === "nsfw"}
        <NsfwTab {...shared} />
      {:else}
        <RoleMonitorTab {...shared} {roles} {members} {autoSave} />
      {/if}
    {/key}
  {/if}
</PluginPage>
