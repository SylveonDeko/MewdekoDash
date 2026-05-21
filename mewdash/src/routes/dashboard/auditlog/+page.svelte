<!-- routes/dashboard/auditlog/+page.svelte -->
<script lang="ts">
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

  const actionOptions = [
    { id: String(AuditAction.View), name: "Viewed" },
    { id: String(AuditAction.Create), name: "Created" },
    { id: String(AuditAction.Update), name: "Updated" },
    { id: String(AuditAction.Delete), name: "Deleted" },
    { id: String(AuditAction.Access), name: "Accessed" },
  ];
  /**
   * Friendly display names for each bot controller, so the audit log reads in
   * dashboard terms instead of internal controller names.
   */
  const sectionLabels: Record<string, string> = {
    Administration: "Administration",
    Afk: "AFK System",
    AuditLog: "Audit Log",
    Birthday: "Birthdays",
    BotConfig: "Bot Config",
    BotStatus: "Bot Status",
    Chat: "Chat Saver",
    ChatTriggers: "Triggers",
    ClientOperations: "Client Operations",
    Confessions: "Confessions",
    Counting: "Counting",
    CustomVoice: "Custom Voice",
    Feeds: "Feeds",
    Filter: "Word Filter",
    Forms: "Forms",
    Giveaways: "Giveaways",
    Guild: "Server",
    GuildConfig: "Server Settings",
    Highlights: "Highlights",
    InstanceManagement: "Instance Management",
    InviteTracking: "Invites",
    JoinLeave: "Join / Leave",
    LastFm: "Last.fm",
    Logging: "Logging",
    Me: "Account",
    MessageCount: "Message Stats",
    Minecraft: "Minecraft",
    MinecraftBridge: "Minecraft Bridge",
    Moderation: "Moderation",
    MultiGreets: "Greets",
    Music: "Music",
    Ownership: "Ownership",
    Patreon: "Patreon",
    Performance: "Performance",
    Permissions: "Permissions",
    Poll: "Polls",
    Protection: "Protection",
    Repeaters: "Repeaters",
    Reputation: "Reputation",
    Reviews: "Reviews",
    RoleGreet: "Role Greets",
    RoleStates: "Role States",
    Starboard: "Starboard",
    StatChannel: "Stat Channels",
    StatusRoles: "Status Roles",
    StreamNotifications: "Streams",
    Suggestions: "Suggestions",
    SystemInfo: "System Info",
    Ticket: "Tickets",
    Todo: "Todo Lists",
    Votes: "Votes",
    Webhook: "Webhooks",
    Wizard: "Setup Wizard",
    Xp: "XP System",
  };

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

  const actionMeta: Record<AuditAction, { label: string; icon: string; tone: "primary" | "secondary" | "accent" }> = {
    [AuditAction.View]: { label: "Viewed", icon: "fa-eye", tone: "secondary" },
    [AuditAction.Create]: { label: "Created", icon: "fa-plus", tone: "primary" },
    [AuditAction.Update]: { label: "Updated", icon: "fa-pen", tone: "primary" },
    [AuditAction.Delete]: { label: "Deleted", icon: "fa-trash", tone: "accent" },
    [AuditAction.Access]: { label: "Accessed", icon: "fa-arrow-right-to-bracket", tone: "secondary" },
  };

  function toneColor(tone: "primary" | "secondary" | "accent"): string {
    if (tone === "accent") return $colorStore.accent;
    if (tone === "secondary") return $colorStore.secondary;
    return $colorStore.primary;
  }

  function formatDate(value: string): string {
    if (!value) return "Unknown";
    return new Date(value).toLocaleString();
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
    if (value === null || value === undefined) return "none";
    if (typeof value === "boolean") return value ? "On" : "Off";
    if (typeof value === "number" || typeof value === "bigint") return value.toString();
    if (typeof value === "string") return value.length ? value : "empty";
    if (Array.isArray(value)) {
      return value.length ? `${value.length} item${value.length === 1 ? "" : "s"}` : "none";
    }
    if (typeof value === "object") {
      try {
        return JSON.stringify(value);
      } catch {
        return "object";
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
      return [{ label: "Value", before: humanizeValue(before), after: humanizeValue(after) }];
    }

    if (isPlainObject(after)) return flattenSet(after);
    if (after !== undefined) return [{ label: "Value", after: humanizeValue(after) }];
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
          error = "Failed to load the audit log";
        } finally {
          loading = false;
        }
      },
      "api",
      "Loading audit log...",
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
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-utility-duo fa-regular fa-clipboard-list-check"
  subtitle="Who accessed the dashboard, what they changed, and what they viewed"
  title="Audit Log"
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
        Action
      </span>
      <DiscordSelector
        type="custom"
        customIcon="fa-filter"
        options={actionOptions}
        selected={actionFilter === null ? null : String(actionFilter)}
        placeholder="All actions"
        searchable={false}
        ariaLabelledby="action-filter-label"
        onchange={onActionChange}
      />
    </div>

    <div class="flex-1 min-w-0">
      <span class="block text-sm font-medium mb-1" id="section-filter-label" style="color: {$colorStore.muted}">
        Section
      </span>
      <DiscordSelector
        type="custom"
        customIcon="fa-layer-group"
        options={sectionOptions}
        selected={sectionFilter}
        placeholder="All sections"
        ariaLabelledby="section-filter-label"
        onchange={onSectionChange}
      />
    </div>

    <button
      onclick={fetchAuditLog}
      class="rounded-xl px-4 min-h-[44px] font-medium transition-all hover:translate-y-[-1px]"
      style="background: {$colorStore.primary}20; color: {$colorStore.text};"
    >
      <i class="fa-utility-duo fa-regular fa-rotate mr-2"
         style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
      Refresh
    </button>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2" style="border-color: {$colorStore.primary}"></div>
      <span class="ml-3" style="color: {$colorStore.text}">Loading audit log...</span>
    </div>
  {:else if error}
    <div class="text-center py-12" style="color: {$colorStore.accent}">{error}</div>
  {:else if entries.length === 0}
    <div class="text-center py-12" style="color: {$colorStore.muted}">
      No audit log entries match the current filters.
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
            <th class="text-left font-semibold px-4 py-3" style="color: {$colorStore.text}">When</th>
            <th class="text-left font-semibold px-4 py-3" style="color: {$colorStore.text}">User</th>
            <th class="text-left font-semibold px-4 py-3" style="color: {$colorStore.text}">Action</th>
            <th class="text-left font-semibold px-4 py-3" style="color: {$colorStore.text}">Section</th>
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
              <td class="px-4 py-3" style="color: {$colorStore.text}">{sectionLabel(entry.section)}</td>
              <td class="px-4 py-3 text-right">
                {#if hasChangeDetail(entry)}
                  <button
                    onclick={() => toggleExpand(entry.id)}
                    class="rounded-lg px-2 py-1 min-h-[36px] text-xs"
                    style="background: {$colorStore.primary}15; color: {$colorStore.text};"
                  >
                    {expandedId === entry.id ? "Hide" : "Details"}
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

          {#if hasChangeDetail(entry)}
            <button
              onclick={() => toggleExpand(entry.id)}
              class="mt-3 w-full rounded-xl px-3 min-h-[44px] text-sm font-medium"
              style="background: {$colorStore.primary}15; color: {$colorStore.text};"
            >
              {expandedId === entry.id ? "Hide details" : "Show details"}
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
        {total} entries &middot; page {page} of {totalPages}
      </span>
      <div class="flex gap-2">
        <button
          onclick={() => changePage(page - 1)}
          disabled={page <= 1}
          class="rounded-xl px-4 min-h-[44px] font-medium disabled:opacity-40"
          style="background: {$colorStore.primary}20; color: {$colorStore.text};"
        >
          Previous
        </button>
        <button
          onclick={() => changePage(page + 1)}
          disabled={page >= totalPages}
          class="rounded-xl px-4 min-h-[44px] font-medium disabled:opacity-40"
          style="background: {$colorStore.primary}20; color: {$colorStore.text};"
        >
          Next
        </button>
      </div>
    </div>
  {/if}
</DashboardPageLayout>
