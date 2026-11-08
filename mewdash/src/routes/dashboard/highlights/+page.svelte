<!-- routes/dashboard/highlights/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import { clientApi, highlightsApi } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import DisabledTab from "./components/DisabledTab.svelte";
  import MemberSheet from "./components/MemberSheet.svelte";
  import MembersTab from "./components/MembersTab.svelte";
  import StatsTab from "./components/StatsTab.svelte";
  import {
    errorText,
    groupByMember,
    TABS,
    type DisabledUser,
    type HighlightRow,
    type HighlightStats,
    type Member,
    type Named,
    type TabId
  } from "./components/highlightsModel";

  let rows: HighlightRow[] = $state([]);
  let stats: HighlightStats | null = $state(null);
  let disabled: DisabledUser[] = $state([]);
  let channels: Named[] = $state([]);
  let loading = $state(true);
  let openUserId: string | null = $state(null);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedGuildId = "";

  const guildId = $derived($currentGuild?.id ? BigInt($currentGuild.id) : null);

  const tab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TABS.find(id => id === requested) ?? "members";
  });

  const labels = $derived<Record<TabId, { label: string; icon: string }>>({
    members: { label: m.highlights.tabMembers(), icon: "fa-solid fa-bolt" },
    disabled: { label: m.highlights.pageTabDisabled(), icon: "fa-solid fa-eye-slash" },
    stats: { label: m.common.statistics(), icon: "fa-solid fa-chart-column" }
  });

  const openMember = $derived(
    openUserId === null ? null : (groupByMember(rows).find(member => member.userId === openUserId) ?? null)
  );

  const actionButtons = $derived([
    { label: m.common.refresh(), icon: "fa-arrows-rotate", action: () => void load(), loading }
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
    const url = new URL(page.url);
    url.search = "";
    url.searchParams.set("tab", id);
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  async function load() {
    if (!guildId) return;
    loading = true;
    const id = guildId;
    const results = await Promise.allSettled([
      highlightsApi.getAllHighlights(id),
      highlightsApi.getHighlightStats(id),
      highlightsApi.getDisabledUsers(id)
    ]);
    if (guildId !== id) return;
    if (results[0].status === "fulfilled") rows = results[0].value as HighlightRow[];
    if (results[1].status === "fulfilled") stats = results[1].value;
    if (results[2].status === "fulfilled") disabled = results[2].value;
    for (const result of results) {
      if (result.status === "rejected") {
        logger.error("Failed to load highlight data:", result.reason);
        notify(m.highlights.pageErrorLoad(), "error");
        break;
      }
    }
    loading = false;
  }

  async function removeWord(row: HighlightRow) {
    if (!guildId) return;
    const confirmed = await requestConfirmation({ message: m.highlights.pageConfirmDelete(), confirmText: m.common.delete() });
    if (!confirmed) return;
    try {
      await highlightsApi.removeHighlight(guildId, row.id);
      notify(m.highlights.pageNotifyDeleted());
    } catch (err) {
      logger.error("Failed to delete highlight:", err);
      notify(errorText(err, m.highlights.pageErrorDelete()), "error");
    }
    await load();
  }

  async function removeAll(member: Member) {
    if (!guildId) return;
    const name = member.username ?? m.common.userFallback({ id: member.userId });
    const confirmed = await requestConfirmation({
      message: m.highlights.pageConfirmDeleteUser({ username: name }),
      confirmText: m.highlights.pageDeleteAll()
    });
    if (!confirmed) return;
    try {
      const result = await highlightsApi.removeUserHighlights(guildId, BigInt(member.userId));
      notify(m.highlights.pageNotifyDeletedCount({ count: result.removedCount }));
      if (openUserId === member.userId) openUserId = null;
    } catch (err) {
      logger.error("Failed to delete user highlights:", err);
      notify(errorText(err, m.highlights.pageErrorDeleteMany()), "error");
    }
    await load();
  }

  async function removeEverywhere(word: string) {
    if (!guildId) return;
    const confirmed = await requestConfirmation({
      message: m.highlights.confirmRemoveWord({ word }),
      confirmText: m.common.remove()
    });
    if (!confirmed) return;
    try {
      const result = await highlightsApi.removeWord(guildId, word);
      notify(m.highlights.pageNotifyDeletedCount({ count: result.removedCount }));
    } catch (err) {
      logger.error("Failed to remove word:", err);
      notify(errorText(err, m.highlights.pageErrorDeleteMany()), "error");
    }
    await load();
  }

  $effect(() => {
    if (!$currentGuild) {
      void goto("/dashboard");
      return;
    }
    if (loadedGuildId !== $currentGuild.id.toString()) {
      loadedGuildId = $currentGuild.id.toString();
      openUserId = null;
      void load();
      clientApi
        .getTextChannels(BigInt($currentGuild.id))
        .then(value => (channels = value as Named[]))
        .catch(err => logger.error("Failed to load channels:", err));
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
  {actionButtons}
  icon="fa-bolt"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.highlightsName()}
  subtitle={m.highlights.pageSubtitle()}
>
  <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1" role="group" aria-label={m.highlights.tabAria()}>
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
    {#key tab}
      {#if tab === "members"}
        <MembersTab {rows} {loading} onopen={member => (openUserId = member.userId)} onremoveall={removeAll} />
      {:else if tab === "disabled"}
        <DisabledTab users={disabled} {loading} />
      {:else}
        <StatsTab {stats} {rows} {loading} onremoveword={removeEverywhere} />
      {/if}
    {/key}

    {#if openMember}
      <MemberSheet
        {guildId}
        member={openMember}
        {channels}
        onclose={() => (openUserId = null)}
        onremoveword={removeWord}
        onremoveall={removeAll}
      />
    {/if}
  {/if}
</PluginPage>
