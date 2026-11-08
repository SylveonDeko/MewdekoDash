<!-- routes/dashboard/chatsaver/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { chatApi, clientApi, type ChatLogMessage, type ChatLogSummary } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { logger } from "$lib/logger.ts";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import FetchTab from "./components/FetchTab.svelte";
  import SavedTab from "./components/SavedTab.svelte";
  import LogSheet from "./components/LogSheet.svelte";
  import { buildTranscript, downloadTranscript } from "./components/exportHtml";
  import {
    TABS,
    afterDate,
    errorText,
    type MentionNames,
    type Named,
    type TabId,
    type TimeUnit
  } from "./components/chatModel";

  interface Props {
    data: PageData;
  }

  interface Viewing {
    logId: string | null;
    name: string;
    channelId: string;
    channelName: string;
    messages: ChatLogMessage[];
  }

  const FETCH_CAP = 5000;

  let { data }: Props = $props();

  let channels: Named[] = $state([]);
  let roles: Named[] = $state([]);
  let logs: ChatLogSummary[] = $state([]);
  let logsLoading = $state(true);
  let fetching = $state(false);
  let saving = $state(false);
  let opening: string | null = $state(null);
  let viewing: Viewing | null = $state(null);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedKey = "";

  const tabs = $derived([
    { id: "fetch", label: m.chatsaver.saverTabFetch(), icon: "fa-magnifying-glass" },
    { id: "saved", label: m.chatsaver.saverTabSaved(), icon: "fa-folder" }
  ]);

  const tab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TABS.find(id => id === requested) ?? "fetch";
  });

  const names: MentionNames = $derived.by(() => {
    const users = new Map<string, string>();
    for (const message of viewing?.messages ?? []) users.set(message.author.id, message.author.username);
    return {
      users,
      channels: new Map(channels.map(channel => [String(channel.id), channel.name])),
      roles: new Map(roles.map(role => [String(role.id), role.name])),
      unknownUser: m.chatsaver.saverMentionUserUnknown(),
      unknownChannel: m.chatsaver.saverMentionChannelUnknown(),
      unknownRole: m.common.roleMention()
    };
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
    const url = new URL(page.url);
    url.search = "";
    url.searchParams.set("tab", id);
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  async function loadLogs(guildId: bigint) {
    logsLoading = true;
    try {
      logs = await chatApi.getChatLogs(guildId);
    } catch (err) {
      logger.error("Failed to load saved logs:", err);
      notify(errorText(err, m.chatsaver.saverNotifyLogsFailed()), "error");
    } finally {
      logsLoading = false;
    }
  }

  async function loadGuildData(guildId: bigint) {
    const results = await Promise.allSettled([
      clientApi.getTextChannels(guildId).then(value => (channels = value as Named[])),
      clientApi.getRoles(guildId).then(value => (roles = value as Named[])),
      loadLogs(guildId)
    ]);
    for (const result of results) {
      if (result.status === "rejected") logger.error("Failed to load chat saver data:", result.reason);
    }
  }

  function channelName(id: string): string {
    return channels.find(channel => String(channel.id) === id)?.name ?? id;
  }

  async function fetchMessages(channelId: string, amount: number, unit: TimeUnit) {
    if (!$currentGuild?.id || fetching) return;
    fetching = true;
    try {
      const messages = await chatApi.getChatMessages($currentGuild.id, BigInt(channelId), afterDate(amount, unit));
      if (messages.length === 0) {
        notify(m.chatsaver.saverNotifyNoMessages(), "error");
        return;
      }
      viewing = { logId: null, name: "", channelId, channelName: channelName(channelId), messages };
    } catch (err) {
      logger.error("Failed to fetch messages:", err);
      notify(errorText(err, m.chatsaver.saverNotifyFetchFailed()), "error");
    } finally {
      fetching = false;
    }
  }

  async function saveLog() {
    if (!viewing || saving || viewing.logId) return;
    if (!$currentGuild?.id || !data.user?.id) {
      notify(m.chatsaver.saverNotifyMissingInfo(), "error");
      return;
    }
    saving = true;
    const name = `${viewing.channelName} - ${new Date().toLocaleDateString()}`;
    try {
      const result = await chatApi.saveChatLog($currentGuild.id, {
        channelId: BigInt(viewing.channelId),
        name,
        createdBy: BigInt(data.user.id),
        messages: viewing.messages.map(message => ({
          id: message.id,
          content: message.content || "",
          author: {
            id: message.author.id,
            username: message.author.username,
            avatarUrl: message.author.avatarUrl
          },
          timestamp: message.timestamp,
          attachments: (message.attachments ?? []).map(attachment => ({
            url: attachment.url,
            proxyUrl: attachment.proxyUrl || attachment.url,
            filename: attachment.filename,
            fileSize: attachment.fileSize
          })),
          embeds: (message.embeds ?? []).map(embed => ({
            type: embed.type || "Rich",
            title: embed.title || null,
            description: embed.description || null,
            url: embed.url || null,
            thumbnail: embed.thumbnail || null,
            author: embed.author ? { name: embed.author.name, iconUrl: embed.author.iconUrl || null } : null
          }))
        }))
      });
      viewing = { ...viewing, logId: result.id, name };
      notify(m.chatsaver.saverNotifySaved());
      await loadLogs($currentGuild.id);
    } catch (err) {
      logger.error("Failed to save log:", err);
      notify(errorText(err, m.chatsaver.saverNotifySaveFailed()), "error");
    } finally {
      saving = false;
    }
  }

  async function openLog(log: ChatLogSummary) {
    if (!$currentGuild?.id || opening) return;
    opening = log.id;
    try {
      const full = await chatApi.getChatLog($currentGuild.id, log.id);
      viewing = {
        logId: full.id,
        name: full.name,
        channelId: full.channelId.toString(),
        channelName: full.channelName,
        messages: full.messages ?? []
      };
    } catch (err) {
      logger.error("Failed to load log:", err);
      notify(errorText(err, m.chatsaver.saverNotifyLoadFailed()), "error");
    } finally {
      opening = null;
    }
  }

  async function deleteLog(log: ChatLogSummary) {
    if (!$currentGuild?.id) return;
    const confirmed = await requestConfirmation({ message: m.chatsaver.saverConfirmDelete({ name: log.name }), confirmText: m.common.delete() });
    if (!confirmed) return;
    try {
      await chatApi.deleteChatLog($currentGuild.id, log.id);
      if (viewing?.logId === log.id) viewing = null;
      notify(m.chatsaver.saverNotifyDeleted());
    } catch (err) {
      logger.error("Failed to delete log:", err);
      notify(errorText(err, m.chatsaver.saverNotifyDeleteFailed()), "error");
    }
    await loadLogs($currentGuild.id);
  }

  async function renameLog(name: string) {
    if (!$currentGuild?.id || !viewing?.logId) return;
    try {
      await chatApi.updateChatLogName($currentGuild.id, viewing.logId, name);
      viewing = { ...viewing, name };
      notify(m.chatsaver.saverNotifyRenamed());
      await loadLogs($currentGuild.id);
    } catch (err) {
      logger.error("Failed to rename log:", err);
      notify(errorText(err, m.chatsaver.saverNotifyRenameFailed()), "error");
    }
  }

  function exportLog() {
    if (!viewing) return;
    const html = buildTranscript({
      messages: viewing.messages,
      channelName: viewing.channelName,
      guildName: $currentGuild?.name ?? "",
      accent: $colorStore.primary,
      names
    });
    downloadTranscript(html, viewing.channelName);
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
    const key = $currentGuild.id.toString();
    if (loadedKey !== key) {
      loadedKey = key;
      viewing = null;
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
  icon="fa-folder"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.chatsaverName()}
  subtitle={m.chatsaver.saverSubtitle()}
>
  <div class="grid grid-cols-2 gap-2 [&>:last-child:nth-child(odd)]:col-span-2" role="group" aria-label={m.features.chatsaverName()}>
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

  <div class:hidden={tab !== "fetch"}>
    <FetchTab {channels} loading={fetching} {notify} onload={fetchMessages} />
  </div>
  <div class:hidden={tab !== "saved"}>
    <SavedTab {logs} loading={logsLoading} {opening} onopen={openLog} ondelete={deleteLog} />
  </div>
</PluginPage>

{#if viewing}
  <LogSheet
    title={viewing.logId ? viewing.name : `#${viewing.channelName}`}
    messages={viewing.messages}
    {names}
    savedName={viewing.logId ? viewing.name : null}
    {saving}
    truncated={!viewing.logId && viewing.messages.length >= FETCH_CAP}
    onsave={saveLog}
    onexport={exportLog}
    onrename={renameLog}
    onclose={() => (viewing = null)}
  />
{/if}
