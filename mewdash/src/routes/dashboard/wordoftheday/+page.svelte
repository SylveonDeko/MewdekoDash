<!-- routes/dashboard/wordoftheday/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { clientApi, wordOfTheDayApi, type WordOfTheDayHistoryEntry } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import HistoryTab from "./components/HistoryTab.svelte";
  import ScheduleTab from "./components/ScheduleTab.svelte";
  import SettingsTab from "./components/SettingsTab.svelte";
  import WordsTab from "./components/WordsTab.svelte";
  import { createWotdConfig } from "./components/wotdConfig.svelte";
  import { errorText, TAB_IDS, type Named, type TabId } from "./components/wotdModel";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  let channels: Named[] = $state([]);
  let roles: Named[] = $state([]);
  let history: WordOfTheDayHistoryEntry[] = $state([]);
  let historyLoading = $state(true);
  let loaded = $state(false);
  let posting = $state(false);
  let resetting = $state(false);
  let templateWarning = $state("");
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const autoSave = createAutoSave({
    onError: () => notify(m.common.failedToSaveTheSettings(), "error")
  });

  let guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);
  const wotd = createWotdConfig(() => guildId ?? 0n, () => autoSave);

  const tabs = $derived([
    { id: "settings", label: m.common.settings(), icon: "fa-gear" },
    { id: "schedule", label: m.common.schedule(), icon: "fa-calendar" },
    { id: "words", label: m.wordoftheday.tabWords(), icon: "fa-list" },
    { id: "history", label: m.common.history(), icon: "fa-clock-rotate-left" }
  ]);

  const tab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TAB_IDS.find((id) => id === requested) ?? "settings";
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

  async function loadHistory(id: bigint) {
    historyLoading = true;
    try {
      history = await wordOfTheDayApi.getHistory(id, 30);
    } catch (err) {
      logger.error("Failed to load word history:", err);
    } finally {
      historyLoading = false;
    }
  }

  async function loadAll(id: bigint) {
    const results = await Promise.allSettled([
      wotd.load().then(() => (loaded = true)),
      clientApi.getTextChannels(id).then((value) => (channels = value.map((c: any) => ({ id: c.id.toString(), name: c.name })))),
      clientApi.getRoles(id).then(
        (value) =>
          (roles = value
            .filter((r: any) => r.id.toString() !== id.toString() && !r.managed && !r.name.startsWith("@"))
            .map((r: any) => ({ id: r.id.toString(), name: r.name, color: r.color || 0 }))
            .sort((a: Named, b: Named) => a.name.localeCompare(b.name)))
      ),
      loadHistory(id)
    ]);
    for (const result of results) {
      if (result.status === "rejected") {
        logger.error("Failed to load word of the day data:", result.reason);
        notify(m.wordoftheday.notifyLoadFailed(), "error");
        break;
      }
    }
  }

  async function postNow() {
    if (!guildId || posting) return;
    posting = true;
    try {
      const result = await wordOfTheDayApi.postNow(guildId);
      templateWarning = result.usedFallback ? result.warning || m.wordoftheday.templateFallbackWarning() : "";
      notify(m.wordoftheday.notifyPosted({ word: result.entry.word }));
      await Promise.allSettled([loadHistory(guildId), wotd.load()]);
    } catch (err) {
      logger.error("Failed to post word of the day:", err);
      notify(errorText(err, m.wordoftheday.notifyPostFailed()), "error");
    } finally {
      posting = false;
    }
  }

  async function reset() {
    if (!guildId || resetting) return;
    const ok = await requestConfirmation({
      title: m.wordoftheday.resetTitle(),
      message: m.wordoftheday.resetMessage(),
      confirmText: m.common.resetEverything(),
      variant: "danger"
    });
    if (!ok) return;
    resetting = true;
    try {
      await autoSave.flush();
      await wordOfTheDayApi.resetConfig(guildId);
      await loadAll(guildId);
      reloadKey++;
    } catch (err) {
      logger.error("Failed to reset word of the day config:", err);
      notify(errorText(err, m.common.failedToResetConfiguration()), "error");
    } finally {
      resetting = false;
    }
  }

  function toggle(enabled: boolean) {
    if (enabled && !wotd.form.channelId) {
      notify(m.wordoftheday.enableNeedsChannel(), "error");
      return;
    }
    wotd.setEnabled(enabled);
  }

  let reloadKey = $state(0);

  const actionButtons = $derived([
    { label: m.wordoftheday.actionPostNow(), icon: "fa-paper-plane", action: postNow, loading: posting, disabled: !wotd.form.channelId },
    {
      label: m.common.refresh(),
      icon: "fa-arrows-rotate",
      action: () => {
        if (guildId) void loadAll(guildId).then(() => reloadKey++);
      }
    }
  ]);

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
      loaded = false;
      void loadAll(BigInt($currentGuild.id));
    }
  });
</script>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-[10001]" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
  {#if templateWarning}
    <div
      class="mb-4 p-3 rounded-lg border flex items-start gap-3"
      style="background: {$colorStore.primary}12; border-color: {$colorStore.primary}30;"
    >
      <div class="grow min-w-0">
        <p class="font-medium" style="color: {$colorStore.text}">{m.wordoftheday.warningTitle()}</p>
        <p class="text-sm break-words" style="color: {$colorStore.muted}">{templateWarning}</p>
      </div>
      <button
        type="button"
        class="shrink-0 min-h-[44px] min-w-[44px] rounded-lg"
        style="color: {$colorStore.text}"
        aria-label={m.common.dismiss()}
        onclick={() => (templateWarning = "")}
      >
        <i class="fa-solid fa-xmark" aria-hidden="true"></i>
      </button>
    </div>
  {/if}
{/snippet}

<PluginPage
  {statusMessages}
  {autoSave}
  {actionButtons}
  icon="fa-book-open"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.wordofthedayName()}
  subtitle={m.features.wordofthedayDescription()}
  enabled={wotd.form.enabled}
  onToggle={toggle}
>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1" role="group" aria-label={m.wordoftheday.tabsAria()}>
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

  {#if guildId && loaded}
    {#key `${guildId}:${tab}:${reloadKey}`}
      {#if tab === "settings"}
        <SettingsTab {wotd} {channels} {roles} {autoSave} user={data.user} onreset={reset} {resetting} />
      {:else if tab === "schedule"}
        <ScheduleTab {guildId} {notify} />
      {:else if tab === "words"}
        <WordsTab {guildId} userId={data.user?.id?.toString() ?? null} {notify} />
      {:else}
        <HistoryTab {history} lastPostedDate={wotd.lastPostedDate} loading={historyLoading} />
      {/if}
    {/key}
  {/if}
</PluginPage>
