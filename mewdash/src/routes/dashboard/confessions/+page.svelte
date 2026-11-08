<!-- routes/dashboard/confessions/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import {
    clientApi,
    confessionsApi,
    guildApi,
    type Confession,
    type ConfessionStats
  } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import SettingsCard from "./components/SettingsCard.svelte";
  import BlacklistCard from "./components/BlacklistCard.svelte";
  import ConfessionsCard from "./components/ConfessionsCard.svelte";
  import { TABS, errorText, idString, type Named, type TabId } from "./components/confessionsModel";

  let channels: Named[] = $state([]);
  let roles: Named[] = $state([]);
  let members: Named[] = $state([]);
  let confessions: Confession[] = $state([]);
  let stats: ConfessionStats | null = $state(null);
  let channelId: string | null = $state(null);
  let logChannelId: string | null = $state(null);
  let blocked: string[] = $state([]);
  let prefix = $state(".");
  let loading = $state(false);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: (err) => notify(errorText(err, m.confessions.pageErrorAutosave()), "error")
  });

  const guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  const tab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TABS.find((id) => id === requested) ?? "settings";
  });

  const labels = $derived<Record<TabId, { label: string; icon: string }>>({
    settings: { label: m.common.settings(), icon: "fa-solid fa-gear" },
    blacklist: { label: m.confessions.tabBlacklist(), icon: "fa-solid fa-user-slash" },
    confessions: { label: m.features.confessionsName(), icon: "fa-solid fa-comment" }
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

  function channelValue(value: unknown): string | null {
    const id = idString(value);
    return id && id !== "0" ? id : null;
  }

  async function reloadConfessions() {
    const id = guildId;
    if (!id) return;
    const [list, summary] = await Promise.all([
      confessionsApi.getConfessions(id),
      confessionsApi.getConfessionStats(id).catch(() => null)
    ]);
    if (guildId !== id) return;
    confessions = list;
    stats = summary;
  }

  async function loadGuildData(id: bigint) {
    loading = true;
    const [
      confessionList,
      summary,
      channel,
      logChannel,
      blacklist,
      textChannels,
      roleList,
      memberList,
      config
    ] = await Promise.allSettled([
      confessionsApi.getConfessions(id),
      confessionsApi.getConfessionStats(id),
      confessionsApi.getConfessionChannel(id),
      confessionsApi.getConfessionLogChannel(id),
      confessionsApi.getConfessionBlacklist(id),
      clientApi.getTextChannels(id),
      clientApi.getRoles(id),
      clientApi.getMembers(id),
      guildApi.getGuildConfig(id)
    ]);
    if (guildId !== id) return;

    for (const result of [confessionList, summary, channel, logChannel, blacklist, textChannels, roleList, memberList, config]) {
      if (result.status === "rejected") logger.error("Failed to load confession data:", result.reason);
    }
    if (confessionList.status === "rejected" && channel.status === "rejected") {
      notify(m.confessions.pageErrorLoad(), "error");
    }

    if (confessionList.status === "fulfilled") confessions = confessionList.value;
    if (summary.status === "fulfilled") stats = summary.value;
    if (channel.status === "fulfilled") channelId = channelValue(channel.value);
    if (logChannel.status === "fulfilled") logChannelId = channelValue(logChannel.value);
    if (blacklist.status === "fulfilled") blocked = blacklist.value.map(idString);
    if (textChannels.status === "fulfilled") {
      channels = textChannels.value.map((x) => ({ id: idString(x.id), name: x.name }));
    }
    if (roleList.status === "fulfilled") {
      roles = (roleList.value as Array<Named & { managed?: boolean }>)
        .filter((role) => idString(role.id) !== idString(id) && !role.managed && !role.name.startsWith("@"))
        .map((role) => ({ id: idString(role.id), name: role.name, color: role.color || 0 }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    if (memberList.status === "fulfilled") {
      members = memberList.value
        .map((x) => ({ id: idString(x.id), name: x.username ?? idString(x.id) }))
        .sort((a, b) => a.name.localeCompare(b.name));
    }
    if (config.status === "fulfilled") prefix = config.value?.prefix || ".";
    loading = false;
  }

  async function refresh() {
    await autoSave.flush();
    if (guildId) await loadGuildData(guildId);
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
  title={m.features.confessionsName()}
  subtitle={m.confessions.pageSubtitle()}
  actionButtons={[{ label: m.common.refresh(), icon: "fa-arrows-rotate", action: refresh, loading }]}
>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1" role="group" aria-label={m.confessions.tabsAria()}>
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
    {#if tab === "settings"}
      <SettingsCard {guildId} {channels} bind:channelId bind:logChannelId {prefix} {autoSave} />
    {:else if tab === "blacklist"}
      <BlacklistCard {guildId} {roles} {members} bind:blocked onerror={(message) => notify(message, "error")} />
    {:else}
      <ConfessionsCard
        {guildId}
        {confessions}
        {stats}
        onreload={reloadConfessions}
        onerror={(message) => notify(message, "error")}
      />
    {/if}
  {/if}
</PluginPage>
