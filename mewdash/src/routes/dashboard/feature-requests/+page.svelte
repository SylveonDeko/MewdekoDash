<!-- routes/dashboard/feature-requests/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { featureRequestsApi, ownershipApi } from "$lib/api/index.ts";
  import type {
    FeatureRequestCategory,
    FeatureRequestEntry,
    FeatureRequestSettings,
    FeatureRequestStats,
    FeatureRequestStatus,
  } from "$lib/api/featurerequests/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { logger } from "$lib/logger";
  import { loadingStore } from "$lib/stores/loadingStore";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";

  let { data } = $props();

  let isOwner = $state(false);
  let activeTab = $state("browse");

  let entries: FeatureRequestEntry[] = $state([]);
  let mine: FeatureRequestEntry[] = $state([]);
  let total = $state(0);
  let page = $state(1);
  let pageSize = $state(25);
  let loading = $state(true);
  let error: string | null = $state(null);
  let expandedId: number | null = $state(null);

  let statusFilter: FeatureRequestStatus | null = $state("open");
  let categoryFilter: FeatureRequestCategory | null = $state(null);
  let sort: "votes" | "newest" = $state("votes");
  let search = $state("");

  let formCategory: FeatureRequestCategory = $state("feature");
  let formTitle = $state("");
  let formBody = $state("");
  let formAttachGuild = $state(true);
  let submitting = $state(false);
  let submitError: string | null = $state(null);
  let submitted: FeatureRequestEntry | null = $state(null);

  let stats = $state<FeatureRequestStats | null>(null);
  let settings = $state<FeatureRequestSettings | null>(null);
  let channelInput = $state("");
  let savingSettings = $state(false);
  let settingsError: string | null = $state(null);

  let statusTarget = $state<FeatureRequestEntry | null>(null);
  let statusChoice: FeatureRequestStatus = $state("open");
  let statusNote = $state("");
  let savingStatus = $state(false);

  let deleteTarget = $state<FeatureRequestEntry | null>(null);
  let confirmDeleteOpen = $state(false);

  let tabs = $derived(
    isOwner
      ? [
          { id: "browse", label: "Browse", icon: "fa-lightbulb" },
          { id: "submit", label: "Suggest", icon: "fa-paper-plane" },
          { id: "mine", label: "Mine", icon: "fa-user" },
          { id: "settings", label: "Settings", icon: "fa-cog" },
        ]
      : [
          { id: "browse", label: "Browse", icon: "fa-lightbulb" },
          { id: "submit", label: "Suggest", icon: "fa-paper-plane" },
          { id: "mine", label: "Mine", icon: "fa-user" },
        ],
  );

  const categoryOptions = [
    { id: "feature", name: "Feature idea" },
    { id: "bug", name: "Bug report" },
    { id: "other", name: "Something else" },
  ];

  const statusOptions = [
    { id: "open", name: "Open" },
    { id: "planned", name: "Planned" },
    { id: "done", name: "Done" },
    { id: "declined", name: "Declined" },
  ];

  let totalPages = $derived(Math.max(1, Math.ceil(total / pageSize)));

  let channelDirty = $derived(
    settings !== null && channelInput.trim() !== (settings.channelId === 0n ? "" : settings.channelId.toString()),
  );

  let titleRemaining = $derived(120 - formTitle.length);
  let bodyRemaining = $derived(2000 - formBody.length);
  let canSubmit = $derived(
    !submitting && formTitle.trim().length >= 3 && formBody.trim().length >= 10 && titleRemaining >= 0 && bodyRemaining >= 0,
  );

  let statTiles = $derived([
    { label: "Total", value: stats?.total ?? 0, icon: "fa-lightbulb", tone: "primary" },
    { label: "Open", value: stats?.byStatus?.open ?? 0, icon: "fa-hourglass", tone: "secondary" },
    { label: "Planned", value: stats?.byStatus?.planned ?? 0, icon: "fa-wand-magic-sparkles", tone: "primary" },
    { label: "Done", value: stats?.byStatus?.done ?? 0, icon: "fa-circle-check", tone: "primary" },
    { label: "Declined", value: stats?.byStatus?.declined ?? 0, icon: "fa-xmark", tone: "accent" },
    { label: "Bugs", value: stats?.byCategory?.bug ?? 0, icon: "fa-bug", tone: "accent" },
  ]);

  function toneColor(tone: string): string {
    if (tone === "accent") return $colorStore.accent;
    if (tone === "secondary") return $colorStore.secondary;
    return $colorStore.primary;
  }

  function statusTone(status: FeatureRequestStatus): string {
    if (status === "declined") return $colorStore.accent;
    if (status === "open") return $colorStore.secondary;
    return $colorStore.primary;
  }

  function statusLabel(status: FeatureRequestStatus): string {
    return statusOptions.find((s) => s.id === status)?.name ?? status;
  }

  function categoryLabel(category: FeatureRequestCategory): string {
    return categoryOptions.find((c) => c.id === category)?.name ?? category;
  }

  function categoryIcon(category: FeatureRequestCategory): string {
    if (category === "bug") return "fa-bug";
    if (category === "other") return "fa-comments";
    return "fa-lightbulb";
  }

  /**
   * Renders a UTC timestamp in the viewer's timezone, appending a `Z` when the
   * bot serialized the value without a timezone designator.
   */
  function formatDate(value: string | null): string {
    if (!value) return "Unknown";
    const utc = /[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`;
    return new Date(utc).toLocaleString();
  }

  async function fetchPage() {
    return await loadingStore.wrap(
      "fetch-feature-requests",
      async () => {
        try {
          loading = true;
          error = null;
          const result = await featureRequestsApi.getPage({
            status: statusFilter ?? undefined,
            category: categoryFilter ?? undefined,
            search: search.trim() || undefined,
            sort,
            page,
            pageSize,
          });
          entries = result.items ?? [];
          total = result.total ?? 0;
        } catch (err) {
          logger.error("Failed to fetch feature requests:", err);
          error = "Failed to load feature requests";
        } finally {
          loading = false;
        }
      },
      "api",
      "Loading feature requests...",
    );
  }

  async function fetchMine() {
    try {
      mine = await featureRequestsApi.getMine();
    } catch (err) {
      logger.error("Failed to fetch own feature requests:", err);
    }
  }

  async function fetchStats() {
    if (!isOwner) return;
    try {
      stats = await featureRequestsApi.getStats();
    } catch (err) {
      logger.error("Failed to fetch feature request stats:", err);
    }
  }

  async function fetchSettings() {
    if (!isOwner) return;
    try {
      settings = await featureRequestsApi.getSettings();
      channelInput = settings.channelId === 0n ? "" : settings.channelId.toString();
      settingsError = null;
    } catch (err) {
      logger.error("Failed to load feature request settings:", err);
      settingsError = "Failed to load the settings";
    }
  }

  function applyFilters() {
    page = 1;
    expandedId = null;
    fetchPage();
  }

  function changePage(next: number) {
    if (next < 1 || next > totalPages) return;
    page = next;
    expandedId = null;
    fetchPage();
  }

  function toggleExpand(id: number) {
    expandedId = expandedId === id ? null : id;
  }

  function onStatusFilterChange(detail: { selected: string | string[] | null }) {
    const value = detail.selected;
    statusFilter = typeof value === "string" && value !== "" ? (value as FeatureRequestStatus) : null;
    applyFilters();
  }

  function onCategoryFilterChange(detail: { selected: string | string[] | null }) {
    const value = detail.selected;
    categoryFilter = typeof value === "string" && value !== "" ? (value as FeatureRequestCategory) : null;
    applyFilters();
  }

  function onFormCategoryChange(detail: { selected: string | string[] | null }) {
    const value = detail.selected;
    if (typeof value === "string" && value !== "") formCategory = value as FeatureRequestCategory;
  }

  function onStatusChoiceChange(detail: { selected: string | string[] | null }) {
    const value = detail.selected;
    if (typeof value === "string" && value !== "") statusChoice = value as FeatureRequestStatus;
  }

  /**
   * Flips the vote locally first so the button feels instant, then reconciles with
   * whatever count the bot reports back.
   */
  async function toggleVote(entry: FeatureRequestEntry) {
    const before = { votes: entry.votes, voted: entry.voted };
    entry.voted = !entry.voted;
    entry.votes += entry.voted ? 1 : -1;

    try {
      const result = await featureRequestsApi.toggleVote(entry.id);
      entry.votes = result.votes;
      entry.voted = result.voted;
    } catch (err) {
      logger.error("Failed to toggle vote:", err);
      entry.votes = before.votes;
      entry.voted = before.voted;
      error = "Failed to save your vote";
    }
  }

  async function submit() {
    if (!canSubmit) return;

    try {
      submitting = true;
      submitError = null;
      submitted = await featureRequestsApi.submit({
        guildId: formAttachGuild && $currentGuild ? BigInt($currentGuild.id) : null,
        category: formCategory,
        title: formTitle.trim(),
        body: formBody.trim(),
      });
      formTitle = "";
      formBody = "";
      formCategory = "feature";
      await Promise.all([fetchMine(), fetchStats()]);
    } catch (err) {
      logger.error("Failed to submit feature request:", err);
      submitError = err instanceof Error ? err.message : "Failed to submit your request";
    } finally {
      submitting = false;
    }
  }

  function openStatus(entry: FeatureRequestEntry) {
    statusTarget = entry;
    statusChoice = entry.status;
    statusNote = entry.ownerNote ?? "";
  }

  async function saveStatus() {
    const target = statusTarget;
    if (!target) return;

    try {
      savingStatus = true;
      const updated = await featureRequestsApi.setStatus(target.id, {
        status: statusChoice,
        note: statusNote.trim() || null,
      });
      target.status = updated.status;
      target.ownerNote = updated.ownerNote;
      target.updatedAt = updated.updatedAt;
      statusTarget = null;
      await fetchStats();
    } catch (err) {
      logger.error("Failed to update feature request status:", err);
      error = err instanceof Error ? err.message : "Failed to update the status";
    } finally {
      savingStatus = false;
    }
  }

  function requestDelete(entry: FeatureRequestEntry) {
    deleteTarget = entry;
    confirmDeleteOpen = true;
  }

  async function confirmDelete() {
    const target = deleteTarget;
    deleteTarget = null;
    if (!target) return;

    try {
      await featureRequestsApi.deleteRequest(target.id);
      await Promise.all([fetchPage(), fetchStats()]);
    } catch (err) {
      logger.error("Failed to delete feature request:", err);
      error = "Failed to delete that request";
    }
  }

  async function saveChannel() {
    const trimmed = channelInput.trim();

    if (trimmed && !/^\d{17,20}$/.test(trimmed)) {
      settingsError = "That does not look like a channel ID";
      return;
    }

    try {
      savingSettings = true;
      settingsError = null;
      settings = await featureRequestsApi.setSettings(trimmed ? BigInt(trimmed) : 0n);
      channelInput = settings.channelId === 0n ? "" : settings.channelId.toString();
    } catch (err) {
      logger.error("Failed to save feature request settings:", err);
      settingsError = err instanceof Error ? err.message : "Failed to save the settings";
      await fetchSettings();
    } finally {
      savingSettings = false;
    }
  }

  onMount(async () => {
    try {
      isOwner = await ownershipApi.isOwner(BigInt(data.user.id));
    } catch (err) {
      logger.error("Owner check failed:", err);
      isOwner = false;
    }

    await Promise.all([fetchPage(), fetchMine(), fetchStats(), fetchSettings()]);
  });
</script>

{#snippet requestCard(entry: FeatureRequestEntry, showOwnerActions: boolean)}
  <div
    class="rounded-2xl border overflow-hidden"
    style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
           border-color: {$colorStore.primary}30;"
  >
    <div class="flex gap-3 p-4">
      <button
        type="button"
        class="flex flex-col items-center justify-center rounded-xl px-3 min-w-[56px] min-h-[56px] transition-all hover:opacity-80"
        style="background: {entry.voted ? $colorStore.primary : $colorStore.primary + '15'};
               color: {entry.voted ? '#fff' : $colorStore.primary};
               border: 1px solid {$colorStore.primary}30;"
        aria-pressed={entry.voted}
        aria-label={entry.voted ? "Remove your vote" : "Upvote this request"}
        onclick={() => toggleVote(entry)}
      >
        <i class="fa-solid fa-thumbs-up"></i>
        <span class="text-sm font-semibold mt-1">{entry.votes}</span>
      </button>

      <button type="button" class="flex-1 min-w-0 text-left" onclick={() => toggleExpand(entry.id)}>
        <div class="flex flex-wrap items-center gap-2">
          <span
            class="text-xs px-2 py-0.5 rounded-full font-medium"
            style="background: {statusTone(entry.status)}20; color: {statusTone(entry.status)};"
          >
            {statusLabel(entry.status)}
          </span>
          <span class="text-xs flex items-center gap-1" style="color: {$colorStore.muted}">
            <i class="fa-regular {categoryIcon(entry.category)}"></i>
            {categoryLabel(entry.category)}
          </span>
          {#if entry.mine}
            <span class="text-xs px-2 py-0.5 rounded-full" style="background: {$colorStore.secondary}20; color: {$colorStore.secondary};">
              Yours
            </span>
          {/if}
        </div>
        <h3 class="mt-1 font-semibold truncate" style="color: {$colorStore.text}">{entry.title}</h3>
        <p class="text-xs mt-1" style="color: {$colorStore.muted}">
          {entry.userName} · {formatDate(entry.dateAdded)}
          {#if entry.guildName}· from {entry.guildName}{/if}
        </p>
        {#if expandedId !== entry.id}
          <p class="text-sm mt-2 line-clamp-2 whitespace-pre-line" style="color: {$colorStore.text}">{entry.body}</p>
        {/if}
      </button>
    </div>

    {#if expandedId === entry.id}
      <div class="px-4 pb-4" transition:fade={{ duration: 150 }}>
        <p class="text-sm whitespace-pre-line" style="color: {$colorStore.text}">{entry.body}</p>

        {#if entry.ownerNote}
          <div class="mt-3 rounded-xl p-3 text-sm" style="background: {$colorStore.primary}10; color: {$colorStore.text};">
            <span class="font-medium" style="color: {$colorStore.primary}">Note from the developers:</span>
            {entry.ownerNote}
          </div>
        {/if}

        {#if showOwnerActions}
          <div class="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              class="rounded-xl px-4 min-h-[44px] font-medium"
              style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
              onclick={() => openStatus(entry)}
            >
              Change status
            </button>
            <button
              type="button"
              class="rounded-xl px-4 min-h-[44px] font-medium"
              style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
              onclick={() => requestDelete(entry)}
            >
              Delete
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
{/snippet}

<DashboardPageLayout
  category="Community"
  guildName={$currentGuild?.name ?? "Mewdeko"}
  icon="fa-lightbulb"
  subtitle="Suggest features, report bugs, and upvote what others asked for"
  title="Feature Requests"
  {tabs}
  bind:activeTab
>
  {#if error}
    <div
      class="rounded-2xl border p-4 mb-6 text-sm"
      style="background: {$colorStore.accent}10; border-color: {$colorStore.accent}30; color: {$colorStore.accent};"
      in:fade
    >
      {error}
    </div>
  {/if}

  {#if activeTab === "submit"}
    <div
      class="rounded-2xl border p-4 sm:p-6 max-w-3xl"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
      in:fly={{ y: 20, duration: 300 }}
    >
      {#if submitted}
        <div class="rounded-xl p-4 mb-4 text-sm" style="background: {$colorStore.primary}15; color: {$colorStore.text};" in:fade>
          <span class="font-medium" style="color: {$colorStore.primary}">Thanks!</span>
          Your request "{submitted.title}" was sent to the developers. You can follow it under the Mine tab.
          <button type="button" class="underline ml-1" style="color: {$colorStore.primary}" onclick={() => (submitted = null)}>
            Submit another
          </button>
        </div>
      {/if}

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1" for="fr-category" style="color: {$colorStore.muted}">
          What kind of request is this?
        </label>
        <DiscordSelector
          id="fr-category"
          type="custom"
          options={categoryOptions}
          selected={formCategory}
          placeholder="Pick a category"
          onchange={onFormCategoryChange}
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1" for="fr-title" style="color: {$colorStore.muted}">
          Title
        </label>
        <input
          id="fr-title"
          type="text"
          bind:value={formTitle}
          maxlength="120"
          disabled={submitting}
          placeholder="One line that sums it up"
          class="w-full rounded-xl px-3 min-h-[44px] outline-none"
          style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        />
        <p class="text-xs mt-1 text-right" style="color: {titleRemaining < 0 ? $colorStore.accent : $colorStore.muted}">
          {titleRemaining} left
        </p>
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1" for="fr-body" style="color: {$colorStore.muted}">
          Details
        </label>
        <textarea
          id="fr-body"
          rows="7"
          bind:value={formBody}
          maxlength="2000"
          disabled={submitting}
          placeholder="What should it do? If it is a bug, what happened and what did you expect instead?"
          class="w-full rounded-xl px-3 py-2 outline-none resize-y"
          style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        ></textarea>
        <p class="text-xs mt-1 text-right" style="color: {bodyRemaining < 0 ? $colorStore.accent : $colorStore.muted}">
          {bodyRemaining} left
        </p>
      </div>

      {#if $currentGuild}
        <label class="flex items-center gap-3 mb-4 min-h-[44px] cursor-pointer" style="color: {$colorStore.text}">
          <input type="checkbox" bind:checked={formAttachGuild} class="w-5 h-5" />
          <span class="text-sm">Mention that I was managing {$currentGuild.name}</span>
        </label>
      {/if}

      {#if submitError}
        <p class="text-sm mb-3" style="color: {$colorStore.accent}">{submitError}</p>
      {/if}

      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          type="button"
          class="rounded-xl px-5 min-h-[44px] font-medium disabled:opacity-40"
          style="background: {$colorStore.primary}; color: #fff;"
          disabled={!canSubmit}
          onclick={submit}
        >
          {submitting ? "Sending..." : "Send to the developers"}
        </button>
        <span class="text-xs" style="color: {$colorStore.muted}">
          Up to three requests an hour. Your Discord name is attached so we can follow up.
        </span>
      </div>
    </div>
  {:else if activeTab === "mine"}
    {#if mine.length === 0}
      <div class="rounded-2xl border p-8 text-center" style="border-color: {$colorStore.primary}30; color: {$colorStore.muted};" in:fade>
        <i class="fa-regular fa-lightbulb text-3xl mb-3" style="color: {$colorStore.primary}"></i>
        <p>You have not submitted anything yet.</p>
        <button type="button" class="mt-3 underline" style="color: {$colorStore.primary}" onclick={() => (activeTab = "submit")}>
          Suggest something
        </button>
      </div>
    {:else}
      <div class="space-y-3" in:fly={{ y: 20, duration: 300 }}>
        {#each mine as entry (entry.id)}
          {@render requestCard(entry, isOwner)}
        {/each}
      </div>
    {/if}
  {:else if activeTab === "settings" && isOwner}
    {#if settings}
      <div
        class="rounded-2xl border p-4 sm:p-5 mb-6 max-w-3xl"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
        in:fly={{ y: 20, duration: 300 }}
      >
        <div class="flex items-baseline justify-between gap-3 mb-3">
          <h2 class="text-sm font-semibold" style="color: {$colorStore.text}">Report channel</h2>
          <span class="text-xs" style="color: {$colorStore.muted}">Applies to the whole bot, not one server</span>
        </div>

        <label class="block text-sm font-medium mb-1" for="fr-channel" style="color: {$colorStore.muted}">
          Channel ID new requests get posted to
        </label>
        <div class="flex flex-col sm:flex-row gap-2">
          <input
            id="fr-channel"
            type="text"
            inputmode="numeric"
            bind:value={channelInput}
            disabled={savingSettings}
            placeholder="Leave empty to use the join/leave channel"
            class="flex-1 rounded-xl px-3 min-h-[44px] outline-none font-mono"
            style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
          />
          <button
            type="button"
            onclick={saveChannel}
            disabled={savingSettings || !channelDirty}
            class="rounded-xl px-4 min-h-[44px] font-medium disabled:opacity-40"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
          >
            {savingSettings ? "Saving..." : "Save channel"}
          </button>
        </div>

        {#if settingsError}
          <p class="mt-2 text-xs" style="color: {$colorStore.accent}">{settingsError}</p>
        {:else if settings.effectiveChannelId === 0n}
          <p class="mt-2 text-xs" style="color: {$colorStore.accent}">
            No channel is set and there is no join/leave channel to fall back to, so requests are only stored, not posted.
          </p>
        {:else if !settings.reachable}
          <p class="mt-2 text-xs" style="color: {$colorStore.accent}">
            The bot cannot see channel {settings.effectiveChannelId.toString()}, so requests will not be posted.
          </p>
        {:else}
          <p class="mt-2 text-xs" style="color: {$colorStore.muted}">
            Requests go to #{settings.channelName}
            {#if settings.guildName}in {settings.guildName}{/if}
            {#if settings.usingFallback}(from the join/leave channel, since no channel is set){/if}
          </p>
        {/if}
      </div>
    {/if}
  {:else}
    {#if isOwner && stats}
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
    {/if}

    <div
      class="rounded-2xl border p-4 sm:p-5 mb-6 flex flex-col lg:flex-row lg:items-end gap-4"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
      in:fly={{ y: 20, duration: 300 }}
    >
      <div class="flex-1 min-w-0">
        <label class="block text-sm font-medium mb-1" for="fr-search" style="color: {$colorStore.muted}">Search</label>
        <input
          id="fr-search"
          type="search"
          bind:value={search}
          placeholder="Title, details, or submitter"
          class="w-full rounded-xl px-3 min-h-[44px] outline-none"
          style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
          onkeydown={(e) => e.key === "Enter" && applyFilters()}
        />
      </div>
      <div class="w-full lg:w-44">
        <label class="block text-sm font-medium mb-1" for="fr-status" style="color: {$colorStore.muted}">Status</label>
        <DiscordSelector
          id="fr-status"
          type="custom"
          options={statusOptions}
          selected={statusFilter}
          placeholder="Any status"
          onchange={onStatusFilterChange}
        />
      </div>
      <div class="w-full lg:w-44">
        <label class="block text-sm font-medium mb-1" for="fr-cat" style="color: {$colorStore.muted}">Category</label>
        <DiscordSelector
          id="fr-cat"
          type="custom"
          options={categoryOptions}
          selected={categoryFilter}
          placeholder="Any category"
          onchange={onCategoryFilterChange}
        />
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          class="rounded-xl px-4 min-h-[44px] font-medium"
          style="background: {sort === 'votes' ? $colorStore.primary : $colorStore.primary + '15'};
                 color: {sort === 'votes' ? '#fff' : $colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
          onclick={() => { sort = "votes"; applyFilters(); }}
        >
          Top
        </button>
        <button
          type="button"
          class="rounded-xl px-4 min-h-[44px] font-medium"
          style="background: {sort === 'newest' ? $colorStore.primary : $colorStore.primary + '15'};
                 color: {sort === 'newest' ? '#fff' : $colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
          onclick={() => { sort = "newest"; applyFilters(); }}
        >
          New
        </button>
      </div>
    </div>

    {#if loading}
      <SkeletonLoader />
    {:else if entries.length === 0}
      <div class="rounded-2xl border p-8 text-center" style="border-color: {$colorStore.primary}30; color: {$colorStore.muted};" in:fade>
        <i class="fa-regular fa-lightbulb text-3xl mb-3" style="color: {$colorStore.primary}"></i>
        <p>Nothing here yet. Be the first to suggest something.</p>
        <button type="button" class="mt-3 underline" style="color: {$colorStore.primary}" onclick={() => (activeTab = "submit")}>
          Suggest a feature
        </button>
      </div>
    {:else}
      <div class="space-y-3" in:fly={{ y: 20, duration: 300 }}>
        {#each entries as entry (entry.id)}
          {@render requestCard(entry, isOwner)}
        {/each}
      </div>

      {#if totalPages > 1}
        <div class="flex items-center justify-between gap-3 mt-6">
          <button
            type="button"
            class="rounded-xl px-4 min-h-[44px] font-medium disabled:opacity-40"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
            disabled={page <= 1}
            onclick={() => changePage(page - 1)}
          >
            Previous
          </button>
          <span class="text-sm" style="color: {$colorStore.muted}">Page {page} of {totalPages}</span>
          <button
            type="button"
            class="rounded-xl px-4 min-h-[44px] font-medium disabled:opacity-40"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
            disabled={page >= totalPages}
            onclick={() => changePage(page + 1)}
          >
            Next
          </button>
        </div>
      {/if}
    {/if}
  {/if}
</DashboardPageLayout>

{#if statusTarget}
  <div
    class="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4"
    role="presentation"
    onclick={(e) => { if (e.target === e.currentTarget) statusTarget = null; }}
  >
    <div
      class="rounded-2xl border shadow-2xl max-w-md w-full p-6"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15); border-color: {$colorStore.primary}30;"
      role="dialog"
      aria-modal="true"
      aria-labelledby="fr-status-title"
      in:fly={{ y: 20, duration: 200 }}
      out:fly={{ y: -20, duration: 150 }}
    >
      <h2 id="fr-status-title" class="text-lg font-semibold mb-1" style="color: {$colorStore.text}">Update status</h2>
      <p class="text-sm mb-4 truncate" style="color: {$colorStore.muted}">{statusTarget.title}</p>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1" for="fr-status-choice" style="color: {$colorStore.muted}">Status</label>
        <DiscordSelector
          id="fr-status-choice"
          type="custom"
          options={statusOptions}
          selected={statusChoice}
          placeholder="Pick a status"
          onchange={onStatusChoiceChange}
        />
      </div>

      <div class="mb-4">
        <label class="block text-sm font-medium mb-1" for="fr-status-note" style="color: {$colorStore.muted}">
          Note for the submitter (optional)
        </label>
        <textarea
          id="fr-status-note"
          rows="4"
          bind:value={statusNote}
          maxlength="1000"
          class="w-full rounded-xl px-3 py-2 outline-none resize-y"
          style="background: {$colorStore.primary}10; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        ></textarea>
      </div>

      <div class="flex gap-3">
        <button
          type="button"
          class="flex-1 px-4 py-3 rounded-xl font-medium min-h-[44px]"
          style="background: {$colorStore.muted}20; color: {$colorStore.muted};"
          onclick={() => (statusTarget = null)}
        >
          Cancel
        </button>
        <button
          type="button"
          class="flex-1 px-4 py-3 rounded-xl font-medium min-h-[44px] disabled:opacity-40"
          style="background: {$colorStore.primary}; color: #fff;"
          disabled={savingStatus}
          onclick={saveStatus}
        >
          {savingStatus ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  </div>
{/if}

<ConfirmationModal
  bind:isOpen={confirmDeleteOpen}
  title="Delete this request?"
  message={deleteTarget ? `"${deleteTarget.title}" and its votes will be removed. This cannot be undone.` : ""}
  confirmText="Delete"
  cancelText="Keep"
  variant="danger"
  onconfirm={confirmDelete}
  oncancel={() => (deleteTarget = null)}
/>
