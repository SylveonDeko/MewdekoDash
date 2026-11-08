<!-- routes/dashboard/music/+page.svelte -->
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
  import PlayerTab from "./components/PlayerTab.svelte";
  import TtsTab from "./components/TtsTab.svelte";
  import { TAB_IDS, type Named, type TabId } from "./components/musicModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let channels: Named[] = $state([]);
  let voiceChannels: Named[] = $state([]);
  let roles: Named[] = $state([]);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: () => notify(m.music.notifySaveFailed(), "error")
  });

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);
  let userId = $derived(data.user?.id ? BigInt(data.user.id) : null);

  const tabs = $derived([
    { id: "music", label: m.music.tabPlayer(), icon: "fa-music" },
    { id: "tts", label: m.music.tabTtsShort(), icon: "fa-microphone" }
  ]);

  const tab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TAB_IDS.find(id => id === requested) ?? "music";
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
      clientApi.getVoiceChannels(id).then(value => (voiceChannels = value as Named[])),
      clientApi.getRoles(id).then(value => (roles = value as Named[]))
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load music data:", result.reason);
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
  icon="fa-music"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.musicName()}
  subtitle={m.music.pageSubtitle()}
>
  <div class="grid grid-cols-2 gap-2 [&>:last-child:nth-child(odd)]:col-span-2" role="group" aria-label={m.music.tabsAria()}>
    {#each tabs as item (item.id)}
      {@const selected = tab === item.id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => select(item.id as TabId)}
      >
        <i class="fa-solid {item.icon}" aria-hidden="true"></i>
        {item.label}
      </button>
    {/each}
  </div>

  {#if guildId}
    {#key `${guildId}:${tab}`}
      {#if tab === "music"}
        <PlayerTab {guildId} {userId} {channels} {roles} {autoSave} {notify} />
      {:else}
        <TtsTab {guildId} {channels} {voiceChannels} {roles} {autoSave} {notify} />
      {/if}
    {/key}
  {/if}
</PluginPage>
