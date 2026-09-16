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

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const tabs = [
    { id: "overview", label: "Overview", icon: "fa-chart-line" },
    { id: "leaderboard", label: "Leaderboard", icon: "fa-trophy" },
    { id: "members", label: "Members", icon: "fa-user-plus" },
    { id: "codes", label: "Codes & Labels", icon: "fa-link" },
    { id: "settings", label: "Settings", icon: "fa-gear" },
  ];

  let activeTab = $state("overview");
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
    members = memberList.map((m: any) => ({ id: m.id.toString(), name: m.username, avatarUrl: m.avatarUrl }));
    roles = roleList.map((r: any) => ({ id: r.id.toString(), name: r.name, color: r.color }));
    channels = channelList.map((c) => ({ id: c.id.toString(), name: c.name }));
  }

  function memberName(id: bigint | string): string {
    const key = id.toString();
    return members.find((m) => m.id === key)?.name ?? key;
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
      overviewError = err instanceof Error ? err.message : "Failed to load analytics";
      logger.error("Failed to load invite analytics", err);
    } finally {
      overviewLoading = false;
    }
  }

  let growthLabels = $derived(analytics?.series.map((p) => formatDate(p.day)) ?? []);
  let growthSeries = $derived(
    analytics
      ? [
          { name: "Joins", data: analytics.series.map((p) => p.joins), color: "#4ade80" },
          { name: "Leaves", data: analytics.series.map((p) => p.leaves), color: "#f87171" },
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
      boardError = err instanceof Error ? err.message : "Failed to load leaderboard";
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
      detail: `${e.regular} regular · ${e.left} left · ${e.fake} fake · ${e.bonus} bonus` +
        (e.retention !== null && e.retention !== undefined ? ` · ${formatPercent(e.retention)} retained` : ""),
    })),
  );

  async function exportLeaderboard() {
    if (!$currentGuild?.id) return;
    try {
      const blob = await inviteTrackingApi.exportLeaderboard($currentGuild.id, boardRange as StatsRangeValue);
      saveBlob(blob, `invites-${statsRangeLabels[boardRange as StatsRangeValue].replace(/\s+/g, "-").toLowerCase()}.csv`);
    } catch (err) {
      fail(err, "Failed to export the leaderboard");
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
      fail(err, "Failed to load the member's invites");
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
      fail(err, "Failed to adjust invites");
    }
  }

  async function resetMember() {
    if (!$currentGuild?.id || !detailUserId) return;
    const ok = await requestConfirmation({
      title: "Reset invites",
      message: `Reset all invites for ${memberName(detailUserId)}? This cannot be undone.`,
      confirmText: "Reset",
    });
    if (!ok) return;
    try {
      await inviteTrackingApi.resetUser($currentGuild.id, BigInt(detailUserId));
      await Promise.all([openDetail(detailUserId), loadLeaderboard()]);
    } catch (err) {
      fail(err, "Failed to reset invites");
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
      membersError = err instanceof Error ? err.message : "Failed to load members";
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
      fail(err, "Failed to export members");
    }
  }

  /** Codes and labels */
  let codes = $state<GuildInviteCode[]>([]);
  let labels = $state<InviteLabel[]>([]);
  let codesLoading = $state(false);
  let codesError = $state<string | null>(null);
  let labelDrafts = $state<Record<string, { label: string; roleId: string | null }>>({});

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
    } catch (err) {
      codesError = err instanceof Error ? err.message : "Failed to load invite codes";
      logger.error("Failed to load invite codes", err);
    } finally {
      codesLoading = false;
    }
  }

  async function saveLabel(code: string) {
    if (!$currentGuild?.id) return;
    const draft = labelDrafts[code];
    if (!draft) return;
    try {
      if (!draft.label.trim()) {
        await inviteTrackingApi.removeLabel($currentGuild.id, code);
      } else {
        await inviteTrackingApi.setLabel($currentGuild.id, {
          code,
          label: draft.label.trim(),
          roleId: draft.roleId ? BigInt(draft.roleId) : null,
        });
      }
      await loadCodes();
    } catch (err) {
      fail(err, "Failed to save the label");
    }
  }

  async function deleteCode(code: string) {
    if (!$currentGuild?.id) return;
    const ok = await requestConfirmation({
      title: "Delete invite",
      message: `Delete invite code ${code}? Anyone holding the link will no longer be able to use it.`,
      confirmText: "Delete",
    });
    if (!ok) return;
    try {
      await inviteTrackingApi.deleteCode($currentGuild.id, code);
      await loadCodes();
    } catch (err) {
      fail(err, "Failed to delete the invite");
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
      blacklistedUsers = users.map((x) => x.toString());
      blacklistedRoles = roleIds.map((x) => x.toString());
      hiddenUsers = hidden.map((x) => x.toString());
    } catch (err) {
      settingsError = err instanceof Error ? err.message : "Failed to load settings";
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

  async function saveMinAge() {
    if (!$currentGuild?.id) return;
    const days = Math.max(0, Math.min(300, Math.round(minAgeDays)));
    await saveSetting(() => inviteTrackingApi.setMinAccountAge($currentGuild!.id, `${days}.00:00:00`), "Failed to save the minimum account age");
  }

  async function addExclusion(kind: 0 | 1 | 2, target: string | null) {
    if (!$currentGuild?.id || !target) return;
    await saveSetting(() => inviteTrackingApi.addExclusion($currentGuild!.id, kind, BigInt(target)), "Failed to add the exclusion");
    exclusionUser = null;
    exclusionRole = null;
    hiddenUser = null;
  }

  async function removeExclusion(kind: 0 | 1 | 2, target: string) {
    if (!$currentGuild?.id) return;
    await saveSetting(() => inviteTrackingApi.removeExclusion($currentGuild!.id, kind, BigInt(target)), "Failed to remove the exclusion");
  }

  async function syncInvites() {
    if (!$currentGuild?.id) return;
    try {
      const raised = await inviteTrackingApi.sync($currentGuild.id);
      notify(`Imported invite uses from Discord and raised totals for ${raised} inviters.`, "success");
      await loadLeaderboard();
    } catch (err) {
      fail(err, "Failed to sync invites");
    }
  }

  async function resetAll(scope: 0 | 1) {
    if (!$currentGuild?.id) return;
    const ok = await requestConfirmation({
      title: scope === InviteResetScope.Server ? "Reset every invite" : "Reset invites of members who left",
      message:
        scope === InviteResetScope.Server
          ? "This clears every inviter's tally and the join history for this server. It cannot be undone."
          : "This clears the tally of every inviter who is no longer in the server.",
      confirmText: "Reset",
    });
    if (!ok) return;
    try {
      const count = await inviteTrackingApi.reset($currentGuild.id, scope);
      notify(`Reset invites for ${count} inviters.`, "success");
      await loadLeaderboard();
    } catch (err) {
      fail(err, "Failed to reset invites");
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
  title="Invite Tracking"
  subtitle="Who brings people in, how they arrive, and whether they stay"
  icon="fa-user-plus"
  guildName={$currentGuild?.name || "Dashboard"}
  {tabs}
  bind:activeTab
  bind:notificationMessage
  {notificationType}
>
  {#if activeTab === "overview"}
    <section>
      <SectionHeader icon="fa-chart-pie" title="Growth" subtitle="Joins, leaves and where members come from">
        {#snippet actions()}
          <WindowPicker bind:value={overviewRange} options={rangeOptions} onchange={() => loadOverview()} />
        {/snippet}
      </SectionHeader>

      <AsyncState loading={overviewLoading} error={overviewError} empty={!analytics} emptyMessage="No joins recorded yet">
        {#if analytics}
          <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
            <StatTile label="Joins" value={formatNumber(analytics.joins)} />
            <StatTile label="Leaves" value={formatNumber(analytics.leaves)} />
            <StatTile label="Net growth" value={formatSigned(analytics.netGrowth)} tone={analytics.netGrowth >= 0 ? "ok" : "crit"} />
            <StatTile label="Retention" value={formatPercent(analytics.retention ?? null)} sub={`${formatNumber(analytics.stayed)} stayed`} />
            <StatTile label="Fake joins" value={formatNumber(analytics.fakeJoins)} tone={analytics.fakeJoins > 0 ? "warn" : null} />
            <StatTile label="Via invites" value={formatNumber(analytics.sources.invite)} sub={`${analytics.sources.vanity} vanity · ${analytics.sources.bot} bots · ${analytics.sources.unknown} unknown`} />
          </div>

          <Card title="Joins and leaves" class="mb-6">
            <SimpleLineChart labels={growthLabels} series={growthSeries} height={220} beginAtZero empty="No joins in this window" />
          </Card>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Top inviters">
              {#if analytics.topInviters.length === 0}
                <p class="text-sm" style="color: {$colorStore.muted}">Nobody has invited anyone in this window.</p>
              {:else}
                <RankList
                  rows={analytics.topInviters.map((x, i) => ({
                    rank: i + 1,
                    id: x.userId.toString(),
                    name: x.username,
                    value: formatNumber(x.total),
                    detail: `${x.regular} regular · ${x.left} left · ${x.fake} fake`,
                  }))}
                  onselect={(row) => { openDetail(row.id); activeTab = "leaderboard"; }}
                />
              {/if}
            </Card>
            <Card title="Top invite codes">
              {#if analytics.topCodes.length === 0}
                <p class="text-sm" style="color: {$colorStore.muted}">No invite codes were used in this window.</p>
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
      <SectionHeader icon="fa-trophy" title="Invite Leaderboard" subtitle="Net total is regular minus left minus fake, plus bonus">
        {#snippet actions()}
          <WindowPicker bind:value={boardRange} options={rangeOptions} onchange={() => { boardPage = 1; loadLeaderboard(); }} />
          <div class="w-48">
            <DiscordSelector type="role" options={roles} bind:selected={boardRole} placeholder="Any role" onchange={() => { boardPage = 1; loadLeaderboard(); }} />
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
          <AsyncState loading={boardLoading} error={boardError} empty={leaderboard.length === 0} emptyMessage="No invites recorded for this window" emptyIcon="fa-users">
            <RankList rows={boardRows} onselect={(row) => openDetail(row.id)} />
            <div class="flex justify-center items-center gap-2 mt-6">
              <button
                type="button"
                class="px-4 min-h-[40px] rounded-lg"
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; opacity: {boardPage <= 1 ? 0.5 : 1};"
                disabled={boardPage <= 1}
                onclick={() => { boardPage -= 1; loadLeaderboard(); }}
              >Previous</button>
              <span class="px-4 min-h-[40px] flex items-center rounded-lg" style="background: {$colorStore.primary}30; color: {$colorStore.text};">Page {boardPage}</span>
              <button
                type="button"
                class="px-4 min-h-[40px] rounded-lg"
                style="background: {$colorStore.primary}20; color: {$colorStore.text}; opacity: {leaderboard.length < boardPageSize ? 0.5 : 1};"
                disabled={leaderboard.length < boardPageSize}
                onclick={() => { boardPage += 1; loadLeaderboard(); }}
              >Next</button>
            </div>
          </AsyncState>
        </div>

        <div>
          <Card title="Member">
            <div class="mb-3">
              <DiscordSelector
                type="custom"
                options={members}
                customIcon="fa-user"
                placeholder="Pick a member"
                selected={detailUserId}
                onchange={(e) => { if (typeof e.selected === "string") openDetail(e.selected); }}
              />
            </div>
            {#if detailLoading}
              <p class="text-sm" style="color: {$colorStore.muted}">Loading…</p>
            {:else if detail && detailUserId}
              <div class="grid grid-cols-2 gap-2 mb-4">
                <StatTile label="Total" value={formatNumber(detail.total)} sub={detail.rank ? `Rank #${detail.rank}` : "Unranked"} />
                <StatTile label="Regular" value={formatNumber(detail.regular)} />
                <StatTile label="Left" value={formatNumber(detail.left)} />
                <StatTile label="Fake" value={formatNumber(detail.fake)} tone={detail.fake > 0 ? "warn" : null} />
                <StatTile label="Bonus" value={formatNumber(detail.bonus)} />
                <StatTile
                  label="Invited by"
                  value={detailInviter?.inviter?.username ?? (detailInviter ? detailInviter.joinType : "Unknown")}
                  sub={detailInviter?.inviteCode ? `code ${detailInviter.inviteCode}` : undefined}
                />
              </div>

              <h4 class="text-sm font-medium mb-2" style="color: {$colorStore.text}">Adjust</h4>
              <div class="grid grid-cols-3 gap-2 mb-2">
                <SettingField label="Regular" hint="Positive adds, negative removes" id="adjust-regular">
                  <input id="adjust-regular" type="number" bind:value={adjustRegular} class="w-full rounded-lg p-2 min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text};" />
                </SettingField>
                <SettingField label="Bonus" hint="Positive adds, negative removes" id="adjust-bonus">
                  <input id="adjust-bonus" type="number" bind:value={adjustBonus} class="w-full rounded-lg p-2 min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text};" />
                </SettingField>
                <SettingField label="Fake" hint="Positive flags, negative clears" id="adjust-fake">
                  <input id="adjust-fake" type="number" bind:value={adjustFake} class="w-full rounded-lg p-2 min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text};" />
                </SettingField>
              </div>
              <div class="flex gap-2">
                <button type="button" class="flex-1 min-h-[44px] rounded-lg font-medium" style="background: {$colorStore.primary}; color: #fff;" onclick={applyAdjust}>Apply</button>
                <button type="button" class="min-h-[44px] px-4 rounded-lg font-medium" style="background: {$colorStore.accent}20; color: {$colorStore.accent};" onclick={resetMember}>Reset</button>
              </div>
            {:else}
              <p class="text-sm" style="color: {$colorStore.muted}">Pick a member, or click a leaderboard row, to see their breakdown and adjust it.</p>
            {/if}
          </Card>
        </div>
      </div>
    </section>
  {/if}

  {#if activeTab === "members"}
    <section>
      <SectionHeader icon="fa-user-plus" title="Invited Members" subtitle="Every witnessed join, filtered by inviter, code or label">
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
          <DiscordSelector type="custom" options={members} customIcon="fa-user" placeholder="Inviter" bind:selected={memberFilterInviter} onchange={() => { memberPage = 1; loadInvited(); }} />
        </div>
        <input
          type="text"
          placeholder="Invite code"
          bind:value={memberFilterCode}
          onchange={() => { memberPage = 1; loadInvited(); }}
          class="rounded-lg p-2 min-h-[44px]"
          style="background: {$colorStore.primary}10; color: {$colorStore.text};"
          aria-label="Filter by invite code"
        />
        <input
          type="text"
          placeholder="Label"
          bind:value={memberFilterLabel}
          onchange={() => { memberPage = 1; loadInvited(); }}
          class="rounded-lg p-2 min-h-[44px]"
          style="background: {$colorStore.primary}10; color: {$colorStore.text};"
          aria-label="Filter by label"
        />
        <SettingToggle id="include-left" label="Include members who left" hint="Show joins whose member has since left" checked={memberIncludeLeft} onchange={(v) => { memberIncludeLeft = v; memberPage = 1; loadInvited(); }} />
      </div>

      <AsyncState loading={membersLoading} error={membersError} empty={!invitedPage || invitedPage.items.length === 0} emptyMessage="No joins match these filters" emptyIcon="fa-users">
        {#if invitedPage}
          <div class="overflow-x-auto rounded-xl border" style="border-color: {$colorStore.primary}20;">
            <table class="w-full text-sm">
              <thead>
                <tr style="background: {$colorStore.primary}10; color: {$colorStore.muted};">
                  <th class="text-left p-3">Member</th>
                  <th class="text-left p-3">Inviter</th>
                  <th class="text-left p-3">Code</th>
                  <th class="text-left p-3">How</th>
                  <th class="text-left p-3">Joined</th>
                  <th class="text-left p-3">Status</th>
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
                        <Pill tone="warn" text={`fake: ${item.fakeReason}`} />
                      {:else if item.leftAt}
                        <Pill tone="muted" text="left" />
                      {:else}
                        <Pill tone="ok" text="present" />
                      {/if}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <div class="flex justify-center items-center gap-2 mt-6">
            <button type="button" class="px-4 min-h-[40px] rounded-lg" style="background: {$colorStore.primary}20; color: {$colorStore.text}; opacity: {memberPage <= 1 ? 0.5 : 1};" disabled={memberPage <= 1} onclick={() => { memberPage -= 1; loadInvited(); }}>Previous</button>
            <span class="px-4 min-h-[40px] flex items-center rounded-lg" style="background: {$colorStore.primary}30; color: {$colorStore.text};">Page {memberPage} of {memberPages} · {formatNumber(invitedPage.total)} joins</span>
            <button type="button" class="px-4 min-h-[40px] rounded-lg" style="background: {$colorStore.primary}20; color: {$colorStore.text}; opacity: {memberPage >= memberPages ? 0.5 : 1};" disabled={memberPage >= memberPages} onclick={() => { memberPage += 1; loadInvited(); }}>Next</button>
          </div>
        {/if}
      </AsyncState>
    </section>
  {/if}

  {#if activeTab === "codes"}
    <section>
      <SectionHeader icon="fa-link" title="Invite Codes & Labels" subtitle="Name codes so they show up in stats, and grant a role to everyone who joins through one" />

      <AsyncState loading={codesLoading} error={codesError} empty={codes.length === 0} emptyMessage="This server has no invite codes" emptyIcon="fa-link">
        <div class="space-y-3">
          {#each codes as code (code.code)}
            <div class="rounded-xl p-4 border" style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
              <div class="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div class="min-w-0">
                  <p class="font-mono font-semibold" style="color: {$colorStore.text}">{code.code}</p>
                  <p class="text-xs" style="color: {$colorStore.muted}">
                    {code.inviterName ?? (code.ownerUserId ? memberName(code.ownerUserId) : "unknown")} · #{channels.find((c) => c.id === code.channelId.toString())?.name ?? code.channelId.toString()}
                    · {formatNumber(code.uses)} uses{code.maxUses ? ` of ${code.maxUses}` : ""}{code.maxAge ? " · expires" : ""}{code.isTemporary ? " · temporary" : ""}
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  {#if code.ownerUserId}<Pill tone="ok" text={`credits ${memberName(code.ownerUserId)}`} />{/if}
                  <button type="button" class="min-h-[36px] px-3 rounded-lg text-sm" style="background: {$colorStore.accent}20; color: {$colorStore.accent};" onclick={() => deleteCode(code.code)}>Delete</button>
                </div>
              </div>
              {#if labelDrafts[code.code]}
                <div class="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-2 items-end">
                  <SettingField label="Label" hint="Shown in stats, exports and greet placeholders" id={`label-${code.code}`}>
                    <input id={`label-${code.code}`} type="text" maxlength="64" placeholder="e.g. Twitter campaign" bind:value={labelDrafts[code.code].label} class="w-full rounded-lg p-2 min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text};" />
                  </SettingField>
                  <SettingField label="Role on join" hint="Granted to everyone who joins through this code" id={`role-${code.code}`}>
                    <DiscordSelector id={`role-${code.code}`} type="role" options={roles} bind:selected={labelDrafts[code.code].roleId} placeholder="No role" />
                  </SettingField>
                  <button type="button" class="min-h-[44px] px-4 rounded-lg font-medium" style="background: {$colorStore.primary}; color: #fff;" onclick={() => saveLabel(code.code)}>Save</button>
                </div>
              {/if}
            </div>
          {/each}
        </div>

        {#if labels.some((l) => !codes.find((c) => c.code === l.inviteCode))}
          <h3 class="font-semibold mt-8 mb-2" style="color: {$colorStore.text}">Labels for codes that no longer exist</h3>
          <ul class="space-y-2">
            {#each labels.filter((l) => !codes.find((c) => c.code === l.inviteCode)) as label (label.id)}
              <li class="flex items-center justify-between rounded-lg p-3" style="background: {$colorStore.primary}08;">
                <span style="color: {$colorStore.text}"><span class="font-mono">{label.inviteCode}</span> · {label.label}</span>
                <button type="button" class="min-h-[36px] px-3 rounded-lg text-sm" style="background: {$colorStore.accent}20; color: {$colorStore.accent};" onclick={() => inviteTrackingApi.removeLabel($currentGuild!.id, label.inviteCode).then(loadCodes).catch((e) => fail(e, "Failed to remove the label"))}>Remove</button>
              </li>
            {/each}
          </ul>
        {/if}
      </AsyncState>
    </section>
  {/if}

  {#if activeTab === "settings"}
    <section>
      <SectionHeader icon="fa-gear" title="Invite Tracking Settings" />

      <AsyncState loading={settingsLoading} error={settingsError} empty={!settings}>
        {#if settings}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
            <SettingToggle id="tracking" label="Track invites" hint="Attribute every join to an invite, the vanity URL or an app" checked={settings.isEnabled} onchange={(v) => saveSetting(() => inviteTrackingApi.toggleInviteTracking($currentGuild!.id, v), "Failed to update tracking")} />
            <SettingToggle id="remove-on-leave" label="Remove credit when members leave" hint="The inviter's left count goes up and their total goes down" checked={settings.removeInviteOnLeave} onchange={(v) => saveSetting(() => inviteTrackingApi.setRemoveOnLeave($currentGuild!.id, v), "Failed to update the setting")} />
            <SettingToggle id="count-rejoins" label="Count rejoins" hint="Off flags members who have joined before as fake invites" checked={settings.countRejoins} onchange={(v) => saveSetting(() => inviteTrackingApi.setCountRejoins($currentGuild!.id, v), "Failed to update the setting")} />
            <SettingToggle id="fake-no-avatar" label="Flag members without an avatar" hint="Joins from accounts with no avatar count as fake" checked={settings.fakeOnNoAvatar} onchange={(v) => saveSetting(() => inviteTrackingApi.setFakeOnNoAvatar($currentGuild!.id, v), "Failed to update the setting")} />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <SettingField label="Minimum account age (days)" hint="Accounts younger than this are flagged as fake. 0 disables the check." id="min-age">
              <div class="flex gap-2">
                <input id="min-age" type="number" min="0" max="300" bind:value={minAgeDays} class="w-full rounded-lg p-2 min-h-[44px]" style="background: {$colorStore.primary}10; color: {$colorStore.text};" />
                <button type="button" class="min-h-[44px] px-4 rounded-lg font-medium" style="background: {$colorStore.primary}; color: #fff;" onclick={saveMinAge}>Save</button>
              </div>
            </SettingField>
            <SettingField label="Personal link channel" hint="Where links from the invitelink command point. Empty uses the system channel." id="link-channel">
              <DiscordSelector id="link-channel" type="channel" options={channels} selected={settings.linkChannelId ? settings.linkChannelId.toString() : null} placeholder="System channel" onchange={(e) => saveSetting(() => inviteTrackingApi.setLinkChannel($currentGuild!.id, typeof e.selected === "string" && e.selected ? BigInt(e.selected) : null), "Failed to update the channel")} />
            </SettingField>
            <SettingField label="Join and leave log channel" hint="Posts who invited whom and how, on every join and leave" id="log-channel">
              <DiscordSelector id="log-channel" type="channel" options={channels} selected={settings.logChannelId ? settings.logChannelId.toString() : null} placeholder="Disabled" onchange={(e) => saveSetting(() => inviteTrackingApi.setLogChannel($currentGuild!.id, typeof e.selected === "string" && e.selected ? BigInt(e.selected) : null), "Failed to update the channel")} />
            </SettingField>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card title="Blacklisted inviters" note="Never earn invite credit">
              <div class="flex gap-2 mb-3">
                <div class="grow"><DiscordSelector type="custom" options={members} customIcon="fa-user" placeholder="Add a member" bind:selected={exclusionUser} /></div>
                <button type="button" class="min-h-[44px] px-3 rounded-lg" style="background: {$colorStore.primary}; color: #fff;" onclick={() => addExclusion(InviteExclusionKind.BlacklistedUser, exclusionUser)}>Add</button>
              </div>
              <ul class="space-y-1">
                {#each blacklistedUsers as id (id)}
                  <li class="flex items-center justify-between rounded-lg p-2" style="background: {$colorStore.primary}08; color: {$colorStore.text};">
                    <span class="truncate">{memberName(id)}</span>
                    <button type="button" class="text-sm px-2 min-h-[32px]" style="color: {$colorStore.accent};" onclick={() => removeExclusion(InviteExclusionKind.BlacklistedUser, id)} aria-label="Remove">✕</button>
                  </li>
                {/each}
              </ul>
            </Card>
            <Card title="Blacklisted roles" note="Holders never earn invite credit">
              <div class="flex gap-2 mb-3">
                <div class="grow"><DiscordSelector type="role" options={roles} placeholder="Add a role" bind:selected={exclusionRole} /></div>
                <button type="button" class="min-h-[44px] px-3 rounded-lg" style="background: {$colorStore.primary}; color: #fff;" onclick={() => addExclusion(InviteExclusionKind.BlacklistedRole, exclusionRole)}>Add</button>
              </div>
              <ul class="space-y-1">
                {#each blacklistedRoles as id (id)}
                  <li class="flex items-center justify-between rounded-lg p-2" style="background: {$colorStore.primary}08; color: {$colorStore.text};">
                    <span class="truncate">@{roleName(id)}</span>
                    <button type="button" class="text-sm px-2 min-h-[32px]" style="color: {$colorStore.accent};" onclick={() => removeExclusion(InviteExclusionKind.BlacklistedRole, id)} aria-label="Remove">✕</button>
                  </li>
                {/each}
              </ul>
            </Card>
            <Card title="Hidden from leaderboard" note="Still tracked, never shown">
              <div class="flex gap-2 mb-3">
                <div class="grow"><DiscordSelector type="custom" options={members} customIcon="fa-user" placeholder="Add a member" bind:selected={hiddenUser} /></div>
                <button type="button" class="min-h-[44px] px-3 rounded-lg" style="background: {$colorStore.primary}; color: #fff;" onclick={() => addExclusion(InviteExclusionKind.HiddenUser, hiddenUser)}>Add</button>
              </div>
              <ul class="space-y-1">
                {#each hiddenUsers as id (id)}
                  <li class="flex items-center justify-between rounded-lg p-2" style="background: {$colorStore.primary}08; color: {$colorStore.text};">
                    <span class="truncate">{memberName(id)}</span>
                    <button type="button" class="text-sm px-2 min-h-[32px]" style="color: {$colorStore.accent};" onclick={() => removeExclusion(InviteExclusionKind.HiddenUser, id)} aria-label="Remove">✕</button>
                  </li>
                {/each}
              </ul>
            </Card>
          </div>

          <Card title="Maintenance" note="Bulk operations on the tallies">
            <div class="flex flex-wrap gap-2">
              <button type="button" class="min-h-[44px] px-4 rounded-lg font-medium" style="background: {$colorStore.primary}20; color: {$colorStore.primary};" onclick={syncInvites}>Import uses from Discord</button>
              <button type="button" class="min-h-[44px] px-4 rounded-lg font-medium" style="background: {$colorStore.accent}20; color: {$colorStore.accent};" onclick={() => resetAll(InviteResetScope.LeftMembers)}>Reset inviters who left</button>
              <button type="button" class="min-h-[44px] px-4 rounded-lg font-medium" style="background: {$colorStore.accent}; color: #fff;" onclick={() => resetAll(InviteResetScope.Server)}>Reset everything</button>
            </div>
            <p class="text-xs mt-3" style="color: {$colorStore.muted}">Importing raises each inviter's regular total to the sum of uses across their codes and never lowers it, so it is safe to run again.</p>
          </Card>
        {/if}
      </AsyncState>
    </section>
  {/if}
</DashboardPageLayout>
