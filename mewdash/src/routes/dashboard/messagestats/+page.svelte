<!-- routes/dashboard/messagestats/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { fade } from "svelte/transition";
  import type { PageData } from "./$types";
  import { messageCountApi, clientApi, guildApi, type MessageStatsResponse } from "$lib/api/index.ts";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { currentInstance } from "$lib/stores/instanceStore";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { createAutoSave } from "$lib/utils/autoSave.svelte";
  import { requestConfirmation } from "$lib/stores/confirmationStore";
  import Notification from "$lib/components/ui/Notification.svelte";
  import PluginPage from "$lib/components/plugin/PluginPage.svelte";
  import PluginCard from "$lib/components/plugin/PluginCard.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import StatTile from "$lib/components/analytics/StatTile.svelte";
  import Card from "$lib/components/analytics/Card.svelte";
  import SimpleLineChart from "$lib/components/analytics/SimpleLineChart.svelte";
  import RankList, { type RankRow } from "$lib/components/stats/RankList.svelte";
  import AsyncState from "$lib/components/stats/AsyncState.svelte";
  import { formatNumber, formatDateTime, saveBlob } from "$lib/components/stats/format";

  interface Props {
    data: PageData;
  }

  let { data }: Props = $props();

  const TAB_IDS = ["overview", "users", "channels", "settings", "export"] as const;
  type TabId = (typeof TAB_IDS)[number];

  let stats = $state<MessageStatsResponse | null>(null);
  let memberNames = $state<Map<string, { name: string; avatar: string | null }>>(new Map());
  let loading = $state(true);
  let error = $state<string | null>(null);
  let enabled = $state(false);
  let minLength = $state(0);
  let savedMinLength = 0;
  let resetting = $state(false);
  let exporting = $state(false);
  let exportFormat: "csv" | "json" = $state("csv");
  let includeUsers = $state(true);
  let includeChannels = $state(true);
  let includeHourly = $state(false);
  let showNotification = $state(false);
  let notificationMessage = $state("");
  let notificationType: "success" | "error" = $state("success");
  let loadedKey = "";
  let requestId = 0;

  const autoSave = createAutoSave({
    onError: () => notify(m.common.failedToSaveTheSettings(), "error")
  });

  const tabs = $derived([
    { id: "overview", label: m.common.overview(), icon: "fa-chart-simple" },
    { id: "users", label: m.messagestats.subtabUsers(), icon: "fa-users" },
    { id: "channels", label: m.common.topChannels(), icon: "fa-hashtag" },
    { id: "settings", label: m.common.settings(), icon: "fa-gear" },
    { id: "export", label: m.messagestats.exportButton(), icon: "fa-download" }
  ]);

  const tab: TabId = $derived.by(() => {
    const requested = page.url.searchParams.get("tab");
    return TAB_IDS.find(id => id === requested) ?? "overview";
  });

  const hours = $derived(stats?.busiestHours ?? []);
  const days = $derived(stats?.busiestDays ?? []);

  const userRows: RankRow[] = $derived(
    (stats?.topUsers ?? []).map((user, index) => {
      const member = memberNames.get(user.userId);
      return {
        rank: index + 1,
        id: user.userId,
        name: member?.name ?? m.common.unknownUser(),
        avatarUrl: member?.avatar,
        value: formatNumber(user.totalMessages),
        detail: m.messagestats.rowShare({ percent: user.percentage ?? 0, daily: formatNumber(user.dailyMessages) })
      };
    })
  );

  const channelRows: RankRow[] = $derived(
    (stats?.topChannels ?? []).map((channel, index) => ({
      rank: index + 1,
      id: channel.channelId,
      name: `#${channel.channelName}`,
      value: formatNumber(channel.totalMessages),
      detail: m.messagestats.rowShare({ percent: channel.percentage ?? 0, daily: formatNumber(channel.dailyMessages) })
    }))
  );

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

  async function load() {
    if (!$currentGuild) return;
    const id = ++requestId;
    loading = true;
    error = null;
    try {
      const guildId = BigInt($currentGuild.id);
      const [statsData, members, config] = await Promise.all([
        messageCountApi.getMessageStats(guildId),
        clientApi.getMembers(guildId).catch(() => []),
        guildApi.getGuildConfig(guildId)
      ]);
      if (id !== requestId) return;
      stats = statsData;
      enabled = statsData?.enabled ?? false;
      minLength = config?.minMessageLength ?? 0;
      savedMinLength = minLength;
      const lookup = new Map<string, { name: string; avatar: string | null }>();
      for (const member of members ?? []) {
        if (member?.id !== undefined) lookup.set(member.id.toString(), { name: member.username, avatar: member.avatarUrl ?? null });
      }
      memberNames = lookup;
    } catch (err) {
      if (id !== requestId) return;
      logger.error("Failed to load message stats:", err);
      error = m.messagestats.errorLoad();
    } finally {
      if (id === requestId) loading = false;
    }
  }

  async function refreshStats() {
    if (!$currentGuild) return;
    try {
      stats = await messageCountApi.getMessageStats(BigInt($currentGuild.id));
    } catch (err) {
      logger.error("Failed to refresh message stats:", err);
    }
  }

  function toggleEnabled(next: boolean) {
    if (!$currentGuild) return;
    const guildId = BigInt($currentGuild.id);
    const previous = enabled;
    enabled = next;
    void autoSave.now("enabled", async () => {
      try {
        const result = await messageCountApi.toggleMessageCount(guildId);
        enabled = result.enabled;
        await refreshStats();
      } catch (err) {
        enabled = previous;
        throw err;
      }
    });
  }

  function setMinLength(value: number) {
    if (!$currentGuild) return;
    const guildId = BigInt($currentGuild.id);
    const next = Math.min(4098, Math.max(0, Math.floor(Number.isFinite(value) ? value : 0)));
    minLength = next;
    autoSave.schedule("minLength", async () => {
      try {
        const config = await guildApi.getGuildConfig(guildId);
        config.minMessageLength = next;
        await guildApi.updateGuildConfig(guildId, config);
        savedMinLength = next;
      } catch (err) {
        minLength = savedMinLength;
        throw err;
      }
    });
  }

  async function reset(userId?: string, channelId?: string, name?: string) {
    if (!$currentGuild || resetting) return;
    const confirmed = await requestConfirmation({
      message: name ? m.messagestats.confirmResetOne({ name }) : m.messagestats.confirmReset(),
      confirmText: m.common.reset()
    });
    if (!confirmed) return;
    resetting = true;
    try {
      await messageCountApi.resetMessageCounts(
        BigInt($currentGuild.id),
        userId ? BigInt(userId) : null,
        channelId ? BigInt(channelId) : null
      );
      notify(m.messagestats.notifyReset());
      await refreshStats();
    } catch (err) {
      logger.error("Failed to reset message counts:", err);
      notify(m.messagestats.errorReset(), "error");
    } finally {
      resetting = false;
    }
  }

  function csvEscape(value: unknown): string {
    if (value === null || value === undefined) return "";
    const text = String(value);
    return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }

  function toCsv(rows: Record<string, unknown>[]): string {
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    return [headers.map(csvEscape).join(","), ...rows.map(row => headers.map(h => csvEscape(row[h])).join(","))].join("\n");
  }

  function exportStats() {
    if (!stats || !$currentGuild || exporting) return;
    exporting = true;
    try {
      const payload = {
        guildId: $currentGuild.id.toString(),
        guildName: $currentGuild.name,
        exportedAt: new Date().toISOString(),
        summary: {
          enabled: stats.enabled,
          totalMessages: stats.totalMessages,
          dailyMessages: stats.dailyMessages,
          lastUpdated: stats.lastUpdated
        },
        users: includeUsers
          ? stats.topUsers.map((user, index) => ({
              rank: index + 1,
              userId: user.userId,
              username: memberNames.get(user.userId)?.name ?? "",
              totalMessages: user.totalMessages,
              dailyMessages: user.dailyMessages,
              percentage: user.percentage ?? 0
            }))
          : [],
        channels: includeChannels ? stats.topChannels : [],
        hourlyStats: includeHourly ? hours : [],
        busiestDays: includeHourly ? days : []
      };
      const date = payload.exportedAt.split("T")[0];
      const slug = (payload.guildName || "guild").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
      if (exportFormat === "json") {
        saveBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" }), `${slug}-message-stats-${date}.json`);
      } else {
        const text = [
          toCsv([{ guildId: payload.guildId, guildName: payload.guildName, ...payload.summary, exportedAt: payload.exportedAt }]),
          payload.users.length ? `\nUsers\n${toCsv(payload.users)}` : "",
          payload.channels.length ? `\nChannels\n${toCsv(payload.channels)}` : "",
          payload.hourlyStats.length ? `\nHours\n${toCsv(payload.hourlyStats)}` : "",
          payload.busiestDays.length ? `\nDays\n${toCsv(payload.busiestDays)}` : ""
        ].filter(Boolean).join("\n");
        saveBlob(new Blob([text], { type: "text/csv;charset=utf-8" }), `${slug}-message-stats-${date}.csv`);
      }
      notify(m.messagestats.notifyExported());
    } catch (err) {
      logger.error("Failed to export message stats:", err);
      notify(m.messagestats.errorExport(), "error");
    } finally {
      exporting = false;
    }
  }

  $effect(() => {
    if (!$currentGuild) {
      void goto("/dashboard");
      return;
    }
    if ($currentGuild.icon) {
      const url = `https://cdn.discordapp.com/icons/${$currentGuild.id}/${$currentGuild.icon}.${$currentGuild.icon.startsWith("a_") ? "gif" : "png"}`;
      colorStore.extractFromServerIcon(url);
    } else if ($currentInstance?.botAvatar) {
      colorStore.extractFromImage($currentInstance.botAvatar);
    }
    const key = `${$currentInstance?.port ?? "default"}:${$currentGuild.id}`;
    if (key === loadedKey) return;
    loadedKey = key;
    void load();
  });
