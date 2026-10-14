<!-- routes/dashboard/invites/+page.svelte -->
<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { goto } from "$app/navigation";
  import {
    clientApi,
    inviteTrackingApi,
    InviteExclusionKind,
    InviteResetScope,
    statsRangeLabels,
    type GuildInviteCode,
    type InviteAnalytics,
    type InviteBreakdown,
    type InvitedPage,
    type InviteLabel,
    type InviteLeaderboardEntry,
    type InviterInfo,
    type InviteTrackingSettings,
    type StatsRangeValue,
  } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild.ts";
  import { currentInstance } from "$lib/stores/instanceStore.ts";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger.ts";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SettingToggle from "$lib/components/forms/SettingToggle.svelte";
  import SettingField from "$lib/components/forms/SettingField.svelte";
  import SimpleLineChart from "$lib/components/analytics/SimpleLineChart.svelte";
  import StatTile from "$lib/components/analytics/StatTile.svelte";
  import Card from "$lib/components/analytics/Card.svelte";
  import Pill from "$lib/components/analytics/Pill.svelte";
  import SectionHeader from "$lib/components/stats/SectionHeader.svelte";
  import AsyncState from "$lib/components/stats/AsyncState.svelte";
  import WindowPicker from "$lib/components/stats/WindowPicker.svelte";
  import RankList, { type RankRow } from "$lib/components/stats/RankList.svelte";
  import { formatAgo, formatDate, formatNumber, formatPercent, formatSigned, rangeOptions, saveBlob } from "$lib/components/stats/format";
  import type { PageData } from "./$types";
  import { m } from "$lib/i18n";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const tabs = $derived([
    { id: "overview", label: m.common.overview(), icon: "fa-chart-line" },
    { id: "leaderboard", label: m.common.leaderboard(), icon: "fa-trophy" },
    { id: "members", label: m.common.members(), icon: "fa-user-plus" },
    { id: "codes", label: m.invites.tabCodes(), icon: "fa-link" },
    { id: "settings", label: m.common.settings(), icon: "fa-gear" },
  ]);

  let activeTab = $state("overview");
  let notificationMessage = $state("");
  let notificationType = $state<"success" | "error">("success");

  function notify(message: string, type: "success" | "error" = "error") {
    notificationMessage = message;
    notificationType = type;
    setTimeout(() => (notificationMessage = ""), 4000);
  }

  const autoSave = createAutoSave({
    onError: () => notify(m.invites.notifySaveFailed(), "error"),
  });

  function fail(err: unknown, fallback: string) {
    logger.error(fallback, err);
    notify(err instanceof Error ? err.message : fallback, "error");
  }

  /** Guild lists for selectors */
  let members = $state<Array<{ id: string; name: string; avatarUrl?: string }>>([]);
  let roles = $state<Array<{ id: string; name: string; color?: number }>>([]);
  let channels = $state<Array<{ id: string; name: string }>>([]);

  async function loadGuildLists() {
    if (!$currentGuild?.id) return;
    const guildId = $currentGuild.id;
    const [memberList, roleList, channelList] = await Promise.all([
      clientApi.getMembers(guildId).catch(() => []),
      clientApi.getRoles(guildId).catch(() => []),
      clientApi.getTextChannels(guildId).catch(() => []),
    ]);
    members = memberList.map((mb: any) => ({ id: mb.id.toString(), name: mb.username, avatarUrl: mb.avatarUrl }));
    roles = roleList.map((r: any) => ({ id: r.id.toString(), name: r.name, color: r.color }));
    channels = channelList.map((c) => ({ id: c.id.toString(), name: c.name }));
  }

  function memberName(id: bigint | string): string {
    const key = id.toString();
    return members.find((mb) => mb.id === key)?.name ?? key;
  }

  /** Overview */
  let overviewRange = $state<number>(3);
  let analytics = $state<InviteAnalytics | null>(null);
  let overviewLoading = $state(false);
  let overviewError = $state<string | null>(null);

  async function loadOverview() {
    if (!$currentGuild?.id) return;
    overviewLoading = true;
    overviewError = null;
    try {
      analytics = await inviteTrackingApi.getAnalytics($currentGuild.id, overviewRange as StatsRangeValue);
    } catch (err) {
      overviewError = err instanceof Error ? err.message : m.common.failedToLoadAnalytics();
      logger.error("Failed to load invite analytics", err);
    } finally {
      overviewLoading = false;
    }
  }

  let growthLabels = $derived(analytics?.series.map((p) => formatDate(p.day)) ?? []);
  let growthSeries = $derived(
    analytics
      ? [
          { name: m.common.joins(), data: analytics.series.map((p) => p.joins), color: "#4ade80" },
          { name: m.common.leaves(), data: analytics.series.map((p) => p.leaves), color: "#f87171" },
        ]
      : [],
  );

  /** Leaderboard */
  let boardRange = $state<number>(0);
  let boardRole = $state<string | null>(null);
  let boardPage = $state(1);
  const boardPageSize = 25;
  let leaderboard = $state<InviteLeaderboardEntry[]>([]);
  let boardLoading = $state(false);
  let boardError = $state<string | null>(null);

  async function loadLeaderboard() {
    if (!$currentGuild?.id) return;
    boardLoading = true;
    boardError = null;
    try {
      leaderboard = await inviteTrackingApi.getInviteLeaderboard(
        $currentGuild.id,
        boardRange as StatsRangeValue,
        boardPage,
        boardPageSize,
        boardRole ? BigInt(boardRole) : undefined,
      );
    } catch (err) {
      boardError = err instanceof Error ? err.message : m.common.failedToLoadLeaderboard();
      logger.error("Failed to load invite leaderboard", err);
    } finally {
      boardLoading = false;
    }
  }

  let boardRows = $derived<RankRow[]>(
    leaderboard.map((e) => ({
      rank: e.rank,
      id: e.userId.toString(),
      name: e.username,
      avatarUrl: e.avatarUrl ?? null,
      value: formatNumber(e.total),
      detail: e.retention !== null && e.retention !== undefined
        ? m.invites.leaderboardDetailRetained({ regular: e.regular, left: e.left, fake: e.fake, bonus: e.bonus, retention: formatPercent(e.retention) })
        : m.invites.leaderboardDetail({ regular: e.regular, left: e.left, fake: e.fake, bonus: e.bonus }),
    })),
  );

  async function exportLeaderboard() {
    if (!$currentGuild?.id) return;
    try {
      const blob = await inviteTrackingApi.exportLeaderboard($currentGuild.id, boardRange as StatsRangeValue);
      saveBlob(blob, `invites-${statsRangeLabels[boardRange as StatsRangeValue].replace(/\s+/g, "-").toLowerCase()}.csv`);
    } catch (err) {
      fail(err, m.invites.errorExportLeaderboard());
    }
  }

  /** Selected member detail (breakdown, adjust, reset) */
  let detailUserId = $state<string | null>(null);
  let detail = $state<InviteBreakdown | null>(null);
  let detailInviter = $state<InviterInfo | null>(null);
  let detailLoading = $state(false);
  let adjustRegular = $state(0);
  let adjustBonus = $state(0);
  let adjustFake = $state(0);

  async function openDetail(userId: string) {
    if (!$currentGuild?.id) return;
    detailUserId = userId;
    detailLoading = true;
    detail = null;
    detailInviter = null;
    adjustRegular = 0;
    adjustBonus = 0;
    adjustFake = 0;
    try {
      const id = BigInt(userId);
      const [breakdown, inviter] = await Promise.all([
        inviteTrackingApi.getBreakdown($currentGuild.id, id),
        inviteTrackingApi.getInviter($currentGuild.id, id).catch(() => null),
      ]);
      detail = breakdown;
      detailInviter = inviter;
    } catch (err) {
      fail(err, m.invites.errorLoadMember());
    } finally {
      detailLoading = false;
    }
  }

  async function applyAdjust() {
    if (!$currentGuild?.id || !detailUserId) return;
    if (!adjustRegular && !adjustBonus && !adjustFake) return;
    try {
      detail = await inviteTrackingApi.adjust($currentGuild.id, BigInt(detailUserId), {
        regular: adjustRegular,
        bonus: adjustBonus,
        fake: adjustFake,
      });
      adjustRegular = 0;
      adjustBonus = 0;
      adjustFake = 0;
      await loadLeaderboard();
    } catch (err) {
      fail(err, m.invites.errorAdjust());
    }
  }

  async function resetMember() {
    if (!$currentGuild?.id || !detailUserId) return;
    const ok = await requestConfirmation({
      title: m.invites.confirmResetMemberTitle(),
      message: m.invites.confirmResetMemberMessage({ user: memberName(detailUserId) }),
      confirmText: m.common.reset(),
    });
    if (!ok) return;
    try {
      await inviteTrackingApi.resetUser($currentGuild.id, BigInt(detailUserId));
      await Promise.all([openDetail(detailUserId), loadLeaderboard()]);
    } catch (err) {
      fail(err, m.invites.errorReset());
    }
  }

  /** Members (invited list) */
  let memberFilterInviter = $state<string | null>(null);
  let memberFilterCode = $state("");
  let memberFilterLabel = $state("");
  let memberIncludeLeft = $state(true);
  let memberPage = $state(1);
  const memberPageSize = 25;
  let invitedPage = $state<InvitedPage | null>(null);
  let membersLoading = $state(false);
  let membersError = $state<string | null>(null);

  async function loadInvited() {
    if (!$currentGuild?.id) return;
    membersLoading = true;
    membersError = null;
    try {
      invitedPage = await inviteTrackingApi.getInvited(
        $currentGuild.id,
        {
          inviterId: memberFilterInviter ? BigInt(memberFilterInviter) : undefined,
          code: memberFilterCode.trim() || undefined,
          label: memberFilterLabel.trim() || undefined,
          includeLeft: memberIncludeLeft,
        },
        memberPage,
        memberPageSize,
      );
    } catch (err) {
      membersError = err instanceof Error ? err.message : m.invites.errorLoadMembers();
      logger.error("Failed to load invited members", err);
    } finally {
      membersLoading = false;
    }
  }

  let memberPages = $derived(invitedPage ? Math.max(1, Math.ceil(invitedPage.total / memberPageSize)) : 1);

  async function exportInvited() {
    if (!$currentGuild?.id) return;
    try {
      const blob = await inviteTrackingApi.exportInvited($currentGuild.id, {
        inviterId: memberFilterInviter ? BigInt(memberFilterInviter) : undefined,
        code: memberFilterCode.trim() || undefined,
        label: memberFilterLabel.trim() || undefined,
      });
      saveBlob(blob, "invited-members.csv");
    } catch (err) {
      fail(err, m.invites.errorExportMembers());
    }
  }

  /** Codes and labels */
  let codes = $state<GuildInviteCode[]>([]);
  let labels = $state<InviteLabel[]>([]);
  let codesLoading = $state(false);
  let codesError = $state<string | null>(null);
  let labelDrafts = $state<Record<string, { label: string; roleId: string | null }>>({});
  /** What the bot last confirmed for each code's label, so unchanged drafts are not resent. */
  let savedLabels: Record<string, { label: string; roleId: string | null }> = {};

  async function loadCodes() {
    if (!$currentGuild?.id) return;
    codesLoading = true;
    codesError = null;
    try {
      const [codeList, labelList] = await Promise.all([
        inviteTrackingApi.getCodes($currentGuild.id),
        inviteTrackingApi.getLabels($currentGuild.id),
      ]);
      codes = codeList;
      labels = labelList;
      const drafts: Record<string, { label: string; roleId: string | null }> = {};
      for (const code of codeList) {
        drafts[code.code] = { label: code.label ?? "", roleId: code.labelRoleId ? code.labelRoleId.toString() : null };
      }
      labelDrafts = drafts;
      savedLabels = Object.fromEntries(Object.entries(drafts).map(([code, d]) => [code, { ...d }]));
    } catch (err) {
      codesError = err instanceof Error ? err.message : m.invites.errorLoadCodes();
      logger.error(m.invites.errorLoadCodes(), err);
    } finally {
      codesLoading = false;
    }
  }

  /** The use count of a code, with its cap and flags, as one dot-separated line. */
  function codeUsage(code: GuildInviteCode): string {
    const uses = code.maxUses
      ? (code.uses === 1
          ? m.invites.codesUsesOfOne({ count: formatNumber(code.uses), max: code.maxUses })
          : m.invites.codesUsesOfOther({ count: formatNumber(code.uses), max: code.maxUses }))
      : (code.uses === 1
          ? m.invites.codesUsesOne({ count: formatNumber(code.uses) })
          : m.invites.codesUsesOther({ count: formatNumber(code.uses) }));
    const parts = [uses];
    if (code.maxAge) parts.push(m.invites.codesFlagExpires());
    if (code.isTemporary) parts.push(m.invites.codesFlagTemporary());
    return parts.join(" · ");
  }

  const labelKey = (code: string) => `label:${code}`;

  /**
   * Builds the save for a code's label and role from the drafts as they are right now.
   * An empty label removes it, along with its role. Returns null when nothing changed.
   */
  function buildLabelSave(code: string, rollbackRole: boolean) {
    if (!$currentGuild?.id) return null;
    const draft = labelDrafts[code];
    if (!draft) return null;
    const guildId = $currentGuild.id;
    const label = draft.label.trim();
    const roleId = label ? draft.roleId : null;
    const saved = savedLabels[code] ?? { label: "", roleId: null };
    if (label === saved.label && roleId === (saved.label ? saved.roleId : null)) return null;
    const previousRole = saved.roleId;

    return async () => {
      try {
        if (!label) {
          await inviteTrackingApi.removeLabel(guildId, code);
        } else {
          await inviteTrackingApi.setLabel(guildId, { code, label, roleId: roleId ? BigInt(roleId) : null });
        }
        if ($currentGuild?.id === guildId) savedLabels[code] = { label, roleId };
      } catch (err) {
        if (rollbackRole && $currentGuild?.id === guildId && labelDrafts[code]) labelDrafts[code].roleId = previousRole;
        throw err;
      }
    };
  }

  /**
   * Debounces the label while it is typed. Clearing the field is only saved when it is left,
   * so wiping it to retype does not drop the label and its role in between.
   */
  function scheduleLabel(code: string) {
    const key = labelKey(code);
    if (!labelDrafts[code]?.label.trim()) {
      autoSave.cancel(key);
      return;
    }
    const save = buildLabelSave(code, false);
    if (save) autoSave.schedule(key, save);
    else autoSave.cancel(key);
  }

  function flushLabel(code: string) {
    const key = labelKey(code);
    if (!labelDrafts[code]?.label.trim()) {
      const save = buildLabelSave(code, false);
      if (save) void autoSave.now(key, save);
      return;
    }
    void autoSave.flush(key);
  }

  /** Saves the role on join as soon as it is picked, putting the old one back if the bot refuses. */
  function saveLabelRole(code: string) {
    const save = buildLabelSave(code, true);
    if (save) void autoSave.now(labelKey(code), save);
  }

  async function deleteCode(code: string) {
    if (!$currentGuild?.id) return;
    const ok = await requestConfirmation({
      title: m.invites.confirmDeleteCodeTitle(),
      message: m.invites.confirmDeleteCodeMessage({ code }),
      confirmText: m.common.delete(),
    });
    if (!ok) return;
    try {
      await inviteTrackingApi.deleteCode($currentGuild.id, code);
      await loadCodes();
    } catch (err) {
      fail(err, m.invites.errorDeleteCode());
    }
  }

  /** Settings */
  let settings = $state<InviteTrackingSettings | null>(null);
  let settingsLoading = $state(false);
  let settingsError = $state<string | null>(null);
  let minAgeDays = $state(0);
  let blacklistedUsers = $state<string[]>([]);
  let blacklistedRoles = $state<string[]>([]);
  let hiddenUsers = $state<string[]>([]);
  let exclusionUser = $state<string | null>(null);
  let exclusionRole = $state<string | null>(null);
  let hiddenUser = $state<string | null>(null);

  function timeSpanToDays(span: string): number {
    const match = span.match(/^(?:(\d+)\.)?(\d+):(\d+):(\d+)/);
    if (!match) return 0;
    const days = parseInt(match[1] ?? "0", 10);
    const hours = parseInt(match[2], 10);
    return Math.round((days * 24 + hours) / 24);
  }

  async function loadSettings() {
    if (!$currentGuild?.id) return;
    settingsLoading = true;
    settingsError = null;
    try {
      const guildId = $currentGuild.id;
      const [s, users, roleIds, hidden] = await Promise.all([
        inviteTrackingApi.getInviteSettings(guildId),
        inviteTrackingApi.getExclusions(guildId, InviteExclusionKind.BlacklistedUser),
        inviteTrackingApi.getExclusions(guildId, InviteExclusionKind.BlacklistedRole),
        inviteTrackingApi.getExclusions(guildId, InviteExclusionKind.HiddenUser),
      ]);
      settings = s;
      minAgeDays = timeSpanToDays(s.minAccountAge);
      savedMinAgeDays = minAgeDays;
      blacklistedUsers = users.map((x) => x.toString());
      blacklistedRoles = roleIds.map((x) => x.toString());
      hiddenUsers = hidden.map((x) => x.toString());
    } catch (err) {
      settingsError = err instanceof Error ? err.message : m.common.notifyLoadSettingsFailed();
      logger.error("Failed to load invite settings", err);
    } finally {
      settingsLoading = false;
    }
  }

  async function saveSetting(work: () => Promise<unknown>, fallback: string) {
    try {
      await work();
      await loadSettings();
    } catch (err) {
      fail(err, fallback);
    }
  }

  /**
   * Saves a toggle or channel picker through the page's auto-save, so it shows in the header
   * with the other settings. A failure reloads settings, which puts the control back.
   */
  function autoSaveSetting(key: string, work: () => Promise<unknown>) {
    void autoSave.now(key, async () => {
      try {
        await work();
      } finally {
        await loadSettings();
      }
    });
  }

  /** The minimum account age the bot last confirmed, in days. */
  let savedMinAgeDays = 0;

  function clampMinAge(value: number): number {
    return Math.max(0, Math.min(300, Math.round(value)));
  }

  /** Debounces the minimum account age; an empty field is never sent, and values are clamped to 0-300. */
  function scheduleMinAge() {
    if (!$currentGuild?.id) return;
    if (typeof minAgeDays !== "number" || !Number.isFinite(minAgeDays)) {
      autoSave.cancel("minAge");
      return;
    }
    const guildId = $currentGuild.id;
    const days = clampMinAge(minAgeDays);
    if (days === savedMinAgeDays) {
      autoSave.cancel("minAge");
      return;
    }
    autoSave.schedule("minAge", async () => {
      await inviteTrackingApi.setMinAccountAge(guildId, `${days}.00:00:00`);
      if ($currentGuild?.id === guildId) savedMinAgeDays = days;
    });
  }

  /** Leaving the field saves it, and shows the value that actually applies (clamped, or the saved one if empty). */
  function flushMinAge() {
    if (typeof minAgeDays !== "number" || !Number.isFinite(minAgeDays)) minAgeDays = savedMinAgeDays;
    else minAgeDays = clampMinAge(minAgeDays);
    void autoSave.flush("minAge");
  }

  async function addExclusion(kind: 0 | 1 | 2, target: string | null) {
    if (!$currentGuild?.id || !target) return;
    await saveSetting(() => inviteTrackingApi.addExclusion($currentGuild!.id, kind, BigInt(target)), m.common.failedToAddTheExclusion());
    exclusionUser = null;
    exclusionRole = null;
    hiddenUser = null;
  }

  async function removeExclusion(kind: 0 | 1 | 2, target: string) {
    if (!$currentGuild?.id) return;
    await saveSetting(() => inviteTrackingApi.removeExclusion($currentGuild!.id, kind, BigInt(target)), m.common.failedToRemoveTheExclusion());
  }

  async function syncInvites() {
    if (!$currentGuild?.id) return;
    try {
      const raised = await inviteTrackingApi.sync($currentGuild.id);
      notify(m.invites.notifySynced({ count: raised }), "success");
      await loadLeaderboard();
    } catch (err) {
      fail(err, m.invites.errorSync());
    }
  }

  async function resetAll(scope: 0 | 1) {
    if (!$currentGuild?.id) return;
    const ok = await requestConfirmation({
      title: scope === InviteResetScope.Server ? m.invites.confirmResetServerTitle() : m.invites.confirmResetLeftTitle(),
      message:
        scope === InviteResetScope.Server
          ? m.invites.confirmResetServerMessage()
          : m.invites.confirmResetLeftMessage(),
      confirmText: m.common.reset(),
    });
    if (!ok) return;
    try {
      const count = await inviteTrackingApi.reset($currentGuild.id, scope);
      notify(m.invites.notifyResetDone({ count }), "success");
      await loadLeaderboard();
    } catch (err) {
      fail(err, m.invites.errorReset());
    }
  }

  function roleName(id: string): string {
    return roles.find((r) => r.id === id)?.name ?? id;
  }

  /** Loading orchestration */
  let loadedFor = $state("");

  async function loadAll() {
    if (!$currentGuild?.id) return;
    const key = `${$currentGuild.id}:${$currentInstance?.port ?? ""}`;
    if (loadedFor === key) return;
    loadedFor = key;
    await Promise.all([loadGuildLists(), loadOverview(), loadLeaderboard(), loadInvited(), loadCodes(), loadSettings()]);
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
</script>

<DashboardPageLayout
  {autoSave}
  title={m.features.wizardInvitetrackingName()}
  subtitle={m.invites.pageSubtitle()}
  icon="fa-user-plus"
  guildName={$currentGuild?.name || m.common.dashboard()}
  {tabs}
  bind:activeTab
  bind:notificationMessage
  {notificationType}
>
  {#if activeTab === "overview"}
    <section>
      <SectionHeader icon="fa-chart-pie" title={m.invites.overviewTitle()} subtitle={m.invites.overviewSubtitle()}>
        {#snippet actions()}
          <WindowPicker bind:value={overviewRange} options={rangeOptions} onchange={() => loadOverview()} />
        {/snippet}
      </SectionHeader>

      <AsyncState loading={overviewLoading} error={overviewError} empty={!analytics} emptyMessage={m.invites.overviewEmpty()}>
        {#if analytics}
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatTile label={m.common.joins()} value={formatNumber(analytics.joins)} />
            <StatTile label={m.common.leaves()} value={formatNumber(analytics.leaves)} />
            <StatTile label={m.common.netGrowth()} value={formatSigned(analytics.netGrowth)} tone={analytics.netGrowth >= 0 ? "ok" : "crit"} />
            <StatTile label={m.common.retention()} value={formatPercent(analytics.retention ?? null)} sub={m.invites.statStayed({ count: formatNumber(analytics.stayed) })} />
            <StatTile label={m.invites.statFakeJoins()} value={formatNumber(analytics.fakeJoins)} tone={analytics.fakeJoins > 0 ? "warn" : null} />
            <StatTile label={m.invites.statViaInvites()} value={formatNumber(analytics.sources.invite)} sub={m.invites.statSources({ vanity: analytics.sources.vanity, bots: analytics.sources.bot, unknown: analytics.sources.unknown })} />
          </div>

          <Card title={m.common.joinsAndLeaves()} class="mb-6">
            <SimpleLineChart labels={growthLabels} series={growthSeries} height={220} beginAtZero empty={m.invites.overviewChartEmpty()} />
          </Card>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title={m.common.topInviters()}>
              {#if analytics.topInviters.length === 0}
                <p class="text-sm" style="color: {$colorStore.muted}">{m.invites.overviewTopInvitersEmpty()}</p>
              {:else}
                <RankList
                  rows={analytics.topInviters.map((x, i) => ({
                    rank: i + 1,
                    id: x.userId.toString(),
                    name: x.username,
                    value: formatNumber(x.total),
                    detail: m.invites.topInviterDetail({ regular: x.regular, left: x.left, fake: x.fake }),
                  }))}
                  onselect={(row) => { openDetail(row.id); activeTab = "leaderboard"; }}
                />
              {/if}
            </Card>
            <Card title={m.invites.overviewTopCodes()}>
              {#if analytics.topCodes.length === 0}
                <p class="text-sm" style="color: {$colorStore.muted}">{m.invites.overviewTopCodesEmpty()}</p>
              {:else}
                <ul class="space-y-2">
                  {#each analytics.topCodes as code (code.code)}
                    <li class="flex items-center justify-between gap-3 rounded-lg p-3" style="background: {$colorStore.primary}08;">
                      <div class="min-w-0">
                        <p class="font-mono text-sm truncate" style="color: {$colorStore.text}">{code.code}</p>
                        {#if code.label}
                          <p class="text-xs truncate" style="color: {$colorStore.muted}">{code.label}</p>
                        {/if}
                      </div>
                      <span class="font-semibold tabular-nums" style="color: {$colorStore.secondary}">{formatNumber(code.joins)}</span>
                    </li>
                  {/each}
                </ul>
              {/if}
            </Card>
          </div>
        {/if}
      </AsyncState>
    </section>
  {/if}

  {#if activeTab === "leaderboard"}
    <section>
      <SectionHeader icon="fa-trophy" title={m.common.inviteLeaderboard()} subtitle={m.invites.boardSubtitle()}>
        {#snippet actions()}
          <WindowPicker bind:value={boardRange} options={rangeOptions} onchange={() => { boardPage = 1; loadLeaderboard(); }} />
          <div class="w-48">
            <DiscordSelector type="role" options={roles} bind:selected={boardRole} placeholder={m.invites.boardRolePlaceholder()} onchange={() => { boardPage = 1; loadLeaderboard(); }} />
          </div>
          <button
            type="button"
            class="px-3 min-h-[36px] rounded-lg text-sm font-medium"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
            onclick={exportLeaderboard}
          >
            <i class="fa-solid fa-download mr-1" aria-hidden="true"></i> CSV
          </button>
        {/snippet}
      </SectionHeader>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div class="xl:col-span-2">
          <AsyncState loading={boardLoading} error={boardError} empty={leaderboard.length === 0} emptyMessage={m.invites.boardEmpty()} emptyIcon="fa-users">
            <RankList rows={boardRows} onselect={(row) => openDetail(row.id)} />
            <div class="flex justify-center items-center gap-2 mt-6">
              <button
                type="button"
                class="px-4 min-h-[40px] rounded-lg"
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; opacity: {boardPage <= 1 ? 0.5 : 1};"
                disabled={boardPage <= 1}
                onclick={() => { boardPage -= 1; loadLeaderboard(); }}
              >{m.common.previous()}</button>
              <span class="px-4 min-h-[40px] flex items-center rounded-lg" style="background: {$colorStore.primary}30; color: {$colorStore.text};">{m.common.pageNumber({ page: boardPage })}</span>
              <button
                type="button"
                class="px-4 min-h-[40px] rounded-lg"
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; opacity: {leaderboard.length < boardPageSize ? 0.5 : 1};"
                disabled={leaderboard.length < boardPageSize}
                onclick={() => { boardPage += 1; loadLeaderboard(); }}
              >{m.common.next()}</button>
            </div>
          </AsyncState>
        </div>

        <div>
          <Card title={m.common.member()}>
            <div class="mb-3">
              <DiscordSelector
                type="custom"
                options={members}
                customIcon="fa-user"
                placeholder={m.common.pickMemberPlaceholder()}
                selected={detailUserId}
                onchange={(e) => { if (typeof e.selected === "string") openDetail(e.selected); }}
              />
            </div>
            {#if detailLoading}
              <p class="text-sm" style="color: {$colorStore.muted}">{m.common.loading()}</p>
            {:else if detail && detailUserId}
              <div class="grid grid-cols-2 gap-2 mb-4">
                <StatTile label={m.common.total()} value={formatNumber(detail.total)} sub={detail.rank ? m.common.rankNumber({ rank: detail.rank }) : m.invites.detailUnranked()} />
                <StatTile label={m.invites.detailRegular()} value={formatNumber(detail.regular)} />
                <StatTile label={m.common.left()} value={formatNumber(detail.left)} />
                <StatTile label={m.invites.detailFake()} value={formatNumber(detail.fake)} tone={detail.fake > 0 ? "warn" : null} />
                <StatTile label={m.invites.detailBonus()} value={formatNumber(detail.bonus)} />
                <StatTile
                  label={m.invites.detailInvitedBy()}
                  value={detailInviter?.inviter?.username ?? (detailInviter ? detailInviter.joinType : m.common.unknown())}
                  sub={detailInviter?.inviteCode ? m.invites.detailCode({ code: detailInviter.inviteCode }) : undefined}
                />
              </div>

              <h4 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">{m.invites.detailAdjust()}</h4>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <SettingField label={m.invites.detailRegular()} hint={m.invites.detailHintAdds()} id="adjust-regular">
                  <input id="adjust-regular" type="number" bind:value={adjustRegular} class="w-full rounded-lg p-2 min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text};" />
                </SettingField>
                <SettingField label={m.invites.detailBonus()} hint={m.invites.detailHintAdds()} id="adjust-bonus">
                  <input id="adjust-bonus" type="number" bind:value={adjustBonus} class="w-full rounded-lg p-2 min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text};" />
                </SettingField>
                <SettingField label={m.invites.detailFake()} hint={m.invites.detailHintFlags()} id="adjust-fake">
                  <input id="adjust-fake" type="number" bind:value={adjustFake} class="w-full rounded-lg p-2 min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text};" />
                </SettingField>
              </div>
              <div class="flex gap-2">
                <button type="button" class="flex-1 min-h-[44px] rounded-lg font-medium" style="background: {$colorStore.primary}; color: #fff;" onclick={applyAdjust}>{m.common.apply()}</button>
                <button type="button" class="min-h-[44px] px-4 rounded-lg font-medium" style="background: {$colorStore.accent}20; color: {$colorStore.accent};" onclick={resetMember}>{m.common.reset()}</button>
              </div>
            {:else}
              <p class="text-sm" style="color: {$colorStore.muted}">{m.invites.detailEmpty()}</p>
            {/if}
          </Card>
        </div>
      </div>
    </section>
  {/if}

  {#if activeTab === "members"}
    <section>
      <SectionHeader icon="fa-user-plus" title={m.invites.membersTitle()} subtitle={m.invites.membersSubtitle()}>
        {#snippet actions()}
          <button
            type="button"
            class="px-3 min-h-[36px] rounded-lg text-sm font-medium"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
            onclick={exportInvited}
          >
            <i class="fa-solid fa-download mr-1" aria-hidden="true"></i> CSV
          </button>
        {/snippet}
      </SectionHeader>

      <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <div>
          <DiscordSelector type="custom" options={members} customIcon="fa-user" placeholder={m.placeholders.categoryInviter()} bind:selected={memberFilterInviter} onchange={() => { memberPage = 1; loadInvited(); }} />
        </div>
        <input
          type="text"
          placeholder={m.invites.membersFilterCode()}
          bind:value={memberFilterCode}
          onchange={() => { memberPage = 1; loadInvited(); }}
          class="rounded-lg p-2 min-h-[44px]"
          style="background: {$colorStore.primary}10; color: {$colorStore.text};"
          aria-label={m.invites.membersFilterCodeAria()}
        />
        <input
          type="text"
          placeholder={m.common.label()}
          bind:value={memberFilterLabel}
          onchange={() => { memberPage = 1; loadInvited(); }}
          class="rounded-lg p-2 min-h-[44px]"
          style="background: {$colorStore.primary}10; color: {$colorStore.text};"
          aria-label={m.invites.membersFilterLabelAria()}
        />
        <SettingToggle id="include-left" label={m.invites.membersIncludeLeft()} hint={m.invites.membersIncludeLeftHint()} checked={memberIncludeLeft} onchange={(v) => { memberIncludeLeft = v; memberPage = 1; loadInvited(); }} />
      </div>

      <AsyncState loading={membersLoading} error={membersError} empty={!invitedPage || invitedPage.items.length === 0} emptyMessage={m.invites.membersEmpty()} emptyIcon="fa-users">
        {#if invitedPage}
          <div class="overflow-x-auto rounded-xl border" style="border-color: {$colorStore.primary}20;">
            <table class="w-full text-sm">
              <thead>
                <tr style="background: {$colorStore.primary}10; color: {$colorStore.muted};">
                  <th class="text-left p-3">{m.common.member()}</th>
                  <th class="text-left p-3">{m.placeholders.categoryInviter()}</th>
                  <th class="text-left p-3">{m.invites.membersColCode()}</th>
                  <th class="text-left p-3">{m.invites.membersColHow()}</th>
                  <th class="text-left p-3">{m.common.joined()}</th>
                  <th class="text-left p-3">{m.common.status()}</th>
                </tr>
              </thead>
              <tbody>
                {#each invitedPage.items as item (item.userId.toString() + (item.joinedAt ?? ""))}
                  <tr style="border-top: 1px solid {$colorStore.primary}10; color: {$colorStore.text};">
                    <td class="p-3">
                      <div class="flex items-center gap-2 min-w-0">
                        {#if item.avatarUrl}<img src={item.avatarUrl} alt="" class="w-7 h-7 rounded-full" loading="lazy" />{/if}
                        <span class="truncate">{item.username ?? item.userId.toString()}</span>
                      </div>
                    </td>
                    <td class="p-3">{item.inviterId && item.inviterId !== 0n ? memberName(item.inviterId) : "-"}</td>
                    <td class="p-3 font-mono">{item.inviteCode ?? "-"}</td>
                    <td class="p-3">{item.joinType}</td>
                    <td class="p-3" title={item.joinedAt ?? ""}>{formatAgo(item.joinedAt)}</td>
                    <td class="p-3">
                      {#if item.isFake}
                        <Pill tone="warn" text={m.invites.membersPillFake({ reason: item.fakeReason })} />
                      {:else if item.leftAt}
                        <Pill tone="muted" text={m.invites.membersPillLeft()} />
                      {:else}
                        <Pill tone="ok" text={m.common.present()} />
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <div class="flex justify-center items-center gap-2 mt-6">
            <button type="button" class="px-4 min-h-[40px] rounded-lg" style="background: {$colorStore.primary}20; color: {$colorStore.text}; opacity: {memberPage <= 1 ? 0.5 : 1};" disabled={memberPage <= 1} onclick={() => { memberPage -= 1; loadInvited(); }}>{m.common.previous()}</button>
            <span class="px-4 min-h-[40px] flex items-center rounded-lg" style="background: {$colorStore.primary}30; color: {$colorStore.text};">{m.invites.membersPager({ page: memberPage, pages: memberPages, total: formatNumber(invitedPage.total) })}</span>
            <button type="button" class="px-4 min-h-[40px] rounded-lg" style="background: {$colorStore.primary}20; color: {$colorStore.text}; opacity: {memberPage >= memberPages ? 0.5 : 1};" disabled={memberPage >= memberPages} onclick={() => { memberPage += 1; loadInvited(); }}>{m.common.next()}</button>
          </div>
        {/if}
      </AsyncState>
    </section>
  {/if}

  {#if activeTab === "codes"}
    <section>
      <SectionHeader icon="fa-link" title={m.invites.codesTitle()} subtitle={m.invites.codesSubtitle()} />

      <AsyncState loading={codesLoading} error={codesError} empty={codes.length === 0} emptyMessage={m.invites.codesEmpty()} emptyIcon="fa-link">
        <div class="space-y-3">
          {#each codes as code (code.code)}
            <div class="rounded-xl p-4 border" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
              <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div class="min-w-0">
                  <p class="font-mono font-semibold" style="color: {$colorStore.text}">{code.code}</p>
                  <p class="text-xs" style="color: {$colorStore.muted}">
                    {code.inviterName ?? (code.ownerUserId ? memberName(code.ownerUserId) : m.common.unknownLower())} · #{channels.find((c) => c.id === code.channelId.toString())?.name ?? code.channelId.toString()}
                    · {codeUsage(code)}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  {#if code.ownerUserId}<Pill tone="ok" text={m.invites.codesCredits({ user: memberName(code.ownerUserId) })} />{/if}
                  <button type="button" class="min-h-[36px] px-3 rounded-lg text-sm" style="background: {$colorStore.accent}20; color: {$colorStore.accent};" onclick={() => deleteCode(code.code)}>{m.common.delete()}</button>
                </div>
              </div>
              {#if labelDrafts[code.code]}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
                  <SettingField label={m.common.label()} hint={m.invites.codesLabelHint()} id={`label-${code.code}`}>
                    <input id={`label-${code.code}`} type="text" maxlength="64" placeholder={m.invites.codesLabelPlaceholder()} bind:value={labelDrafts[code.code].label} oninput={() => scheduleLabel(code.code)} onblur={() => flushLabel(code.code)} class="w-full rounded-lg p-2 min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text};" />
                  </SettingField>
                  <SettingField label={m.invites.codesRole()} hint={m.invites.codesRoleHint()} id={`role-${code.code}`}>
                    <DiscordSelector id={`role-${code.code}`} type="role" options={roles} bind:selected={labelDrafts[code.code].roleId} disabled={!labelDrafts[code.code].label.trim()} placeholder={labelDrafts[code.code].label.trim() ? m.common.noRole() : m.invites.codesRoleNeedsLabel()} onchange={() => saveLabelRole(code.code)} />
                  </SettingField>
                </div>
              {/if}
            </div>
          {/each}
        </div>

        {#if labels.some((l) => !codes.find((c) => c.code === l.inviteCode))}
          <h3 class="font-semibold mt-8 mb-2" style="color: {$colorStore.text}">{m.invites.codesStaleTitle()}</h3>
          <ul class="space-y-2">
            {#each labels.filter((l) => !codes.find((c) => c.code === l.inviteCode)) as label (label.id)}
              <li class="flex items-center justify-between rounded-lg p-3" style="background: {$colorStore.primary}08;">
                <span style="color: {$colorStore.text}"><span class="font-mono">{label.inviteCode}</span> · {label.label}</span>
                <button type="button" class="min-h-[36px] px-3 rounded-lg text-sm" style="background: {$colorStore.accent}20; color: {$colorStore.accent};" onclick={() => inviteTrackingApi.removeLabel($currentGuild!.id, label.inviteCode).then(loadCodes).catch((e) => fail(e, m.invites.errorRemoveLabel()))}>{m.common.remove()}</button>
              </li>
            {/each}
          </ul>
        {/if}
      </AsyncState>
    </section>
  {/if}

  {#if activeTab === "settings"}
    <section>
      <SectionHeader icon="fa-gear" title={m.invites.settingsTitle()} />

      <AsyncState loading={settingsLoading} error={settingsError} empty={!settings}>
        {#if settings}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            <SettingToggle id="tracking" label={m.invites.settingsTracking()} hint={m.invites.settingsTrackingHint()} checked={settings.isEnabled} onchange={(v) => autoSaveSetting("tracking", () => inviteTrackingApi.toggleInviteTracking($currentGuild!.id, v))} />
            <SettingToggle id="remove-on-leave" label={m.invites.settingsRemoveOnLeave()} hint={m.invites.settingsRemoveOnLeaveHint()} checked={settings.removeInviteOnLeave} onchange={(v) => autoSaveSetting("remove-on-leave", () => inviteTrackingApi.setRemoveOnLeave($currentGuild!.id, v))} />
            <SettingToggle id="count-rejoins" label={m.invites.settingsCountRejoins()} hint={m.invites.settingsCountRejoinsHint()} checked={settings.countRejoins} onchange={(v) => autoSaveSetting("count-rejoins", () => inviteTrackingApi.setCountRejoins($currentGuild!.id, v))} />
            <SettingToggle id="fake-no-avatar" label={m.invites.settingsFakeNoAvatar()} hint={m.invites.settingsFakeNoAvatarHint()} checked={settings.fakeOnNoAvatar} onchange={(v) => autoSaveSetting("fake-no-avatar", () => inviteTrackingApi.setFakeOnNoAvatar($currentGuild!.id, v))} />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <SettingField label={m.common.minAccountAgeDays()} hint={m.invites.settingsMinAgeHint()} id="min-age">
              <input id="min-age" type="number" min="0" max="300" bind:value={minAgeDays} oninput={scheduleMinAge} onblur={flushMinAge} class="w-full rounded-lg p-2 min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text};" />
            </SettingField>
            <SettingField label={m.invites.settingsLinkChannel()} hint={m.invites.settingsLinkChannelHint()} id="link-channel">
              <DiscordSelector id="link-channel" type="channel" options={channels} selected={settings.linkChannelId ? settings.linkChannelId.toString() : null} placeholder={m.invites.settingsLinkChannelPlaceholder()} onchange={(e) => autoSaveSetting("link-channel", () => inviteTrackingApi.setLinkChannel($currentGuild!.id, typeof e.selected === "string" && e.selected ? BigInt(e.selected) : null))} />
            </SettingField>
            <SettingField label={m.invites.settingsLogChannel()} hint={m.invites.settingsLogChannelHint()} id="log-channel">
              <DiscordSelector id="log-channel" type="channel" options={channels} selected={settings.logChannelId ? settings.logChannelId.toString() : null} placeholder={m.common.disabled()} onchange={(e) => autoSaveSetting("log-channel", () => inviteTrackingApi.setLogChannel($currentGuild!.id, typeof e.selected === "string" && e.selected ? BigInt(e.selected) : null))} />
            </SettingField>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card title={m.invites.settingsBlacklistUsers()} note={m.invites.settingsBlacklistUsersNote()}>
              <div class="flex gap-2 mb-3">
                <div class="grow"><DiscordSelector type="custom" options={members} customIcon="fa-user" placeholder={m.common.addAMember()} bind:selected={exclusionUser} /></div>
                <button type="button" class="min-h-[44px] px-3 rounded-lg" style="background: {$colorStore.primary}; color: #fff;" onclick={() => addExclusion(InviteExclusionKind.BlacklistedUser, exclusionUser)}>{m.common.add()}</button>
              </div>
              <ul class="space-y-1">
                {#each blacklistedUsers as id (id)}
                  <li class="flex items-center justify-between rounded-lg p-2" style="background: {$colorStore.primary}08; color: {$colorStore.text};">
                    <span class="truncate">{memberName(id)}</span>
                    <button type="button" class="text-sm px-2 min-h-[32px]" style="color: {$colorStore.accent};" onclick={() => removeExclusion(InviteExclusionKind.BlacklistedUser, id)} aria-label={m.common.remove()}>✕</button>
                  </li>
                {/each}
              </ul>
            </Card>
            <Card title={m.common.blacklistedRoles()} note={m.invites.settingsBlacklistRolesNote()}>
              <div class="flex gap-2 mb-3">
                <div class="grow"><DiscordSelector type="role" options={roles} placeholder={m.common.addARole()} bind:selected={exclusionRole} /></div>
                <button type="button" class="min-h-[44px] px-3 rounded-lg" style="background: {$colorStore.primary}; color: #fff;" onclick={() => addExclusion(InviteExclusionKind.BlacklistedRole, exclusionRole)}>{m.common.add()}</button>
              </div>
              <ul class="space-y-1">
                {#each blacklistedRoles as id (id)}
                  <li class="flex items-center justify-between rounded-lg p-2" style="background: {$colorStore.primary}08; color: {$colorStore.text};">
                    <span class="truncate">@{roleName(id)}</span>
                    <button type="button" class="text-sm px-2 min-h-[32px]" style="color: {$colorStore.accent};" onclick={() => removeExclusion(InviteExclusionKind.BlacklistedRole, id)} aria-label={m.common.remove()}>✕</button>
                  </li>
                {/each}
              </ul>
            </Card>
            <Card title={m.invites.settingsHidden()} note={m.invites.settingsHiddenNote()}>
              <div class="flex gap-2 mb-3">
                <div class="grow"><DiscordSelector type="custom" options={members} customIcon="fa-user" placeholder={m.common.addAMember()} bind:selected={hiddenUser} /></div>
                <button type="button" class="min-h-[44px] px-3 rounded-lg" style="background: {$colorStore.primary}; color: #fff;" onclick={() => addExclusion(InviteExclusionKind.HiddenUser, hiddenUser)}>{m.common.add()}</button>
              </div>
              <ul class="space-y-1">
                {#each hiddenUsers as id (id)}
                  <li class="flex items-center justify-between rounded-lg p-2" style="background: {$colorStore.primary}08; color: {$colorStore.text};">
                    <span class="truncate">{memberName(id)}</span>
                    <button type="button" class="text-sm px-2 min-h-[32px]" style="color: {$colorStore.accent};" onclick={() => removeExclusion(InviteExclusionKind.HiddenUser, id)} aria-label={m.common.remove()}>✕</button>
                  </li>
                {/each}
              </ul>
            </Card>
          </div>

          <Card title={m.common.maintenance()} note={m.invites.settingsMaintenanceNote()}>
            <div class="flex flex-wrap gap-2">
              <button type="button" class="min-h-[44px] px-4 rounded-lg font-medium" style="background: {$colorStore.primary}20; color: {$colorStore.primary};" onclick={syncInvites}>{m.invites.settingsSync()}</button>
              <button type="button" class="min-h-[44px] px-4 rounded-lg font-medium" style="background: {$colorStore.accent}20; color: {$colorStore.accent};" onclick={() => resetAll(InviteResetScope.LeftMembers)}>{m.invites.settingsResetLeft()}</button>
              <button type="button" class="min-h-[44px] px-4 rounded-lg font-medium" style="background: {$colorStore.accent}; color: #fff;" onclick={() => resetAll(InviteResetScope.Server)}>{m.common.resetEverything()}</button>
            </div>
            <p class="text-xs mt-3" style="color: {$colorStore.muted}">{m.invites.settingsSyncHint()}</p>
          </Card>
        {/if}
      </AsyncState>
    </section>
  {/if}
</DashboardPageLayout>
