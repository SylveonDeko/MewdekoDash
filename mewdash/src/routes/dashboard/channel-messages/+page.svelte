<!-- routes/dashboard/channel-messages/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto, replaceState } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { clientApi } from "$lib/api/index.ts";
  import type { GuildEmojiInfo } from "$lib/api/client/models";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import RepeatersTab from "./components/RepeatersTab.svelte";
  import StickiesTab from "./components/StickiesTab.svelte";
  import ReactionsTab from "./components/ReactionsTab.svelte";
  import { errorText, idString, TABS, type ForumChannel, type Named, type Tab } from "./components/model";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let channels: Named[] = $state([]);
  let forums: ForumChannel[] = $state([]);
  let roles: Named[] = $state([]);
  let members: Named[] = $state([]);
  let emojis: GuildEmojiInfo[] = $state([]);
  let loading = $state(true);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const initialTab = page.url.searchParams.get("tab");
  let tab: Tab = $state(TABS.includes(initialTab as Tab) ? (initialTab as Tab) : "repeaters");

  const tabs = $derived([
    { id: "repeaters", label: m.channelMessages.tabRepeaters(), icon: "fa-clock" },
    { id: "stickies", label: m.channelMessages.tabStickies(), icon: "fa-thumbtack" },
    { id: "reactions", label: m.channelMessages.tabReactions(), icon: "fa-face-smile" }
  ]);

  const autoSave = createAutoSave({
    onError: (err) => notify(errorText(err, m.common.failedToSaveTheSettings()), "error")
  });

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => {
      showNotification = false;
    }, 3000);
  }

  function selectTab(next: Tab) {
    void autoSave.flush();
    tab = next;
    const url = new URL(page.url);
    url.searchParams.set("tab", next);
    replaceState(url, page.state);
  }

  async function loadGuildData(id: bigint) {
    loading = true;
    const results = await Promise.allSettled([
      clientApi.getTextChannels(id).then(value => (channels = value.map(x => ({ id: idString(x.id), name: x.name })))),
      clientApi.getForumChannels(id).then(
        value =>
          (forums = value.map(x => ({
            id: idString(x.id),
            name: x.name,
            tags: (x.tags ?? []).map(tag => ({ id: idString(tag.id), name: tag.name }))
          })))
      ),
      clientApi
        .getRoles(id)
        .then(
          value =>
            (roles = (value as Array<{ id: unknown; name: string; color?: number }>).map(x => ({
              id: idString(x.id),
              name: x.name,
              color: x.color
            })))
        ),
      clientApi
        .getMembers(id)
        .then(
          value =>
            (members = value
              .map(x => ({ id: idString(x.id), name: x.username ?? idString(x.id) }))
              .sort((a, b) => a.name.localeCompare(b.name)))
        ),
      data.user?.id ? clientApi.getEmojis(data.user.id, true).then(value => (emojis = value)) : Promise.resolve()
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load channel messages data:", result.reason);
    }
    loading = false;
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
  icon="fa-comment"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.channelMessagesName()}
  subtitle={m.channelMessages.pageSubtitle()}
>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-label={m.features.channelMessagesName()}>
    {#each tabs as item, index (item.id)}
      {@const selected = tab === item.id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2 {index === tabs.length - 1 && tabs.length % 2 === 1 ? 'col-span-2 sm:col-span-1' : ''}"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => selectTab(item.id as Tab)}
      >
        <i class="fa-solid {item.icon}" aria-hidden="true"></i>
        {item.label}
      </button>
    {/each}
  </div>

  <div class="space-y-4">
    {#if guildId}
      {#key guildId}
        {@const shared = { guildId, channels, forums, roles, members, emojis, loading }}
        {#if tab === "repeaters"}
          <RepeatersTab
            {shared}
            {autoSave}
            user={data.user}
            onerror={(message) => notify(message, "error")}
            onsuccess={(message) => notify(message)}
          />
        {:else if tab === "stickies"}
          <StickiesTab
            {shared}
            {autoSave}
            user={data.user}
            onerror={(message) => notify(message, "error")}
            onsuccess={(message) => notify(message)}
          />
        {:else}
          <ReactionsTab
            {shared}
            {autoSave}
            onerror={(message) => notify(message, "error")}
            onsuccess={(message) => notify(message)}
          />
        {/if}
      {/key}
    {/if}
  </div>
</PluginPage>
