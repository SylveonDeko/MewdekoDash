<!-- routes/dashboard/liveboards/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import {
    clientApi,
    liveBoardsApi,
    LiveBoardKind,
    ReportFrequency,
    liveBoardKindLabels,
    statsRangeLabels,
    type LiveBoard,
    type LiveBoardKindValue,
    type ServerReportRequest,
    type ServerReportSettings,
    type StatsRangeValue
  } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore.ts";
  import { logger } from "$lib/logger.ts";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import WindowPicker from "$lib/components/stats/WindowPicker.svelte";
  import { formatAgo, rangeOptions } from "$lib/components/stats/format";
  import Sheet from "$lib/components/ui/Sheet.svelte";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const TABS = ["boards", "reports"] as const;
  type TabId = (typeof TABS)[number];

  type Named = { id: string; name: string };
  type Draft = {
    id: number | null;
    channelId: string | null;
    kind: number;
    range: number;
    pin: boolean;
    entries: number | null;
    interval: number | null;
  };

  let channels = $state<Named[]>([]);
  let boards = $state<LiveBoard[]>([]);
  let report = $state<ServerReportSettings | null>(null);
  let loading = $state(true);
  let busy = $state(false);
  let refreshing = $state(false);
  let sending = $state(false);
  let draft = $state<Draft | null>(null);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedFor = "";

  const autoSave = createAutoSave({
    onError: () => notify(m.liveboards.errorSaveReport(), "error")
  });

  const tab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TABS.find((id) => id === requested) ?? "boards";
  });

  const tabLabels = $derived<Record<TabId, { label: string; icon: string }>>({
    boards: { label: m.features.liveboardsName(), icon: "fa-solid fa-thumbtack" },
    reports: { label: m.liveboards.tabReports(), icon: "fa-solid fa-newspaper" }
  });

  const buttonStyle = $derived(`background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`);
  const quietStyle = $derived(
    `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );
  const inputStyle = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}20;`);
  const kindOptions = $derived(Object.entries(liveBoardKindLabels).map(([value, label]) => ({ id: value, name: label })));
  const frequencyOptions = $derived([
    { value: ReportFrequency.Daily, label: m.common.daily() },
    { value: ReportFrequency.Weekly, label: m.liveboards.frequencyWeekly() },
    { value: ReportFrequency.Monthly, label: m.liveboards.frequencyMonthly() }
  ]);

  function hasRows(kind: number): boolean {
    return (
      kind === LiveBoardKind.InviteLeaderboard ||
      kind === LiveBoardKind.MessageLeaderboard ||
      kind === LiveBoardKind.VoiceLeaderboard ||
      kind === LiveBoardKind.ActivityLeaderboard
    );
  }

  const canSave = $derived(!!draft && (draft.id !== null || !!draft.channelId));

  function notify(message: string, type: "success" | "error" = "success") {
    notificationMessage = message;
    notificationType = type;
    showNotification = true;
    setTimeout(() => (showNotification = false), 3000);
  }

  function errorText(err: unknown, fallback: string): string {
    return err instanceof Error && err.message ? err.message : fallback;
  }

  function channelName(id: bigint | string | null | undefined): string {
    if (!id) return "-";
    const key = id.toString();
    return channels.find((c) => c.id.toString() === key)?.name ?? key;
  }

  function selectTab(id: TabId) {
    if (id === tab) return;
    void autoSave.flush();
    const url = new URL(page.url);
    url.search = "";
    url.searchParams.set("tab", id);
    void goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }

  async function load(guildId: bigint) {
    loading = true;
    const results = await Promise.allSettled([
      clientApi.getTextChannels(guildId).then((list) => (channels = list as Named[])),
      liveBoardsApi.list(guildId).then((list) => (boards = list)),
      liveBoardsApi.getReport(guildId).then((settings) => (report = settings))
    ]);
    for (const result of results) {
      if (result.status === "rejected") {
        logger.error("Failed to load live boards:", result.reason);
        notify(errorText(result.reason, m.liveboards.errorLoadBoards()), "error");
      }
    }
    loading = false;
  }

  function startNew() {
    draft = { id: null, channelId: null, kind: LiveBoardKind.InviteLeaderboard, range: 2, pin: true, entries: 10, interval: 15 };
  }

  function edit(board: LiveBoard) {
    draft = {
      id: board.id,
      channelId: board.channelId.toString(),
      kind: board.kind,
      range: board.range,
      pin: board.pin,
      entries: board.entries,
      interval: board.intervalMinutes
    };
  }

  async function save() {
    if (!draft || !$currentGuild?.id || busy || !canSave) return;
    const form = draft;
    busy = true;
    try {
      const request = {
        channelId: BigInt(form.channelId ?? "0"),
        kind: form.kind as LiveBoardKindValue,
        range: form.range,
        pin: form.pin,
        entries: Math.min(25, Math.max(3, Math.round(form.entries ?? 10))),
        intervalMinutes: Math.min(1440, Math.max(5, Math.round(form.interval ?? 15)))
      };
      if (form.id === null) await liveBoardsApi.create($currentGuild.id, request);
      else await liveBoardsApi.update($currentGuild.id, form.id, request);
      draft = null;
      boards = await liveBoardsApi.list($currentGuild.id);
    } catch (err) {
      logger.error("Failed to save live board:", err);
      notify(errorText(err, form.id === null ? m.liveboards.errorCreate() : m.liveboards.errorUpdate()), "error");
    } finally {
      busy = false;
    }
  }

  async function remove(board: LiveBoard) {
    if (!$currentGuild?.id) return;
    const ok = await requestConfirmation({
      title: m.liveboards.confirmDeleteTitle(),
      message: m.liveboards.confirmDeleteMessage({
        kind: liveBoardKindLabels[board.kind as LiveBoardKindValue],
        channel: channelName(board.channelId)
      }),
      confirmText: m.common.delete()
    });
    if (!ok) return;
    try {
      await liveBoardsApi.remove($currentGuild.id, board.id);
      boards = boards.filter((b) => b.id !== board.id);
    } catch (err) {
      logger.error("Failed to delete live board:", err);
      notify(errorText(err, m.liveboards.errorDelete()), "error");
    }
  }

  async function refreshAll() {
    if (!$currentGuild?.id) return;
    refreshing = true;
    try {
      await liveBoardsApi.refresh($currentGuild.id);
      boards = await liveBoardsApi.list($currentGuild.id);
      notify(m.liveboards.notifyRefreshed());
    } catch (err) {
      logger.error("Failed to refresh live boards:", err);
      notify(errorText(err, m.liveboards.errorRefresh()), "error");
    } finally {
      refreshing = false;
    }
  }

  function patchReport(key: string, request: ServerReportRequest, optimistic: Partial<ServerReportSettings>) {
    const guildId = $currentGuild?.id;
    if (!guildId || !report) return;
    const previous = report;
    report = { ...report, ...optimistic };
    void autoSave.now(key, async () => {
      try {
        report = await liveBoardsApi.updateReport(guildId, request);
      } catch (err) {
        report = previous;
        throw err;
      }
    });
  }

  function setReportChannel(value: string | null) {
    if (value) patchReport("channel", { channelId: BigInt(value), enabled: true }, { channelId: BigInt(value), enabled: true });
    else patchReport("channel", { clearChannel: true }, { channelId: null, enabled: false });
  }

  async function sendNow() {
    if (!$currentGuild?.id) return;
    sending = true;
    try {
      const sent = await liveBoardsApi.sendReport($currentGuild.id);
      notify(
        sent ? m.liveboards.notifyReportPosted({ channel: channelName(report?.channelId) }) : m.liveboards.notifyNoReportChannel(),
        sent ? "success" : "error"
      );
      report = await liveBoardsApi.getReport($currentGuild.id);
    } catch (err) {
      logger.error("Failed to send report:", err);
      notify(errorText(err, m.liveboards.errorSendReport()), "error");
    } finally {
      sending = false;
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
    const key = `${$currentGuild.id}:${$currentInstance?.port ?? ""}`;
    if (loadedFor !== key) {
      loadedFor = key;
      void load(BigInt($currentGuild.id));
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

{#snippet boardActions()}
  <div class="flex flex-wrap gap-2">
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium disabled:opacity-50" style={quietStyle} disabled={refreshing || boards.length === 0} onclick={refreshAll}>
      <i class="fa-solid fa-arrows-rotate" class:fa-spin={refreshing} aria-hidden="true"></i>
      {refreshing ? m.common.refreshing() : m.liveboards.refreshAll()}
    </button>
    <button type="button" class="flex items-center justify-center gap-2 px-5 rounded-xl min-h-[50px] font-medium" style={quietStyle} onclick={startNew}>
      <i class="fa-solid fa-plus" aria-hidden="true"></i>
      {m.liveboards.addBoard()}
    </button>
  </div>
{/snippet}

<PluginPage
  {statusMessages}
  {autoSave}
  icon="fa-thumbtack"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.features.liveboardsName()}
  subtitle={m.liveboards.pageSubtitle()}
>
  <div class="grid grid-cols-2 gap-2 [&>:last-child:nth-child(odd)]:col-span-2" role="group" aria-label={m.liveboards.tabAria()}>
    {#each TABS as id (id)}
      {@const selected = tab === id}
      <button
        type="button"
        class="min-h-[44px] px-2 rounded-lg border text-sm font-medium flex items-center justify-center gap-2"
        style="background: {selected ? $colorStore.selectedSurface : `${$colorStore.primary}08`}; border-color: {selected ? $colorStore.selectedBorder : `${$colorStore.primary}20`}; color: {$colorStore.text};"
        aria-pressed={selected}
        onclick={() => selectTab(id)}
      >
        <i class={tabLabels[id].icon} aria-hidden="true"></i>
        {tabLabels[id].label}
      </button>
    {/each}
  </div>

  {#if loading}
    <div class="flex justify-center py-10">
      <div class="w-10 h-10 border-4 rounded-full animate-spin" style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary}"></div>
    </div>
  {:else if tab === "boards"}
    <PluginCard title={m.features.liveboardsName()} actions={boardActions} alwaysOpen>
      {#if boards.length === 0}
        <div class="flex flex-col items-center gap-3 py-8 text-center">
          <i class="fa-solid fa-thumbtack" style="color: {$colorStore.muted}; font-size: 28px;" aria-hidden="true"></i>
          <p style="color: {$colorStore.muted}">{m.liveboards.boardsEmpty()}</p>
        </div>
      {:else}
        <div class="space-y-2">
          {#each boards as board (board.id)}
            {@const kindLabel = liveBoardKindLabels[board.kind as LiveBoardKindValue] ?? String(board.kind)}
            <div class="flex items-center gap-2 rounded-xl border p-2 min-w-0" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
              <button type="button" class="grow min-w-0 text-left min-h-[44px] px-1" onclick={() => edit(board)}>
                <span class="block text-sm font-semibold truncate" style="color: {$colorStore.text}">{kindLabel}</span>
                <span class="block text-sm truncate" style="color: {$colorStore.muted}">
                  {m.liveboards.boardMeta({ channel: channelName(board.channelId), minutes: board.intervalMinutes, updated: formatAgo(board.lastUpdateAt) })}
                </span>
                <span class="flex flex-wrap items-center gap-1.5 mt-1">
                  <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{statsRangeLabels[board.range as StatsRangeValue] ?? String(board.range)}</span>
                  {#if hasRows(board.kind)}
                    <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{m.liveboards.boardRows({ count: board.entries })}</span>
                  {/if}
                  {#if board.pin}
                    <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.primary}15; color: {$colorStore.text};">{m.liveboards.pillPinned()}</span>
                  {/if}
                </span>
              </button>
              <button
                type="button"
                class="shrink-0 rounded-lg min-h-[44px] min-w-[44px]"
                style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}20;"
                aria-label={m.liveboards.deleteAria({ kind: kindLabel, channel: channelName(board.channelId) })}
                onclick={() => remove(board)}
              >
                <i class="fa-solid fa-trash" aria-hidden="true"></i>
              </button>
            </div>
          {/each}
        </div>
      {/if}
    </PluginCard>
  {:else if report}
    <PluginCard title={m.common.schedule()} alwaysOpen>
      <div class="space-y-4">
        <div class="space-y-1">
          <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.channel()}</span>
          <DiscordSelector
            type="channel"
            options={channels}
            selected={report.channelId ? report.channelId.toString() : null}
            clearable
            placeholder={m.common.noChannel()}
            onchange={(detail) => setReportChannel(typeof detail.selected === "string" && detail.selected ? detail.selected : null)}
          />
        </div>
        <div class="space-y-1">
          <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.liveboards.frequencyLabel()}</span>
          <WindowPicker
            value={report.frequency}
            options={frequencyOptions}
            ariaLabel={m.liveboards.frequencyAria()}
            onchange={(v) => patchReport("frequency", { frequency: v as 0 | 1 | 2 }, { frequency: v })}
          />
          <p class="text-sm" style="color: {$colorStore.muted}">{m.liveboards.frequencyHint()}</p>
        </div>
        <ToggleRow
          checked={report.enabled}
          title={m.liveboards.reportsEnabledLabel()}
          colors={$colorStore}
          disabled={!report.channelId}
          onchange={(value) => patchReport("enabled", { enabled: value }, { enabled: value })}
        />
        <p class="text-sm" style="color: {$colorStore.muted}">{m.liveboards.lastSent({ when: formatAgo(report.lastSentAt) })}</p>
        <button type="button" class="w-full min-h-[50px] rounded-xl font-medium disabled:opacity-50" style={buttonStyle} onclick={sendNow} disabled={sending || !report.channelId}>
          {sending ? m.common.sending() : m.liveboards.sendNow()}
        </button>
      </div>
    </PluginCard>
  {/if}
</PluginPage>

{#if draft}
  {@const form = draft}
  <Sheet title={form.id === null ? m.liveboards.addTitle() : m.liveboards.editTitle()} onclose={() => (draft = null)}>
    <div class="space-y-1">
      <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.channel()}</span>
      <DiscordSelector
        type="channel"
        options={channels}
        selected={form.channelId}
        disabled={form.id !== null}
        clearable={false}
        placeholder={m.common.selectAChannelPlaceholder()}
        onchange={(detail) => (form.channelId = typeof detail.selected === "string" ? detail.selected : null)}
      />
    </div>
    <div class="space-y-1">
      <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.liveboards.boardLabel()}</span>
      <DiscordSelector
        type="custom"
        customIcon="fa-thumbtack"
        searchable={false}
        clearable={false}
        ariaLabel={m.liveboards.boardLabel()}
        options={kindOptions}
        selected={String(form.kind)}
        onchange={(detail) => {
          if (typeof detail.selected === "string") form.kind = Number(detail.selected);
        }}
      />
    </div>
    <div class="space-y-1">
      <span class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.window()}</span>
      <WindowPicker bind:value={form.range} options={rangeOptions} />
    </div>
    {#if hasRows(form.kind)}
      <div class="space-y-1">
        <label for="lb-entries" class="block text-sm font-medium" style="color: {$colorStore.text}">{m.common.rows()}</label>
        <input id="lb-entries" type="number" min="3" max="25" bind:value={form.entries} class="w-full rounded-lg px-3 min-h-[50px]" style={inputStyle} />
        <p class="text-sm" style="color: {$colorStore.muted}">{m.liveboards.rowsHint()}</p>
      </div>
    {/if}
    <div class="space-y-1">
      <label for="lb-interval" class="block text-sm font-medium" style="color: {$colorStore.text}">{m.liveboards.intervalLabel()}</label>
      <input id="lb-interval" type="number" min="5" max="1440" bind:value={form.interval} class="w-full rounded-lg px-3 min-h-[50px]" style={inputStyle} />
      <p class="text-sm" style="color: {$colorStore.muted}">{m.liveboards.intervalHint()}</p>
    </div>
    {#if form.id === null}
      <ToggleRow checked={form.pin} title={m.liveboards.pinLabel()} subtitle={m.liveboards.pinHint()} colors={$colorStore} onchange={(value) => (form.pin = value)} />
    {/if}
    {#snippet footer()}
      <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium" style={quietStyle} onclick={() => (draft = null)}>
        {m.common.cancel()}
      </button>
      <button type="button" class="px-5 rounded-xl min-h-[44px] font-medium disabled:opacity-50" style={buttonStyle} disabled={!canSave || busy} onclick={save}>
        {busy ? m.liveboards.posting() : m.common.save()}
      </button>
    {/snippet}
  </Sheet>
{/if}
