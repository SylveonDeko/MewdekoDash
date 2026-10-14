<!-- routes/dashboard/liveboards/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount, untrack } from "svelte";
  import { goto } from "$app/navigation";
  import {
    clientApi,
    liveBoardsApi,
    LiveBoardKind,
    ReportFrequency,
    liveBoardKindLabels,
    statsRangeLabels,
    type LiveBoard,
    type LiveBoardKindValue,
    type ServerReportSettings,
    type StatsRangeValue,
  } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import Card from "$lib/components/analytics/Card.svelte";
  import Pill from "$lib/components/analytics/Pill.svelte";
  import SectionHeader from "$lib/components/stats/SectionHeader.svelte";
  import AsyncState from "$lib/components/stats/AsyncState.svelte";
  import WindowPicker from "$lib/components/stats/WindowPicker.svelte";
  import { formatAgo, rangeOptions } from "$lib/components/stats/format";
  import type { PageData } from "./$types";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const tabs = $derived([
    { id: "boards", label: m.features.liveboardsName(), icon: "fa-thumbtack" },
    { id: "reports", label: m.liveboards.tabReports(), icon: "fa-newspaper" },
  ]);

  let activeTab = $state("boards");
  let notificationMessage = $state("");
  let notificationType = $state<"success" | "error">("success");

  function notify(message: string, type: "success" | "error" = "error") {
    notificationMessage = message;
    notificationType = type;
    setTimeout(() => (notificationMessage = ""), 4000);
  }

  function fail(err: unknown, fallback: string) {
    logger.error(fallback, err);
    notify(err instanceof Error ? err.message : fallback, "error");
  }

  /** Guild lists */
  let textChannels = $state<Array<{ id: string; name: string }>>([]);

  async function loadGuildLists() {
    if (!$currentGuild?.id) return;
    const list = await clientApi.getTextChannels($currentGuild.id).catch(() => []);
    textChannels = list.map((c) => ({ id: c.id.toString(), name: c.name }));
  }

  function channelName(id: bigint | null | undefined): string {
    if (!id) return "-";
    const key = id.toString();
    return textChannels.find((c) => c.id === key)?.name ?? key;
  }

  /** Boards */
  let boards = $state<LiveBoard[]>([]);
  let boardsLoading = $state(false);
  let boardsError = $state<string | null>(null);
  let creating = $state(false);
  let refreshing = $state(false);

  let newChannel = $state<string | null>(null);
  let newKind = $state<number>(LiveBoardKind.InviteLeaderboard);
  let newRange = $state<number>(2);
  let newPin = $state(true);
  let newEntries = $state(10);
  let newInterval = $state(15);

  const kindOptions = Object.entries(liveBoardKindLabels).map(([value, label]) => ({ id: value, name: label }));
  let isLeaderboard = $derived(
    newKind === LiveBoardKind.InviteLeaderboard ||
      newKind === LiveBoardKind.MessageLeaderboard ||
      newKind === LiveBoardKind.VoiceLeaderboard ||
      newKind === LiveBoardKind.ActivityLeaderboard,
  );

  async function loadBoards() {
    if (!$currentGuild?.id) return;
    boardsLoading = true;
    boardsError = null;
    try {
      boards = await liveBoardsApi.list($currentGuild.id);
    } catch (err) {
      boardsError = err instanceof Error ? err.message : m.liveboards.errorLoadBoards();
      logger.error("Failed to load live boards", err);
    } finally {
      boardsLoading = false;
    }
  }

  async function createBoard() {
    if (!$currentGuild?.id) return;
    if (!newChannel) {
      notify(m.liveboards.notifyPickChannel(), "error");
      return;
    }
    creating = true;
    try {
      await liveBoardsApi.create($currentGuild.id, {
        channelId: BigInt(newChannel),
        kind: newKind as LiveBoardKindValue,
        range: newRange,
        pin: newPin,
        entries: newEntries,
        intervalMinutes: newInterval,
      });
      await loadBoards();
    } catch (err) {
      fail(err, m.liveboards.errorCreate());
    } finally {
      creating = false;
    }
  }

  async function removeBoard(board: LiveBoard) {
    if (!$currentGuild?.id) return;
    const ok = await requestConfirmation({
      title: m.liveboards.confirmDeleteTitle(),
      message: m.liveboards.confirmDeleteMessage({ kind: liveBoardKindLabels[board.kind as LiveBoardKindValue], channel: channelName(board.channelId) }),
      confirmText: m.common.delete(),
    });
    if (!ok) return;
    try {
      await liveBoardsApi.remove($currentGuild.id, board.id);
      boards = boards.filter((b) => b.id !== board.id);
    } catch (err) {
      fail(err, m.liveboards.errorDelete());
    }
  }

  async function refreshAll() {
    if (!$currentGuild?.id) return;
    refreshing = true;
    try {
      await liveBoardsApi.refresh($currentGuild.id);
      await loadBoards();
    } catch (err) {
      fail(err, m.liveboards.errorRefresh());
    } finally {
      refreshing = false;
    }
  }

  /** Reports */
  let report = $state<ServerReportSettings | null>(null);
  let reportLoading = $state(false);
  let reportError = $state<string | null>(null);
  let sending = $state(false);

  async function loadReport() {
    if (!$currentGuild?.id) return;
    reportLoading = true;
    reportError = null;
    try {
      report = await liveBoardsApi.getReport($currentGuild.id);
    } catch (err) {
      reportError = err instanceof Error ? err.message : m.liveboards.errorLoadReport();
      logger.error("Failed to load report settings", err);
    } finally {
      reportLoading = false;
    }
  }

  async function updateReport(request: Parameters<typeof liveBoardsApi.updateReport>[1]) {
    if (!$currentGuild?.id) return;
    try {
      report = await liveBoardsApi.updateReport($currentGuild.id, request);
    } catch (err) {
      fail(err, m.liveboards.errorSaveReport());
    }
  }

  async function sendNow() {
    if (!$currentGuild?.id) return;
    sending = true;
    try {
      const sent = await liveBoardsApi.sendReport($currentGuild.id);
      notify(sent ? m.liveboards.notifyReportPosted({ channel: channelName(report?.channelId) }) : m.liveboards.notifyNoReportChannel(), sent ? "success" : "error");
      await loadReport();
    } catch (err) {
      fail(err, m.liveboards.errorSendReport());
    } finally {
      sending = false;
    }
  }

  /** Orchestration */
  let loadedFor = $state("");

  async function loadAll() {
    if (!$currentGuild?.id) return;
    const key = `${$currentGuild.id}:${$currentInstance?.port ?? ""}`;
    if (loadedFor === key) return;
    loadedFor = key;
    await Promise.all([loadGuildLists(), loadBoards(), loadReport()]);
  }

  onMount(async () => {
    if (!$currentGuild) {
      await goto("/dashboard");
      return;
    }
    await loadAll();
  });

  $effect(() => {
    if ($currentGuild && $currentInstance) untrack(() => loadAll());
  });

  const inputStyle = $derived(`background: ${$colorStore.primary}10; color: ${$colorStore.text};`);
