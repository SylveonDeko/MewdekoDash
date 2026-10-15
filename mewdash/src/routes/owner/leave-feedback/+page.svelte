<!-- routes/owner/leave-feedback/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { goto } from "$app/navigation";
  import { leaveFeedbackApi, ownershipApi } from "$lib/api/index.ts";
  import type {
    LeaveFeedbackEntry,
    LeaveFeedbackSettings,
    LeaveFeedbackStats,
    LeaveFeedbackStatus,
  } from "$lib/api/leavefeedback/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { loadingStore } from "$lib/stores/loadingStore";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";

  let { data } = $props();

  let entries: LeaveFeedbackEntry[] = $state([]);
  let stats = $state<LeaveFeedbackStats | null>(null);
  let total = $state(0);
  let page = $state(1);
  let pageSize = $state(50);
  let loading = $state(true);
  let error: string | null = $state(null);
  let expandedId: number | null = $state(null);

  let reasonFilter: string | null = $state(null);
  let statusFilter: LeaveFeedbackStatus | null = $state(null);
  let search = $state("");

  let deleteTarget = $state<LeaveFeedbackEntry | null>(null);
  let confirmDeleteOpen = $state(false);

  let settings = $state<LeaveFeedbackSettings | null>(null);
  let channelInput = $state("");
  let savingSettings = $state(false);
  let settingsError: string | null = $state(null);

  let activeTab = $state("responses");

  const tabs = $derived([
    { id: "responses", label: m.common.responses(), icon: "fa-comments" },
    { id: "settings", label: m.common.settings(), icon: "fa-cog" },
  ]);

  let channelDirty = $derived(
    settings !== null && channelInput.trim() !== (settings.channelId === 0n ? "" : settings.channelId.toString()),
  );

  let totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)));

  let reasonOptions = $derived(
    (stats?.reasons ?? []).map((r) => ({ id: r.key, name: `${r.label} (${r.count})` })),
  );

  const statusOptions = $derived([
    { id: "answered", name: m.owner.leaveFeedbackStatusAnswered() },
    { id: "commented", name: m.owner.leaveFeedbackStatusCommented() },
    { id: "dismissed", name: m.owner.leaveFeedbackStatusDismissed() },
    { id: "pending", name: m.common.noResponse() },
  ]);

  /**
   * The share of prompts that got any kind of answer, which is the number worth
   * watching when judging whether the prompt itself is working.
   */
  let responseRate = $derived(
    stats && stats.total > 0
      ? Math.round(((stats.answered + stats.dismissed) / stats.total) * 100)
      : 0,
  );

  let statTiles = $derived([
    { label: m.owner.leaveFeedbackStatPromptsSent(), value: stats?.total ?? 0, icon: "fa-paper-plane", tone: "secondary" },
    { label: m.owner.leaveFeedbackStatusAnswered(), value: stats?.answered ?? 0, icon: "fa-comment-check", tone: "primary" },
    { label: m.owner.leaveFeedbackStatWithComment(), value: stats?.withComment ?? 0, icon: "fa-message-pen", tone: "primary" },
    { label: m.owner.leaveFeedbackStatusDismissed(), value: stats?.dismissed ?? 0, icon: "fa-xmark", tone: "accent" },
    { label: m.common.noResponse(), value: stats?.pending ?? 0, icon: "fa-hourglass", tone: "secondary" },
    { label: m.owner.leaveFeedbackStatResponseRate(), value: `${responseRate}%`, icon: "fa-chart-simple", tone: "primary" },
  ]);

  function toneColor(tone: string): string {
    if (tone === "accent") return $colorStore.accent;
    if (tone === "secondary") return $colorStore.secondary;
    return $colorStore.primary;
  }

  /**
   * Renders a UTC timestamp in the viewer's timezone, appending a `Z` when the
   * bot serialized the value without a timezone designator.
   */
  function formatDate(value: string | null): string {
    if (!value) return m.common.unknown();
    const utc = /[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`;
    return new Date(utc).toLocaleString();
  }

  /**
   * How long the bot was in the server before it was removed, which is the most
   * telling signal next to the reason itself.
   */
  function describeTenure(entry: LeaveFeedbackEntry): string | null {
    if (!entry.joinedAt || !entry.dateAdded) return null;

    const joined = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(entry.joinedAt) ? entry.joinedAt : `${entry.joinedAt}Z`);
    const left = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(entry.dateAdded) ? entry.dateAdded : `${entry.dateAdded}Z`);
    const days = Math.floor((left.getTime() - joined.getTime()) / 86400000);

    if (!Number.isFinite(days) || days < 0) return null;
    if (days === 0) return m.owner.leaveFeedbackTenureUnderDay();
    if (days === 1) return m.common.oneDay();
    if (days < 30) return m.common.daysCount({ count: days });

    const months = Math.floor(days / 30);
    return months === 1 ? m.owner.leaveFeedbackTenureMonthOne() : m.owner.leaveFeedbackTenureMonthsOther({ count: months });
  }

  function statusLabel(entry: LeaveFeedbackEntry): { label: string; tone: string } {
    if (entry.dismissed) return { label: m.owner.leaveFeedbackStatusDismissed(), tone: "accent" };
    if (entry.answeredAt) return { label: m.owner.leaveFeedbackStatusAnswered(), tone: "primary" };
    return { label: m.common.noResponse(), tone: "secondary" };
  }

  function onReasonChange(detail: { selected: string | string[] | null }) {
    const value = detail.selected;
    reasonFilter = typeof value === "string" && value !== "" ? value : null;
    applyFilters();
  }

  function onStatusChange(detail: { selected: string | string[] | null }) {
    const value = detail.selected;
    statusFilter = typeof value === "string" && value !== "" ? (value as LeaveFeedbackStatus) : null;
    applyFilters();
  }

  async function fetchFeedback() {
    return await loadingStore.wrap(
      "fetch-leave-feedback",
      async () => {
        try {
          loading = true;
          error = null;
          const [result, statsResult] = await Promise.all([
            leaveFeedbackApi.getFeedback({
              reason: reasonFilter ?? undefined,
              status: statusFilter ?? undefined,
              search: search.trim() || undefined,
              page,
              pageSize,
            }),
            leaveFeedbackApi.getStats(),
          ]);
          entries = result.items ?? [];
          total = result.total ?? 0;
          stats = statsResult;
        } catch (err) {
          logger.error("Failed to fetch leave feedback:", err);
          error = m.owner.leaveFeedbackErrorLoad();
        } finally {
          loading = false;
        }
      },
      "api",
      m.owner.leaveFeedbackLoading(),
    );
  }

  function applyFilters() {
    page = 1;
    expandedId = null;
    fetchFeedback();
  }

  function changePage(next: number) {
    if (next < 1 || next > totalPages) return;
    page = next;
    expandedId = null;
    fetchFeedback();
  }

  function toggleExpand(id: number) {
    expandedId = expandedId === id ? null : id;
  }

  /**
   * Loads the bot wide settings and seeds the channel field from them.
   */
  async function fetchSettings() {
    try {
      settings = await leaveFeedbackApi.getSettings();
      channelInput = settings.channelId === 0n ? "" : settings.channelId.toString();
      settingsError = null;
    } catch (err) {
      logger.error("Failed to load leave feedback settings:", err);
      settingsError = m.common.notifyLoadSettingsFailed();
    }
  }

  /**
   * Saves both settings together. An empty channel field means "fall back to the
   * join/leave channel", which is what a zero means to the bot.
   */
  async function saveSettings(enabled: boolean, channel: string) {
    const trimmed = channel.trim();

    if (trimmed && !/^\d{17,20}$/.test(trimmed)) {
      settingsError = m.common.invalidChannelId();
      return;
    }

    try {
      savingSettings = true;
      settingsError = null;
      settings = await leaveFeedbackApi.setSettings({
        enabled,
        channelId: trimmed ? BigInt(trimmed) : 0n,
      });
      channelInput = settings.channelId === 0n ? "" : settings.channelId.toString();
    } catch (err) {
      logger.error("Failed to save leave feedback settings:", err);
      settingsError = err instanceof Error ? err.message : m.common.failedToSaveTheSettings();
      await fetchSettings();
    } finally {
      savingSettings = false;
    }
  }

  function saveChannel() {
    if (!settings) return;
    saveSettings(settings.enabled, channelInput);
  }

  function requestDelete(entry: LeaveFeedbackEntry) {
    deleteTarget = entry;
    confirmDeleteOpen = true;
  }

  async function confirmDelete() {
    const target = deleteTarget;
    deleteTarget = null;
    if (!target) return;

    try {
      await leaveFeedbackApi.deleteFeedback(target.id);
      await fetchFeedback();
    } catch (err) {
      logger.error("Failed to delete leave feedback:", err);
      error = m.owner.leaveFeedbackErrorDelete();
    }
  }

  onMount(async () => {
    const allowed = await loadingStore.wrap(
      "owner-check",
      async () => {
        try {
          return await ownershipApi.isOwner(BigInt(data.user.id));
        } catch (err) {
          logger.error("Owner check failed:", err);
          return false;
        }
      },
      "critical",
      m.common.checkingPermissions(),
    );

    if (!allowed) {
      goto("/dashboard");
      return;
    }

    await Promise.all([fetchFeedback(), fetchSettings()]);
  });
</script>

<DashboardPageLayout
  category="Analytics"
  guildName={m.common.botOwnerTools()}
  icon="fa-comments"
  subtitle={m.features.leaveFeedbackDescription()}
  title={m.features.leaveFeedbackName()}
  basePath="/owner/leave-feedback"
  {tabs}
  bind:activeTab
>
  {#if activeTab === 'settings'}
  <!-- Bot wide settings -->
  {#if settings}
    <div
      class="rounded-2xl border p-4 sm:p-5 mb-6"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
      in:fly={{ y: 20, duration: 300 }}
    >
      <div class="flex items-baseline justify-between gap-3 mb-3">
        <h2 class="text-sm font-semibold" style="color: {$colorStore.text}">{m.common.settings()}</h2>
        <span class="text-xs" style="color: {$colorStore.muted}">{m.common.appliesToWholeBotHint()}</span>
      </div>

      <ToggleRow
        checked={settings.enabled}
        colors={$colorStore}
        disabled={savingSettings}
        id="leave-feedback-enabled"
        subtitle={m.owner.leaveFeedbackSentRightAfterTheBotIs()}
        title={m.owner.leaveFeedbackAskOwnersWhyTheBotWas()}
        onchange={(checked) => saveSettings(checked, channelInput)}
      />

      <div class="mt-4">
        <label class="block text-sm font-medium mb-1" for="feedback-channel" style="color: {$colorStore.muted}">
          {m.owner.settingsReportChannelId()}
        </label>
        <div class="flex flex-col sm:flex-row gap-2">
          <input
            id="feedback-channel"
            type="text"
            inputmode="numeric"
            bind:value={channelInput}
            disabled={savingSettings}
            placeholder={m.common.leaveEmptyJoinLeaveHint()}
            class="flex-1 rounded-xl px-3 min-h-[44px] outline-none font-mono"
            style="background: {$colorStore.primary}10; color: {$colorStore.text};
                   border: 1px solid {$colorStore.primary}30;"
          />
          <button
            onclick={saveChannel}
            disabled={savingSettings || !channelDirty}
            class="rounded-xl px-4 min-h-[44px] font-medium disabled:opacity-40"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary};
                   border: 1px solid {$colorStore.primary}30;"
          >
            {savingSettings ? m.common.saving() : m.common.saveChannel()}
          </button>
        </div>

        {#if settingsError}
          <p class="mt-2 text-xs" style="color: {$colorStore.accent}">{settingsError}</p>
        {:else if settings.effectiveChannelId === 0n}
          <p class="mt-2 text-xs" style="color: {$colorStore.accent}">
            {m.owner.leaveFeedbackNoChannelIsSetAndThere()}
          </p>
        {:else if !settings.reachable}
          <p class="mt-2 text-xs" style="color: {$colorStore.accent}">
            {m.owner.leaveFeedbackChannelUnreachable({ channel: settings.effectiveChannelId.toString() })}
          </p>
        {:else}
          <p class="mt-2 text-xs" style="color: {$colorStore.muted}">
            {#if settings.guildName}
              {m.owner.leaveFeedbackAnswersGoToGuild({ channel: settings.channelName ?? "", guild: settings.guildName })}
            {:else}
              {m.owner.leaveFeedbackAnswersGoTo({ channel: settings.channelName ?? "" })}
            {/if}
            {#if settings.usingFallback}{m.common.joinLeaveChannelFallbackHint()}{/if}
          </p>
        {/if}
      </div>
    </div>
  {/if}
  {:else}

  <!-- Stats -->
  <div class="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6" in:fly={{ y: 20, duration: 300 }}>
    {#each statTiles as tile (tile.label)}
      <div
        class="rounded-2xl border p-4"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
      >
        <div class="flex items-center gap-2 text-xs font-medium" style="color: {$colorStore.muted}">
          <i class="fa-regular {tile.icon}" style="color: {toneColor(tile.tone)}"></i>
          {tile.label}
        </div>
        <div class="mt-2 text-2xl font-semibold" style="color: {$colorStore.text}">{tile.value}</div>
      </div>
    {/each}
  </div>

  <!-- Reason breakdown -->
  {#if stats && stats.reasons.some((r) => r.count > 0)}
    <div
      class="rounded-2xl border p-4 sm:p-5 mb-6"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
      in:fly={{ y: 20, duration: 300 }}
    >
      <h2 class="text-sm font-semibold mb-3" style="color: {$colorStore.text}">{m.owner.leaveFeedbackReasonsGiven()}</h2>
      <div class="space-y-2">
        {#each stats.reasons.filter((r) => r.count > 0).sort((a, b) => b.count - a.count) as reason (reason.key)}
          <button
            class="w-full text-left"
            onclick={() => {
              reasonFilter = reasonFilter === reason.key ? null : reason.key;
              applyFilters();
            }}
          >
            <div class="flex items-baseline justify-between gap-3 text-sm">
              <span style="color: {reasonFilter === reason.key ? $colorStore.primary : $colorStore.text}">
                {reason.label}
              </span>
              <span style="color: {$colorStore.muted}">{reason.count}</span>
            </div>
            <div class="mt-1 h-2 rounded-full overflow-hidden" style="background: {$colorStore.primary}15;">
              <div
                class="h-full rounded-full"
                style="width: {stats.answered > 0 ? (reason.count / stats.answered) * 100 : 0}%;
                       background: {$colorStore.primary};"
              ></div>
            </div>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Filters -->
  <div
    class="rounded-2xl border p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-end gap-4"
    style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
           border-color: {$colorStore.primary}30;"
    in:fly={{ y: 20, duration: 300 }}
  >
    <div class="flex-1 min-w-0">
      <span class="block text-sm font-medium mb-1" id="reason-filter-label" style="color: {$colorStore.muted}">
        {m.common.reason()}
      </span>
      <DiscordSelector
        type="custom"
        customIcon="fa-filter"
        options={reasonOptions}
        selected={reasonFilter}
        placeholder={m.owner.leaveFeedbackAllReasons()}
        searchable={false}
        ariaLabelledby="reason-filter-label"
        onchange={onReasonChange}
      />
    </div>

    <div class="flex-1 min-w-0">
      <span class="block text-sm font-medium mb-1" id="status-filter-label" style="color: {$colorStore.muted}">
        {m.common.status()}
      </span>
      <DiscordSelector
        type="custom"
        customIcon="fa-list-check"
        options={statusOptions}
        selected={statusFilter}
        placeholder={m.owner.leaveFeedbackAllStatuses()}
        searchable={false}
        ariaLabelledby="status-filter-label"
        onchange={onStatusChange}
      />
    </div>

    <div class="flex-1 min-w-0">
      <label class="block text-sm font-medium mb-1" for="feedback-search" style="color: {$colorStore.muted}">
        {m.common.search()}
      </label>
      <input
        id="feedback-search"
        type="search"
        bind:value={search}
        onchange={applyFilters}
        placeholder={m.owner.leaveFeedbackServerNameOrComment()}
        class="w-full rounded-xl px-3 min-h-[44px] outline-none"
        style="background: {$colorStore.primary}10; color: {$colorStore.text};
               border: 1px solid {$colorStore.primary}30;"
      />
    </div>

    <button
      onclick={fetchFeedback}
      class="rounded-xl px-4 min-h-[44px] font-medium transition-all hover:translate-y-[-1px]"
      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
    >
      <i class="fa-utility-duo fa-regular fa-arrows-rotate mr-2"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
      {m.common.refresh()}
    </button>
  </div>

  {#if loading}
    <div class="space-y-2" aria-busy="true" aria-label={m.owner.leaveFeedbackLoadingLeaveFeedback()}>
      {#each Array(6) as _, i (i)}
        <SkeletonLoader type="feature" delay={i * 60} />
      {/each}
    </div>
  {:else if error}
    <div class="text-center py-12" style="color: {$colorStore.accent}">{error}</div>
  {:else if entries.length === 0}
    <div class="text-center py-12" style="color: {$colorStore.muted}">
      {m.owner.leaveFeedbackNoFeedbackMatchesTheCurrentFilters()}
    </div>
  {:else}
    <!-- Desktop table -->
    <div
      class="hidden md:block rounded-2xl border overflow-x-auto"
      style="border-color: {$colorStore.primary}30;"
      in:fade={{ duration: 200 }}
    >
      <table class="w-full min-w-[640px] text-sm">
        <thead>
          <tr style="background: {$colorStore.primary}15;">
            <th class="text-left font-semibold px-4 py-3" style="color: {$colorStore.text}">{m.common.departed()}</th>
            <th class="text-left font-semibold px-4 py-3" style="color: {$colorStore.text}">{m.features.categoryServer()}</th>
            <th class="text-left font-semibold px-4 py-3" style="color: {$colorStore.text}">{m.common.reason()}</th>
            <th class="text-left font-semibold px-4 py-3" style="color: {$colorStore.text}">{m.common.status()}</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {#each entries as entry (entry.id)}
            <tr style="border-top: 1px solid {$colorStore.primary}20;">
              <td class="px-4 py-3 whitespace-nowrap" style="color: {$colorStore.muted}">
                {formatDate(entry.dateAdded)}
                {#if describeTenure(entry)}
                  <div class="text-xs mt-0.5">{m.owner.leaveFeedbackStayed({ tenure: describeTenure(entry) ?? "" })}</div>
                {/if}
              </td>
              <td class="px-4 py-3" style="color: {$colorStore.text}">
                <div class="font-medium">{entry.guildName || m.common.unknownServer()}</div>
                <div class="text-xs mt-0.5 font-mono" style="color: {$colorStore.muted}">
                  {m.owner.leaveFeedbackIdMembers({ id: entry.guildId.toString(), count: entry.memberCount })}
                </div>
              </td>
              <td class="px-4 py-3" style="color: {$colorStore.text}">
                {entry.reasonLabel ?? m.owner.leaveFeedbackReasonNotSelected()}
                {#if entry.comment}
                  <div class="text-xs mt-0.5" style="color: {$colorStore.muted}">{m.owner.leaveFeedbackHasAComment()}</div>
                {/if}
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium"
                  style="background: {toneColor(statusLabel(entry).tone)}20;
                         color: {toneColor(statusLabel(entry).tone)};"
                >
                  {statusLabel(entry).label}
                </span>
              </td>
              <td class="px-4 py-3 text-right whitespace-nowrap">
                {#if entry.comment}
                  <button
                    onclick={() => toggleExpand(entry.id)}
                    class="rounded-lg px-2 py-1 min-h-[36px] text-xs mr-2"
                    style="background: {$colorStore.primary}15; color: {$colorStore.text};"
                  >
                    {expandedId === entry.id ? m.common.hide() : m.owner.leaveFeedbackComment()}
                  </button>
                {/if}
                <button
                  onclick={() => requestDelete(entry)}
                  aria-label={m.owner.leaveFeedbackDeleteThisRecord()}
                  class="rounded-lg px-2 py-1 min-h-[36px] text-xs"
                  style="background: {$colorStore.accent}15; color: {$colorStore.accent};"
                >
                  <i class="fa-regular fa-trash"></i>
                </button>
              </td>
            </tr>
            {#if expandedId === entry.id && entry.comment}
              <tr style="border-top: 1px solid {$colorStore.primary}20;">
                <td colspan="5" class="px-4 py-3" style="background: {$colorStore.primary}08;">
                  <p class="text-sm whitespace-pre-wrap" style="color: {$colorStore.text}">{entry.comment}</p>
                  <p class="text-xs mt-2" style="color: {$colorStore.muted}">
                    {m.owner.leaveFeedbackOwnerAnswered({ owner: entry.ownerId.toString(), date: formatDate(entry.answeredAt) })}
                  </p>
                </td>
              </tr>
            {/if}
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Mobile cards -->
    <div class="md:hidden space-y-3" in:fade={{ duration: 200 }}>
      {#each entries as entry (entry.id)}
        <div
          class="rounded-2xl border p-4"
          style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                 border-color: {$colorStore.primary}30;"
        >
          <div class="flex items-center justify-between gap-2">
            <span
              class="inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium"
              style="background: {toneColor(statusLabel(entry).tone)}20;
                     color: {toneColor(statusLabel(entry).tone)};"
            >
              {statusLabel(entry).label}
            </span>
            <span class="text-xs" style="color: {$colorStore.muted}">{formatDate(entry.dateAdded)}</span>
          </div>

          <div class="mt-3 text-sm font-medium" style="color: {$colorStore.text}">
            {entry.guildName || m.common.unknownServer()}
          </div>
          <div class="mt-0.5 text-xs font-mono" style="color: {$colorStore.muted}">
            {describeTenure(entry)
              ? m.owner.leaveFeedbackIdMembersStayed({ id: entry.guildId.toString(), count: entry.memberCount, tenure: describeTenure(entry) ?? "" })
              : m.owner.leaveFeedbackIdMembers({ id: entry.guildId.toString(), count: entry.memberCount })}
          </div>
          <div class="mt-2 text-sm" style="color: {$colorStore.text}">
            {entry.reasonLabel ?? m.owner.leaveFeedbackReasonNoneSelected()}
          </div>

          {#if entry.comment}
            <button
              onclick={() => toggleExpand(entry.id)}
              class="mt-3 w-full rounded-xl px-3 min-h-[44px] text-sm font-medium"
              style="background: {$colorStore.primary}15; color: {$colorStore.text};"
            >
              {expandedId === entry.id ? m.owner.leaveFeedbackHideComment() : m.owner.leaveFeedbackShowComment()}
            </button>
            {#if expandedId === entry.id}
              <p class="mt-2 rounded-xl p-3 text-sm whitespace-pre-wrap"
                 style="background: {$colorStore.primary}10; color: {$colorStore.text};">
                {entry.comment}
              </p>
            {/if}
          {/if}

          <button
            onclick={() => requestDelete(entry)}
            class="mt-2 w-full rounded-xl px-3 min-h-[44px] text-sm font-medium"
            style="background: {$colorStore.accent}15; color: {$colorStore.accent};"
          >
            {m.owner.leaveFeedbackDeleteRecord()}
          </button>
        </div>
      {/each}
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between gap-4 mt-6">
      <span class="text-sm" style="color: {$colorStore.muted}">
        {m.owner.leaveFeedbackPagination({ total, page, pages: totalPages })}
      </span>
      <div class="flex gap-2">
        <button
          onclick={() => changePage(page - 1)}
          disabled={page <= 1}
          class="rounded-xl px-4 min-h-[44px] font-medium disabled:opacity-40"
          style="background: {$colorStore.primary}20; color: {$colorStore.text};"
        >
          {m.common.previous()}
        </button>
        <button
          onclick={() => changePage(page + 1)}
          disabled={page >= totalPages}
          class="rounded-xl px-4 min-h-[44px] font-medium disabled:opacity-40"
          style="background: {$colorStore.primary}20; color: {$colorStore.text};"
        >
          {m.common.next()}
        </button>
      </div>
    </div>
  {/if}
  {/if}
</DashboardPageLayout>

<ConfirmationModal
  bind:isOpen={confirmDeleteOpen}
  title={m.owner.leaveFeedbackDeleteFeedback()}
  message={m.owner.leaveFeedbackDeleteMessage({ server: deleteTarget?.guildName || m.common.thisServer() })}
  confirmText={m.common.delete()}
  variant="danger"
  onconfirm={confirmDelete}
  oncancel={() => (deleteTarget = null)}
/>
