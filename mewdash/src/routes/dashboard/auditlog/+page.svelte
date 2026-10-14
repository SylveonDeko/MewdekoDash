<!-- routes/dashboard/auditlog/+page.svelte -->
<script lang="ts">
  import { m } from "$lib/i18n";
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { auditLogApi } from "$lib/api/index.ts";
  import { AuditAction, type AuditChangeSet, type AuditLogEntry } from "$lib/api/auditlog/models";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { loadingStore } from "$lib/stores/loadingStore";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";

  let { data } = $props();

  let entries: AuditLogEntry[] = $state([]);
  let total = $state(0);
  let page = $state(1);
  let pageSize = $state(50);
  let loading = $state(true);
  let error: string | null = $state(null);
  let expandedId: number | null = $state(null);

  // Filters
  let actionFilter: AuditAction | null = $state(null);
  let sectionFilter: string | null = $state(null);

  let totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)));
  let sections = $derived(
    [...new Set(entries.map((e) => e.section))].sort(),
  );

  const actionOptions = $derived([
    { id: String(AuditAction.View), name: m.auditlog.pageActionViewed() },
    { id: String(AuditAction.Create), name: m.common.created() },
    { id: String(AuditAction.Update), name: m.auditlog.pageActionUpdated() },
    { id: String(AuditAction.Delete), name: m.auditlog.pageActionDeleted() },
    { id: String(AuditAction.Access), name: m.auditlog.pageActionAccessed() },
  ]);
  /**
   * Friendly display names for each bot controller, so the audit log reads in
   * dashboard terms instead of internal controller names.
   */
  const sectionLabels = $derived<Record<string, string>>({
    Administration: m.features.administrationName(),
    Afk: m.features.afkName(),
    AuditLog: m.features.auditlogName(),
    Birthday: m.features.birthdayName(),
    BotConfig: m.auditlog.sectionBotConfig(),
    BotStatus: m.common.botStatus(),
    Chat: m.features.chatsaverName(),
    ChatTriggers: m.features.chatTriggersName(),
    ClientOperations: m.auditlog.sectionClientOperations(),
    Confessions: m.features.confessionsName(),
    Counting: m.features.countingName(),
    CustomVoice: m.features.customvoiceName(),
    Feeds: m.features.feedsName(),
    Filter: m.common.wordFilter(),
    Forms: m.features.formsName(),
    Giveaways: m.features.giveawaysName(),
    Guild: m.features.categoryServer(),
    GuildConfig: m.common.serverSettings(),
    Highlights: m.features.highlightsName(),
    InstanceManagement: m.auditlog.sectionInstanceManagement(),
    InviteTracking: m.features.invitesName(),
    JoinLeave: m.auditlog.sectionJoinLeave(),
    LastFm: m.auditlog.sectionLastFm(),
    Logging: m.features.loggingName(),
    Me: m.auditlog.sectionMe(),
    MessageCount: m.features.messagestatsName(),
    Minecraft: m.features.minecraftName(),
    MinecraftBridge: m.auditlog.sectionMinecraftBridge(),
    Moderation: m.features.categoryModeration(),
    MultiGreets: m.features.multigreetsName(),
    Music: m.features.musicName(),
    Ownership: m.auditlog.sectionOwnership(),
    Patreon: m.features.patreonName(),
    Performance: m.features.performanceName(),
    Permissions: m.common.permissions(),
    Poll: m.features.pollsName(),
    Protection: m.common.protection(),
    Repeaters: m.features.repeatersName(),
    Reputation: m.features.reputationName(),
    Reviews: m.common.reviews(),
    RoleGreet: m.features.rolegreetsName(),
    RoleStates: m.features.rolestatesName(),
    Starboard: m.features.starboardName(),
    StatChannel: m.features.statchannelsName(),
    StatusRoles: m.features.statusrolesName(),
    StreamNotifications: m.common.streams(),
    Suggestions: m.features.suggestionsName(),
    SystemInfo: m.auditlog.sectionSystemInfo(),
    Ticket: m.features.ticketsName(),
    Todo: m.features.todoName(),
    Votes: m.features.votesName(),
    Webhook: m.auditlog.sectionWebhook(),
    Wizard: m.common.setupWizard(),
    Xp: m.features.xpName(),
  });

  function sectionLabel(section: string): string {
    return sectionLabels[section] ?? humanizeKey(section);
  }

  let sectionOptions = $derived(sections.map((s) => ({ id: s, name: sectionLabel(s) })));

  function onActionChange(detail: { selected: string | string[] | null }) {
    const value = detail.selected;
    actionFilter = typeof value === "string" && value !== "" ? (Number(value) as AuditAction) : null;
    applyFilters();
  }

  function onSectionChange(detail: { selected: string | string[] | null }) {
    const value = detail.selected;
    sectionFilter = typeof value === "string" && value !== "" ? value : null;
    applyFilters();
  }

  const actionMeta: Record<AuditAction, { label: string; icon: string; tone: "primary" | "secondary" | "accent" }> = $derived({
    [AuditAction.View]: { label: m.auditlog.pageActionViewed(), icon: "fa-eye", tone: "secondary" },
    [AuditAction.Create]: { label: m.common.created(), icon: "fa-plus", tone: "primary" },
    [AuditAction.Update]: { label: m.auditlog.pageActionUpdated(), icon: "fa-pen", tone: "primary" },
    [AuditAction.Delete]: { label: m.auditlog.pageActionDeleted(), icon: "fa-trash", tone: "accent" },
    [AuditAction.Access]: { label: m.auditlog.pageActionAccessed(), icon: "fa-arrow-right-to-bracket", tone: "secondary" },
  });

  function toneColor(tone: "primary" | "secondary" | "accent"): string {
    if (tone === "accent") return $colorStore.accent;
    if (tone === "secondary") return $colorStore.secondary;
    return $colorStore.primary;
  }

  /**
   * Renders a UTC audit timestamp in the timezone of whoever is viewing the
   * log. Older bot builds serialize the timestamp without a trailing `Z`, so a
   * `Z` is appended when no timezone designator is present to stop the browser
   * from misreading the instant as local time.
   */
  function formatDate(value: string): string {
    if (!value) return m.common.unknown();
    const utc = /[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`;
    return new Date(utc).toLocaleString();
  }

  /**
   * The resource path a request hit, with the method prefix and `/botapi`
   * stripped, so each row shows what was actually fetched or changed.
   */
  function describeEndpoint(entry: AuditLogEntry): string {
    let path = entry.endpoint ?? "";
    const space = path.indexOf(" ");
    if (space !== -1) path = path.slice(space + 1);
    return path.replace(/^\/?botapi\//i, "").replace(/^\//, "");
  }

  interface ChangeRow {
    label: string;
    before?: string;
    after: string;
  }

  /**
   * Turns a raw property name (PascalCase, camelCase, or snake_case) into a
   * spaced, capitalised label.
   */
  function humanizeKey(key: string): string {
    return key
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^./, (c) => c.toUpperCase());
  }

  /**
   * Renders a raw value as something a non-technical user can read.
   */
  function humanizeValue(value: unknown): string {
    if (value === null || value === undefined) return m.common.noneLower();
    if (typeof value === "boolean") return value ? m.common.on() : m.common.off();
    if (typeof value === "number" || typeof value === "bigint") return value.toString();
    if (typeof value === "string") return value.length ? value : m.auditlog.pageValueEmpty();
    if (Array.isArray(value)) {
      return value.length ? (value.length === 1 ? m.common.itemsOne({ count: value.length }) : m.common.itemsOther({ count: value.length })) : m.common.noneLower();
    }
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return m.auditlog.pageValueObject();
      }
    }
    return String(value);
  }

  function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  /**
   * Flattens a bare request body into readable rows, unwrapping the single
   * controller-argument layer (for example `{ request: { ... } }`).
   */
  function flattenSet(obj: Record<string, unknown>): ChangeRow[] {
    const rows: ChangeRow[] = [];
    for (const [key, value] of Object.entries(obj)) {
      if (isPlainObject(value)) {
        for (const [innerKey, innerVal] of Object.entries(value)) {
          rows.push({ label: humanizeKey(innerKey), after: humanizeValue(innerVal) });
        }
      } else {
        rows.push({ label: humanizeKey(key), after: humanizeValue(value) });
      }
    }
    return rows;
  }

  /**
   * Turns the raw before/after change document into a flat list of readable
   * field changes, so the average user never has to read raw JSON.
   */
  function summarizeChanges(changes: AuditChangeSet | null): ChangeRow[] {
    if (!changes) return [];
    const before: unknown = changes.before;
    const after: unknown = changes.after;
    const changedKeys = Array.isArray(changes.changed) ? changes.changed : null;

    if (isPlainObject(before) && isPlainObject(after)) {
      const keys = changedKeys ?? [...new Set([...Object.keys(before), ...Object.keys(after)])];
      return keys.map((key) => ({
        label: humanizeKey(key),
        before: humanizeValue(before[key]),
        after: humanizeValue(after[key]),
      }));
    }

    if (before !== undefined && after !== undefined) {
      return [{ label: m.common.value(), before: humanizeValue(before), after: humanizeValue(after) }];
    }

    if (isPlainObject(after)) return flattenSet(after);
    if (after !== undefined) return [{ label: m.common.value(), after: humanizeValue(after) }];
    return [];
  }

  function hasChangeDetail(entry: AuditLogEntry): boolean {
    return summarizeChanges(entry.changes).length > 0;
  }

  async function fetchAuditLog() {
    if (!$currentGuild?.id) return;

    return await loadingStore.wrap(
      "fetch-audit-log",
      async () => {
        try {
          loading = true;
          error = null;
          const result = await auditLogApi.getAuditLog($currentGuild.id, {
            action: actionFilter ?? undefined,
            section: sectionFilter ?? undefined,
            page,
            pageSize,
          });
          entries = result.items ?? [];
          total = result.total ?? 0;
        } catch (err) {
          logger.error("Failed to fetch audit log:", err);
          error = m.auditlog.pageErrorLoad();
        } finally {
          loading = false;
        }
      },
      "api",
      m.auditlog.pageLoading(),
    );
  }

  function applyFilters() {
    page = 1;
    fetchAuditLog();
  }

  function changePage(next: number) {
    if (next < 1 || next > totalPages) return;
    page = next;
    expandedId = null;
    fetchAuditLog();
  }

  function toggleExpand(id: number) {
    expandedId = expandedId === id ? null : id;
  }

  onMount(() => {
    fetchAuditLog();
  });

  // Refetch when the selected guild changes.
  let lastGuildId: bigint | null = null;
  $effect(() => {
    const id = $currentGuild?.id ?? null;
    if (id !== lastGuildId) {
      lastGuildId = id;
      page = 1;
      fetchAuditLog();
    }
  });
</script>

<DashboardPageLayout
  category="Security"
  guildName={$currentGuild?.name || m.common.dashboard()}
  icon="fa-clipboard-check"
  subtitle={m.auditlog.pageSubtitle()}
  title={m.features.auditlogName()}
>
  <!-- Filters -->
  <div
    class="rounded-2xl border p-4 sm:p-5 mb-6 flex flex-col sm:flex-row sm:items-end gap-4"
    style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
           border-color: {$colorStore.primary}30;"
    in:fly={{ y: 20, duration: 300 }}
  >
    <div class="flex-1 min-w-0">
      <span class="block text-sm font-medium mb-1" id="action-filter-label" style="color: {$colorStore.muted}">
        {m.common.action()}
      </span>
      <DiscordSelector
        type="custom"
        customIcon="fa-filter"
        options={actionOptions}
        selected={actionFilter === null ? null : String(actionFilter)}
        placeholder={m.common.allActions()}
        searchable={false}
        ariaLabelledby="action-filter-label"
        onchange={onActionChange}
      />
    </div>

    <div class="flex-1 min-w-0">
      <span class="block text-sm font-medium mb-1" id="section-filter-label" style="color: {$colorStore.muted}">
        {m.auditlog.pageColSection()}
      </span>
      <DiscordSelector
        type="custom"
        customIcon="fa-layer-group"
        options={sectionOptions}
        selected={sectionFilter}
        placeholder={m.auditlog.pageFilterSectionPlaceholder()}
        ariaLabelledby="section-filter-label"
        onchange={onSectionChange}
      />
    </div>

    <button
      onclick={fetchAuditLog}
      class="rounded-xl px-4 min-h-[44px] font-medium transition-all hover:translate-y-[-1px]"
      style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
    >
      <i class="fa-utility-duo fa-regular fa-arrows-rotate mr-2"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
      {m.common.refresh()}
    </button>
  </div>

  {#if loading}
    <div class="space-y-2" aria-busy="true" aria-label={m.auditlog.pageLoading()}>
      {#each Array(6) as _, i (i)}
        <SkeletonLoader type="feature" delay={i * 60} />
      {/each}
    </div>
  {:else if error}
    <div class="text-center py-12" style="color: {$colorStore.accent}">{error}</div>
  {:else if entries.length === 0}
    <div class="text-center py-12" style="color: {$colorStore.muted}">
      {m.auditlog.pageEmpty()}
    </div>
  {:else}
    <!-- Desktop table -->
    <div
      class="hidden md:block rounded-2xl border overflow-hidden"
      style="border-color: {$colorStore.primary}30;"
      in:fade={{ duration: 200 }}
    >
      <table class="w-full text-sm">
        <thead>
          <tr style="background: {$colorStore.primary}15;">
            <th class="text-left font-semibold px-4 py-3" style="color: {$colorStore.text}">{m.common.when()}</th>
            <th class="text-left font-semibold px-4 py-3" style="color: {$colorStore.text}">{m.common.user()}</th>
            <th class="text-left font-semibold px-4 py-3" style="color: {$colorStore.text}">{m.common.action()}</th>
            <th class="text-left font-semibold px-4 py-3" style="color: {$colorStore.text}">{m.auditlog.pageColSection()}</th>
            <th class="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {#each entries as entry (entry.id)}
            <tr style="border-top: 1px solid {$colorStore.primary}20;">
              <td class="px-4 py-3 whitespace-nowrap" style="color: {$colorStore.muted}">
                {formatDate(entry.dateAdded)}
              </td>
              <td class="px-4 py-3" style="color: {$colorStore.text}">
                {entry.userName || entry.userId.toString()}
              </td>
              <td class="px-4 py-3">
                <span
                  class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium"
                  style="background: {toneColor(actionMeta[entry.action].tone)}20;
                         color: {toneColor(actionMeta[entry.action].tone)};"
                >
                  <i class="fa-regular {actionMeta[entry.action].icon}"></i>
                  {actionMeta[entry.action].label}
                </span>
              </td>
              <td class="px-4 py-3" style="color: {$colorStore.text}">
                <div class="font-medium">{sectionLabel(entry.section)}</div>
                {#if describeEndpoint(entry)}
                  <div class="text-xs mt-0.5 font-mono break-all" style="color: {$colorStore.muted}">
                    {entry.httpMethod}
                    {describeEndpoint(entry)}
                  </div>
                {/if}
              </td>
              <td class="px-4 py-3 text-right">
                {#if hasChangeDetail(entry)}
                  <button
                    onclick={() => toggleExpand(entry.id)}
                    class="rounded-lg px-2 py-1 min-h-[36px] text-xs"
                    style="background: {$colorStore.primary}15; color: {$colorStore.text};"
                  >
                    {expandedId === entry.id ? m.common.hide() : m.common.details()}
                  </button>
                {/if}
              </td>
            </tr>
            {#if expandedId === entry.id && hasChangeDetail(entry)}
              <tr style="border-top: 1px solid {$colorStore.primary}20;">
                <td colspan="5" class="px-4 py-3" style="background: {$colorStore.primary}08;">
                  <div class="space-y-1.5">
                    {#each summarizeChanges(entry.changes) as row, i (i)}
                      <div class="flex flex-wrap items-baseline gap-x-2">
                        <span class="text-xs font-semibold" style="color: {$colorStore.text}">{row.label}</span>
                        {#if row.before !== undefined}
                          <span class="text-xs" style="color: {$colorStore.muted}">{row.before}</span>
                          <i class="fa-solid fa-arrow-right text-[10px]" style="color: {$colorStore.muted}"></i>
                        {/if}
                        <span class="text-xs" style="color: {$colorStore.text}">{row.after}</span>
                      </div>
                    {/each}
                  </div>
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
              class="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium"
              style="background: {toneColor(actionMeta[entry.action].tone)}20;
                     color: {toneColor(actionMeta[entry.action].tone)};"
            >
              <i class="fa-regular {actionMeta[entry.action].icon}"></i>
              {actionMeta[entry.action].label}
            </span>
            <span class="text-xs" style="color: {$colorStore.muted}">{formatDate(entry.dateAdded)}</span>
          </div>

          <div class="mt-3 text-sm font-medium" style="color: {$colorStore.text}">
            {entry.userName || entry.userId.toString()}
          </div>
          <div class="mt-1 text-sm">
            <span class="font-medium" style="color: {$colorStore.text}">{sectionLabel(entry.section)}</span>
          </div>
          {#if describeEndpoint(entry)}
            <div class="mt-0.5 text-xs font-mono break-all" style="color: {$colorStore.muted}">
              {entry.httpMethod}
              {describeEndpoint(entry)}
            </div>
          {/if}

          {#if hasChangeDetail(entry)}
            <button
              onclick={() => toggleExpand(entry.id)}
              class="mt-3 w-full rounded-xl px-3 min-h-[44px] text-sm font-medium"
              style="background: {$colorStore.primary}15; color: {$colorStore.text};"
            >
              {expandedId === entry.id ? m.auditlog.pageDetailsHideLong() : m.auditlog.pageDetailsShowLong()}
            </button>
            {#if expandedId === entry.id}
              <div class="mt-2 space-y-1.5 rounded-xl p-3" style="background: {$colorStore.primary}10;">
                {#each summarizeChanges(entry.changes) as row, i (i)}
                  <div class="flex flex-wrap items-baseline gap-x-2">
                    <span class="text-xs font-semibold" style="color: {$colorStore.text}">{row.label}</span>
                    {#if row.before !== undefined}
                      <span class="text-xs" style="color: {$colorStore.muted}">{row.before}</span>
                      <i class="fa-solid fa-arrow-right text-[10px]" style="color: {$colorStore.muted}"></i>
                    {/if}
                    <span class="text-xs" style="color: {$colorStore.text}">{row.after}</span>
                  </div>
                {/each}
              </div>
            {/if}
          {/if}
        </div>
      {/each}
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between gap-4 mt-6">
      <span class="text-sm" style="color: {$colorStore.muted}">
        {m.auditlog.pagePagination({ total, page, pages: totalPages })}
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
</DashboardPageLayout>