</script>

<DashboardPageLayout
  title={m.features.liveboardsName()}
  subtitle={m.liveboards.pageSubtitle()}
  icon="fa-thumbtack"
  guildName={$currentGuild?.name || "Dashboard"}
  {tabs}
  bind:activeTab
  bind:notificationMessage
  {notificationType}
>
  {#if activeTab === "boards"}
    <section>
      <SectionHeader icon="fa-thumbtack" title={m.features.liveboardsName()} subtitle={m.liveboards.boardsSubtitle()}>
        {#snippet actions()}
          <button type="button" class="px-3 min-h-[36px] rounded-lg text-sm font-medium" style="background: {$colorStore.primary}20; color: {$colorStore.primary};" onclick={refreshAll} disabled={refreshing}>
            <i class="fa-solid fa-arrows-rotate mr-1" aria-hidden="true"></i> {refreshing ? m.common.refreshing() : m.liveboards.refreshAll()}
          </button>
        {/snippet}
      </SectionHeader>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="xl:col-span-2">
          <AsyncState loading={boardsLoading} error={boardsError} empty={boards.length === 0} emptyMessage={m.liveboards.boardsEmpty()} emptyIcon="fa-thumbtack">
            <div class="space-y-3">
              {#each boards as board (board.id)}
                <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 border" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="font-semibold" style="color: {$colorStore.text}">{liveBoardKindLabels[board.kind as LiveBoardKindValue] ?? board.kind}</h3>
                      <Pill tone="muted" text={statsRangeLabels[board.range as StatsRangeValue] ?? String(board.range)} />
                      {#if board.pin}<Pill tone="ok" text={m.liveboards.pillPinned()} />{/if}
                    </div>
                    <p class="text-sm" style="color: {$colorStore.muted}">
                      {m.liveboards.boardMeta({ channel: channelName(board.channelId), minutes: board.intervalMinutes, updated: formatAgo(board.lastUpdateAt) })}
                      {#if board.entries && board.kind <= 2 || board.kind === 10}{m.liveboards.boardRows({ count: board.entries })}{/if}
                    </p>
                  </div>
                  <button type="button" class="min-h-[40px] px-3 rounded-lg text-sm font-medium" style="background: {$colorStore.accent}20; color: {$colorStore.accent};" onclick={() => removeBoard(board)}>{m.common.delete()}</button>
                </div>
              {/each}
            </div>
          </AsyncState>
        </div>

        <Card title={m.liveboards.addTitle()}>
          <div class="space-y-4">
            <SettingField label={m.common.channel()} hint={m.liveboards.channelHint()} id="lb-channel" required>
              <DiscordSelector id="lb-channel" type="channel" options={textChannels} bind:selected={newChannel} placeholder={m.common.pickChannelPlaceholder()} />
            </SettingField>
            <SettingField label={m.liveboards.boardLabel()} hint={m.liveboards.boardHint()} id="lb-kind">
              <DiscordSelector id="lb-kind" type="custom" customIcon="fa-thumbtack" searchable={false} options={kindOptions} selected={String(newKind)} onchange={(e) => { if (typeof e.selected === "string") newKind = Number(e.selected); }} />
            </SettingField>
            <SettingField label={m.common.window()} hint={m.liveboards.windowHint()} id="lb-range">
              <WindowPicker bind:value={newRange} options={rangeOptions} />
            </SettingField>
            {#if isLeaderboard}
              <SettingField label={m.common.rows()} hint={m.liveboards.rowsHint()} id="lb-entries">
                <input id="lb-entries" type="number" min="3" max="25" bind:value={newEntries} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
              </SettingField>
            {/if}
            <SettingField label={m.liveboards.intervalLabel()} hint={m.liveboards.intervalHint()} id="lb-interval">
              <input id="lb-interval" type="number" min="5" max="1440" bind:value={newInterval} class="w-full rounded-lg p-2 min-h-[44px]" style={inputStyle} />
            </SettingField>
            <SettingToggle id="lb-pin" label={m.liveboards.pinLabel()} hint={m.liveboards.pinHint()} checked={newPin} onchange={(v) => (newPin = v)} />
            <button type="button" class="w-full min-h-[48px] rounded-xl font-medium" style="background: {$colorStore.primary}; color: #fff;" onclick={createBoard} disabled={creating || boards.length >= 10}>
              {creating ? m.liveboards.posting() : boards.length >= 10 ? m.liveboards.limitReached() : m.liveboards.addBoard()}
            </button>
          </div>
        </Card>
      </div>
    </section>
  {/if}

  {#if activeTab === "reports"}
    <section>
      <SectionHeader icon="fa-newspaper" title={m.liveboards.tabReports()} subtitle={m.liveboards.reportsSubtitle()} />

      <AsyncState loading={reportLoading} error={reportError} empty={!report}>
        {#if report}
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card title={m.common.schedule()}>
              <div class="space-y-4">
                <SettingField label={m.common.channel()} hint={m.liveboards.reportChannelHint()} id="rp-channel">
                  <DiscordSelector id="rp-channel" type="channel" options={textChannels} selected={report.channelId ? report.channelId.toString() : null} placeholder={m.common.noChannel()} onchange={(e) => (typeof e.selected === "string" && e.selected ? updateReport({ channelId: BigInt(e.selected), enabled: true }) : updateReport({ clearChannel: true }))} />
                </SettingField>
                <SettingField label={m.liveboards.frequencyLabel()} hint={m.liveboards.frequencyHint()} id="rp-frequency">
                  <WindowPicker
                    value={report.frequency}
                    options={[
                      { value: ReportFrequency.Daily, label: m.common.daily() },
                      { value: ReportFrequency.Weekly, label: m.liveboards.frequencyWeekly() },
                      { value: ReportFrequency.Monthly, label: m.liveboards.frequencyMonthly() },
                    ]}
                    ariaLabel={m.liveboards.frequencyAria()}
                    onchange={(v) => updateReport({ frequency: v as 0 | 1 | 2 })}
                  />
                </SettingField>
                <SettingToggle id="rp-enabled" label={m.liveboards.reportsEnabledLabel()} hint={m.liveboards.reportsEnabledHint()} checked={report.enabled} disabled={!report.channelId} onchange={(v) => updateReport({ enabled: v })} />
                <p class="text-sm" style="color: {$colorStore.muted}">{m.liveboards.lastSent({ when: formatAgo(report.lastSentAt) })}</p>
                <button type="button" class="w-full min-h-[48px] rounded-xl font-medium" style="background: {$colorStore.primary}; color: #fff;" onclick={sendNow} disabled={sending || !report.channelId}>
                  {sending ? m.common.sending() : m.liveboards.sendNow()}
                </button>
              </div>
            </Card>
            <Card title={m.liveboards.contentsTitle()}>
              <ul class="text-sm space-y-2" style="color: {$colorStore.text}">
                <li>{m.liveboards.contentsGrowth()}</li>
                <li>{m.liveboards.contentsActivity()}</li>
                <li>{m.liveboards.contentsMembers()}</li>
                <li>{m.liveboards.contentsTop()}</li>
                <li>{m.liveboards.contentsInvites()}</li>
                <li>{m.liveboards.contentsGames()}</li>
                <li>{m.liveboards.contentsChart()}</li>
              </ul>
            </Card>
          </div>
        {/if}
      </AsyncState>
    </section>
  {/if}
</DashboardPageLayout>