</script>

{#snippet statusMessages()}
  {#if showNotification}
    <div class="fixed top-4 right-4 z-[10001]" transition:fade>
      <Notification message={notificationMessage} type={notificationType} />
    </div>
  {/if}
{/snippet}

{#snippet resetButton(row: RankRow, kind: "user" | "channel")}
  <button
    type="button"
    class="shrink-0 w-11 h-11 rounded-lg flex items-center justify-center border"
    style="background: #ef444414; border-color: #ef444440; color: #ef4444;"
    aria-label={m.messagestats.resetRowAria({ name: row.name })}
    title={m.common.reset()}
    disabled={resetting}
    onclick={() => reset(kind === "user" ? row.id : undefined, kind === "channel" ? row.id : undefined, row.name)}
  >
    <i class="fa-solid fa-rotate-left" aria-hidden="true"></i>
  </button>
{/snippet}

{#snippet userTrailing(row: RankRow)}
  {@render resetButton(row, "user")}
{/snippet}

{#snippet channelTrailing(row: RankRow)}
  {@render resetButton(row, "channel")}
{/snippet}

<PluginPage
  {statusMessages}
  {autoSave}
  {enabled}
  onToggle={toggleEnabled}
  icon="fa-chart-simple"
  guildName={$currentGuild?.name || m.common.dashboard()}
  title={m.messagestats.pageTitle()}
  subtitle={m.messagestats.pageSubtitle()}
  actionButtons={[{ label: m.common.refresh(), icon: "fa-arrows-rotate", action: () => void load(), loading }]}
>
  <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 [&>:last-child:nth-child(odd)]:col-span-2 sm:[&>:last-child:nth-child(odd)]:col-span-1" role="group" aria-label={m.messagestats.tabsAria()}>
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

  <AsyncState {loading} {error}>
    {#if tab === "overview"}
      {#if stats}
        {#if !stats.enabled}
          <p class="text-sm" style="color: {$colorStore.muted}">{m.messagestats.disabledNotice()}</p>
        {/if}
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatTile label={m.messagestats.statDaily()} value={formatNumber(stats.dailyMessages)} />
          <StatTile label={m.messagestats.statTotal()} value={formatNumber(stats.totalMessages)} />
          <StatTile label={m.messagestats.statLastUpdated()} value={formatDateTime(stats.lastUpdated)} />
          {#if stats.leastActiveUser}
            <StatTile
              label={m.messagestats.statLeastActiveUser()}
              value={memberNames.get(stats.leastActiveUser.userId)?.name ?? m.common.unknownUser()}
              sub={m.common.messagesCount({ count: formatNumber(stats.leastActiveUser.totalMessages) })}
            />
          {/if}
          {#if stats.leastActiveChannel}
            <StatTile
              label={m.messagestats.statLeastActiveChannel()}
              value={`#${stats.leastActiveChannel.channelName}`}
              sub={m.common.messagesCount({ count: formatNumber(stats.leastActiveChannel.totalMessages) })}
            />
          {/if}
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Card title={m.messagestats.chartHourlyTitle()}>
            <SimpleLineChart
              type="bar"
              labels={hours.map(h => `${h.hour}:00`)}
              series={[{ name: m.common.messages(), data: hours.map(h => h.messageCount) }]}
              beginAtZero
            />
          </Card>
          <Card title={m.messagestats.chartWeeklyTitle()}>
            <SimpleLineChart
              type="bar"
              labels={days.map(d => d.day)}
              series={[{ name: m.common.messages(), data: days.map(d => d.messageCount) }]}
              beginAtZero
            />
          </Card>
        </div>
      {/if}
    {:else if tab === "users"}
      <Card title={m.messagestats.usersHeading()}>
        <AsyncState empty={userRows.length === 0}>
          <RankList rows={userRows} trailing={userTrailing} />
        </AsyncState>
      </Card>
    {:else if tab === "channels"}
      <Card title={m.messagestats.channelsHeading()}>
        <AsyncState empty={channelRows.length === 0}>
          <RankList rows={channelRows} trailing={channelTrailing} />
        </AsyncState>
      </Card>
    {:else if tab === "settings"}
      <PluginCard title={m.messagestats.settingsHeading()} alwaysOpen>
        <div>
          <label for="min-length" class="block text-sm mb-2" style="color: {$colorStore.text}">{m.messagestats.minLengthLabel()}</label>
          <input
            id="min-length"
            type="number"
            inputmode="numeric"
            min="0"
            max="4098"
            value={minLength}
            class="w-full min-h-[50px] px-3 rounded-lg border"
            style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"
            oninput={(e) => setMinLength(e.currentTarget.valueAsNumber)}
            onblur={() => autoSave.flush("minLength")}
          />
        </div>
      </PluginCard>
      <PluginCard title={m.messagestats.resetHeading()} alwaysOpen>
        <button
          type="button"
          class="w-full sm:w-auto min-h-[50px] px-5 rounded-lg border font-medium flex items-center justify-center gap-2"
          style="background: #ef444414; border-color: #ef444440; color: #ef4444;"
          disabled={resetting}
          onclick={() => reset()}
        >
          <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
          {m.messagestats.resetAll()}
        </button>
      </PluginCard>
    {:else}
      <PluginCard title={m.messagestats.exportHeading()} alwaysOpen>
        <div>
          <span class="block text-sm mb-2" style="color: {$colorStore.text}">{m.messagestats.exportFormat()}</span>
          <DiscordSelector
            type="custom"
            selected={exportFormat}
            onchange={(detail: { selected?: unknown }) => {
              if (detail.selected === "csv" || detail.selected === "json") exportFormat = detail.selected;
            }}
            options={[
              { id: "csv", name: "CSV" },
              { id: "json", name: "JSON" }
            ]}
            clearable={false}
            customIcon="fa-arrow-up-from-bracket"
            ariaLabel={m.messagestats.exportFormat()}
            placeholder={m.messagestats.exportFormatPlaceholder()}
          />
        </div>
        <div class="space-y-2">
          <ToggleRow checked={includeUsers} title={m.messagestats.exportIncludeUsers()} colors={$colorStore} onchange={(v) => (includeUsers = v)} />
          <ToggleRow checked={includeChannels} title={m.messagestats.exportIncludeChannels()} colors={$colorStore} onchange={(v) => (includeChannels = v)} />
          <ToggleRow checked={includeHourly} title={m.messagestats.exportIncludeHourly()} colors={$colorStore} onchange={(v) => (includeHourly = v)} />
        </div>
        <button
          type="button"
          class="w-full sm:w-auto min-h-[50px] px-5 rounded-lg font-medium flex items-center justify-center gap-2"
          style="background: {$colorStore.primary}; color: {$colorStore.onPrimary};"
          disabled={exporting || !stats}
          onclick={exportStats}
        >
          <i class="fa-solid fa-download" aria-hidden="true"></i>
          {m.messagestats.exportButton()}
        </button>
      </PluginCard>
    {/if}
  </AsyncState>
</PluginPage>
