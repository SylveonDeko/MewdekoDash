<!-- routes/dashboard/administration/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { clientApi, guildChannelsApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import AutomationTab from "./components/tabs/AutomationTab.svelte";
  import CommandsTab from "./components/tabs/CommandsTab.svelte";
  import RolesTab from "./components/tabs/RolesTab.svelte";
  import BackupsTab from "./components/tabs/BackupsTab.svelte";
  import ChannelsTab from "./components/tabs/ChannelsTab.svelte";
  import AdvancedTab from "./components/tabs/AdvancedTab.svelte";
  import { TABS, type Named, type TabId } from "./components/toolsModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let channels: Named[] = $state([]);
  let textChannels: Named[] = $state([]);
  let voiceChannels: Named[] = $state([]);
  let roles: Named[] = $state([]);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: () => notify(m.common.failedToSaveTheSettings(), "error")
  });

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  const tab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TABS.find(id => id === requested) ?? "automation";
  });

  const tabs = $derived([
    { id: "automation", label: m.serverTools.tabAutomation(), icon: "fa-solid fa-gear" },
    { id: "commands", label: m.common.commands(), icon: "fa-solid fa-terminal" },
    { id: "roles", label: m.common.roles(), icon: "fa-solid fa-users" },
    { id: "backups", label: m.serverTools.tabBackups(), icon: "fa-solid fa-box-archive" },
    { id: "channels", label: m.common.channels(), icon: "fa-solid fa-hashtag" },
    { id: "advanced", label: m.common.advanced(), icon: "fa-solid fa-bolt" }
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
      guildChannelsApi.list(id).then(list => {
        const named = (types: string[]) =>
          list
            .filter(channel => types.includes(channel.type))
            .sort((a, b) => a.position - b.position)
            .map(channel => ({ id: String(channel.id), name: channel.name }));
        channels = named(["text", "announcement", "voice", "stage", "forum", "category"]);
        textChannels = named(["text", "announcement"]);
        voiceChannels = named(["voice", "stage"]);
      }),
      clientApi.getRoles(id).then(value => (roles = value as unknown as Named[]))
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load server tools data:", result.reason);
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
  icon="fa-cog"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.administrationName()}
  subtitle={m.serverTools.subtitle()}
>
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2" role="group" aria-label={m.serverTools.tabsAria()}>
    {#each tabs as item (item.id)}
      {@const selected = tab === item.id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
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
      {#if tab === "automation"}
        <AutomationTab {guildId} {channels} {textChannels} {voiceChannels} {roles} {autoSave} {notify} user={data.user} />
      {:else if tab === "commands"}
        <CommandsTab {guildId} {channels} {textChannels} {voiceChannels} {roles} {autoSave} {notify} user={data.user} />
      {:else if tab === "roles"}
        <RolesTab {guildId} {channels} {textChannels} {voiceChannels} {roles} {autoSave} {notify} user={data.user} />
      {:else if tab === "backups"}
        <BackupsTab {guildId} {channels} {textChannels} {voiceChannels} {roles} {autoSave} {notify} user={data.user} />
      {:else if tab === "channels"}
        <ChannelsTab {guildId} {channels} {textChannels} {voiceChannels} {roles} {autoSave} {notify} user={data.user} />
      {:else}
        <AdvancedTab {guildId} {channels} {textChannels} {voiceChannels} {roles} {autoSave} {notify} user={data.user} />
      {/if}
    {/key}
  {/if}
</PluginPage>
