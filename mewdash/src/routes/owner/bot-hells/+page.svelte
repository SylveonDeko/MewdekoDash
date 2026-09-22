<!-- routes/owner/bot-hells/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { goto } from "$app/navigation";
  import { botHellApi, ownershipApi } from "$lib/api/index.ts";
  import type { BotHellEntry, BotHellSettings } from "$lib/api/bothell/models";
  import { colorStore } from "$lib/stores/colorStore";
  import { logger } from "$lib/logger";
  import { loadingStore } from "$lib/stores/loadingStore";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";
  import ConfirmationModal from "$lib/components/ui/ConfirmationModal.svelte";
  import SkeletonLoader from "$lib/components/ui/SkeletonLoader.svelte";

  let { data } = $props();

  let entries: BotHellEntry[] = $state([]);
  let flaggedCount = $state(0);
  let loading = $state(true);
  let error: string | null = $state(null);

  let flaggedOnly = $state(true);
  let search = $state("");
  let selected = $state<Set<string>>(new Set());
  let checking = $state<Set<string>>(new Set());
  let leaving = $state(false);
  let leaveTargets = $state<BotHellEntry[]>([]);
  let confirmLeaveOpen = $state(false);
  let lastResult: string | null = $state(null);

  let settings = $state<BotHellSettings | null>(null);
  let minMembersInput = $state("");
  let botCountInput = $state("");
  let botPercentInput = $state("");
  let channelInput = $state("");
  let savingSettings = $state(false);
  let settingsError: string | null = $state(null);

  let activeTab = $state("servers");

  const tabs = [
    { id: "servers", label: "Servers", icon: "fa-robot" },
    { id: "settings", label: "Settings", icon: "fa-cog" },
  ];

  let visible = $derived.by(() => {
    const term = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (flaggedOnly && !e.isBotHell) return false;
      if (!term) return true;
      return e.guildName.toLowerCase().includes(term) || e.guildId.toString().includes(term);
    });
  });

  let selectedEntries = $derived(entries.filter((e) => selected.has(e.guildId.toString())));

  let allVisibleSelected = $derived(visible.length > 0 && visible.every((e) => selected.has(e.guildId.toString())));

  let thresholdsDirty = $derived(
    settings !== null &&
      (minMembersInput !== settings.minMembers.toString() ||
        botCountInput !== settings.botCount.toString() ||
        botPercentInput !== settings.botPercent.toString() ||
        channelInput.trim() !== (settings.channelId === 0n ? "" : settings.channelId.toString())),
  );

  let statTiles = $derived([
    { label: "Servers", value: entries.length, icon: "fa-server", tone: "secondary" },
    { label: "Flagged", value: flaggedCount, icon: "fa-triangle-exclamation", tone: "accent" },
    { label: "Selected", value: selected.size, icon: "fa-square-check", tone: "primary" },
    {
      label: "Bots in flagged",
      value: entries.filter((e) => e.isBotHell).reduce((sum, e) => sum + e.bots, 0),
      icon: "fa-robot",
      tone: "accent",
    },
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
    if (!value) return "Unknown";
    const utc = /[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`;
    return new Date(utc).toLocaleDateString();
  }

  function triggerLabel(entry: BotHellEntry): string {
    if (entry.byCount && entry.byPercent) return "Count and ratio";
    if (entry.byCount) return "Count";
    if (entry.byPercent) return "Ratio";
    return "Below thresholds";
  }

  function isSelected(entry: BotHellEntry): boolean {
    return selected.has(entry.guildId.toString());
  }

  function toggleSelect(entry: BotHellEntry) {
    const key = entry.guildId.toString();
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    selected = next;
  }

  function toggleSelectAllVisible() {
    const next = new Set(selected);
    if (allVisibleSelected) {
      for (const e of visible) next.delete(e.guildId.toString());
    } else {
      for (const e of visible) next.add(e.guildId.toString());
    }
    selected = next;
  }

  function selectAllFlagged() {
    selected = new Set(entries.filter((e) => e.isBotHell).map((e) => e.guildId.toString()));
  }

  function clearSelection() {
    selected = new Set();
  }

  async function fetchServers() {
    return await loadingStore.wrap(
      "fetch-bot-hells",
      async () => {
        try {
          loading = true;
          error = null;
          const result = await botHellApi.getAll(false);
          entries = result.items ?? [];
          flaggedCount = result.flagged ?? 0;
          settings = result.settings;
          seedSettingsInputs();
          const stillPresent = new Set(entries.map((e) => e.guildId.toString()));
          selected = new Set([...selected].filter((id) => stillPresent.has(id)));
        } catch (err) {
          logger.error("Failed to fetch bot hells:", err);
          error = "Failed to load servers";
        } finally {
          loading = false;
        }
      },
      "api",
      "Scanning servers...",
    );
  }

  /**
   * Re-evaluates one server after the bot downloads its full member list, which is the only
   * way to get exact counts for large servers whose member cache is partial.
   */
  async function recheck(entry: BotHellEntry) {
    const key = entry.guildId.toString();
    checking = new Set([...checking, key]);
    try {
      const updated = await botHellApi.check(entry.guildId);
      entries = entries.map((e) => (e.guildId === updated.guildId ? updated : e));
      flaggedCount = entries.filter((e) => e.isBotHell).length;
    } catch (err) {
      logger.error("Failed to recheck server:", err);
      error = `Failed to recheck ${entry.guildName}`;
    } finally {
      const next = new Set(checking);
      next.delete(key);
      checking = next;
    }
  }

  function requestLeave(targets: BotHellEntry[]) {
    if (targets.length === 0) return;
    leaveTargets = targets;
    confirmLeaveOpen = true;
  }

  async function confirmLeave() {
    const targets = leaveTargets;
    leaveTargets = [];
    if (targets.length === 0) return;

    try {
      leaving = true;
      lastResult = null;
      const result = await botHellApi.leave(targets.map((t) => t.guildId));
      const failed = Object.keys(result.failed ?? {}).length;
      lastResult = failed === 0
        ? `Left ${result.left.length} server${result.left.length === 1 ? "" : "s"}`
        : `Left ${result.left.length}, ${failed} failed: ${Object.values(result.failed).join("; ")}`;
      clearSelection();
      await fetchServers();
    } catch (err) {
      logger.error("Failed to leave servers:", err);
      error = err instanceof Error ? err.message : "Failed to leave the selected servers";
    } finally {
      leaving = false;
    }
  }

  function seedSettingsInputs() {
    if (!settings) return;
    minMembersInput = settings.minMembers.toString();
    botCountInput = settings.botCount.toString();
    botPercentInput = settings.botPercent.toString();
    channelInput = settings.channelId === 0n ? "" : settings.channelId.toString();
  }

  async function fetchSettings() {
    try {
      settings = await botHellApi.getSettings();
      seedSettingsInputs();
      settingsError = null;
    } catch (err) {
      logger.error("Failed to load bot hell settings:", err);
      settingsError = "Failed to load the settings";
    }
  }

  async function saveSettings(autoLeave: boolean) {
    if (!settings) return;
    const minMembers = Number.parseInt(minMembersInput, 10);
    const botCount = Number.parseInt(botCountInput, 10);
    const botPercent = Number.parseInt(botPercentInput, 10);
    const channel = channelInput.trim();

    if ([minMembers, botCount, botPercent].some((n) => !Number.isFinite(n) || n < 0)) {
      settingsError = "Thresholds must be whole numbers, zero or above";
      return;
    }
    if (botPercent > 100) {
      settingsError = "The bot percentage cannot be above 100";
      return;
    }
    if (channel && !/^\d{17,20}$/.test(channel)) {
      settingsError = "That does not look like a channel ID";
      return;
    }

    try {
      savingSettings = true;
      settingsError = null;
      settings = await botHellApi.setSettings({
        minMembers,
        botCount,
        botPercent,
        autoLeave,
        channelId: channel ? BigInt(channel) : 0n,
      });
      seedSettingsInputs();
      await fetchServers();
    } catch (err) {
      logger.error("Failed to save bot hell settings:", err);
      settingsError = err instanceof Error ? err.message : "Failed to save the settings";
      await fetchSettings();
    } finally {
      savingSettings = false;
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
      "Checking permissions...",
    );

    if (!allowed) {
      goto("/dashboard");
      return;
    }

    await fetchServers();
  });
</script>

<DashboardPageLayout
  category="Analytics"
  guildName="Bot Owner Tools"
  icon="fa-robot"
  subtitle="Servers littered with bots, and a way out of them"
  title="Bot Hells"
  basePath="/owner/bot-hells"
  {tabs}
  bind:activeTab
>
  {#if activeTab === 'settings'}
    {#if settings}
      <div
        class="rounded-2xl border p-4 sm:p-5 mb-6"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
        in:fly={{ y: 20, duration: 300 }}
      >
        <div class="flex items-baseline justify-between gap-3 mb-3">
          <h2 class="text-sm font-semibold" style="color: {$colorStore.text}">Thresholds</h2>
          <span class="text-xs" style="color: {$colorStore.muted}">Applies to the whole bot, not one server</span>
        </div>

        <p class="text-sm mb-4" style="color: {$colorStore.muted}">
          A server is flagged when it has at least the minimum members and either the bot count or the bot percentage
          is met. Set a threshold to 0 to turn that check off.
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-sm font-medium mb-1" for="bh-min-members" style="color: {$colorStore.muted}">
              Minimum members
            </label>
            <input
              id="bh-min-members"
              type="number"
              min="0"
              bind:value={minMembersInput}
              disabled={savingSettings}
              class="w-full rounded-xl px-3 min-h-[44px] outline-none font-mono"
              style="background: {$colorStore.primary}10; color: {$colorStore.text};
                     border: 1px solid {$colorStore.primary}30;"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="bh-bot-count" style="color: {$colorStore.muted}">
              Bot count
            </label>
            <input
              id="bh-bot-count"
              type="number"
              min="0"
              bind:value={botCountInput}
              disabled={savingSettings}
              class="w-full rounded-xl px-3 min-h-[44px] outline-none font-mono"
              style="background: {$colorStore.primary}10; color: {$colorStore.text};
                     border: 1px solid {$colorStore.primary}30;"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="bh-bot-percent" style="color: {$colorStore.muted}">
              Bot percentage
            </label>
            <input
              id="bh-bot-percent"
              type="number"
              min="0"
              max="100"
              bind:value={botPercentInput}
              disabled={savingSettings}
              class="w-full rounded-xl px-3 min-h-[44px] outline-none font-mono"
              style="background: {$colorStore.primary}10; color: {$colorStore.text};
                     border: 1px solid {$colorStore.primary}30;"
            />
          </div>
        </div>

        <div class="mt-4">
          <label class="block text-sm font-medium mb-1" for="bh-channel" style="color: {$colorStore.muted}">
            Report channel ID
          </label>
          <input
            id="bh-channel"
            type="text"
            inputmode="numeric"
            bind:value={channelInput}
            disabled={savingSettings}
            placeholder="Leave empty to use the join/leave channel"
            class="w-full rounded-xl px-3 min-h-[44px] outline-none font-mono"
            style="background: {$colorStore.primary}10; color: {$colorStore.text};
                   border: 1px solid {$colorStore.primary}30;"
          />
          {#if settingsError}
            <p class="mt-2 text-xs" style="color: {$colorStore.accent}">{settingsError}</p>
          {:else if settings.effectiveChannelId === 0n}
            <p class="mt-2 text-xs" style="color: {$colorStore.accent}">
              No channel is set and there is no join/leave channel to fall back to, so join detections are not posted anywhere.
            </p>
          {:else if !settings.reachable}
            <p class="mt-2 text-xs" style="color: {$colorStore.accent}">
              The bot cannot see channel {settings.effectiveChannelId.toString()}, so join detections will not be posted.
            </p>
          {:else}
            <p class="mt-2 text-xs" style="color: {$colorStore.muted}">
              Join detections go to #{settings.channelName}
              {#if settings.guildName}in {settings.guildName}{/if}
              {#if settings.usingFallback}(from the join/leave channel, since no channel is set){/if}
            </p>
          {/if}
        </div>

        <div class="mt-4 flex justify-end">
          <button
            onclick={() => saveSettings(settings!.autoLeave)}
            disabled={savingSettings || !thresholdsDirty}
            class="rounded-xl px-4 min-h-[44px] font-medium disabled:opacity-40"
            style="background: {$colorStore.primary}20; color: {$colorStore.primary};
                   border: 1px solid {$colorStore.primary}30;"
          >
            {savingSettings ? "Saving..." : "Save thresholds"}
          </button>
        </div>
      </div>

      <div
        class="rounded-2xl border p-4 sm:p-5 mb-6"
        style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
               border-color: {$colorStore.primary}30;"
        in:fly={{ y: 20, duration: 300 }}
      >
        <h2 class="text-sm font-semibold mb-3" style="color: {$colorStore.text}">On join</h2>
        <ToggleRow
          checked={settings.autoLeave}
          colors={$colorStore}
          disabled={savingSettings}
          id="bh-auto-leave"
          subtitle="Every new server is checked after its member list downloads. Flagged ones are reported, and left when this is on."
          title="Leave flagged servers automatically"
          onchange={(checked) => saveSettings(checked)}
        />
      </div>
    {/if}
  {:else}
    <!-- Stats -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6" in:fly={{ y: 20, duration: 300 }}>
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

    {#if settings}
      <p class="text-xs mb-4" style="color: {$colorStore.muted}">
        Flagging servers with at least {settings.minMembers} members and
        {#if settings.botCount > 0 && settings.botPercent > 0}
          either {settings.botCount}+ bots or {settings.botPercent}%+ bots.
        {:else if settings.botCount > 0}
          {settings.botCount}+ bots.
        {:else if settings.botPercent > 0}
          {settings.botPercent}%+ bots.
        {:else}
          no thresholds set, so nothing is flagged.
        {/if}
        Counts come from the member cache, use Recheck for exact numbers on large servers.
      </p>
    {/if}

    <!-- Toolbar -->
    <div
      class="rounded-2xl border p-4 sm:p-5 mb-6 flex flex-col lg:flex-row lg:items-end gap-4"
      style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
             border-color: {$colorStore.primary}30;"
      in:fly={{ y: 20, duration: 300 }}
    >
      <div class="flex-1 min-w-0">
        <label class="block text-sm font-medium mb-1" for="bh-search" style="color: {$colorStore.muted}">
          Search
        </label>
        <input
          id="bh-search"
          type="search"
          bind:value={search}
          placeholder="Server name or ID"
          class="w-full rounded-xl px-3 min-h-[44px] outline-none"
          style="background: {$colorStore.primary}10; color: {$colorStore.text};
                 border: 1px solid {$colorStore.primary}30;"
        />
      </div>

      <div class="flex flex-wrap gap-2">
        <button
          onclick={() => (flaggedOnly = !flaggedOnly)}
          class="rounded-xl px-4 min-h-[44px] font-medium"
          style="background: {flaggedOnly ? $colorStore.accent : $colorStore.primary}20;
                 color: {flaggedOnly ? $colorStore.accent : $colorStore.text};
                 border: 1px solid {flaggedOnly ? $colorStore.accent : $colorStore.primary}30;"
        >
          {flaggedOnly ? "Flagged only" : "All servers"}
        </button>
        <button
          onclick={selectAllFlagged}
          disabled={flaggedCount === 0}
          class="rounded-xl px-4 min-h-[44px] font-medium disabled:opacity-40"
          style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        >
          Select all flagged
        </button>
        <button
          onclick={clearSelection}
          disabled={selected.size === 0}
          class="rounded-xl px-4 min-h-[44px] font-medium disabled:opacity-40"
          style="background: {$colorStore.primary}20; color: {$colorStore.text}; border: 1px solid {$colorStore.primary}30;"
        >
          Clear
        </button>
        <button
          onclick={() => requestLeave(selectedEntries)}
          disabled={selected.size === 0 || leaving}
          class="rounded-xl px-4 min-h-[44px] font-medium disabled:opacity-40"
          style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;"
        >
          <i class="fa-regular fa-right-from-bracket mr-2"></i>
          {leaving ? "Leaving..." : `Leave selected (${selected.size})`}
        </button>
        <button
          onclick={fetchServers}
          class="rounded-xl px-4 min-h-[44px] font-medium transition-all hover:translate-y-[-1px]"
          style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;"
        >
          <i class="fa-utility-duo fa-regular fa-arrows-rotate mr-2"
             style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary};"></i>
          Refresh
        </button>
      </div>
    </div>

    {#if lastResult}
      <div
        class="rounded-xl px-4 py-3 mb-4 text-sm"
        style="background: {$colorStore.primary}15; color: {$colorStore.text};"
        in:fade={{ duration: 200 }}
      >
        {lastResult}
      </div>
    {/if}

    {#if loading}
      <div class="space-y-2" aria-busy="true" aria-label="Loading servers">
        {#each Array(6) as _, i (i)}
          <SkeletonLoader type="feature" delay={i * 60} />
        {/each}
      </div>
    {:else if error}
      <div class="text-center py-12" style="color: {$colorStore.accent}">{error}</div>
    {:else if visible.length === 0}
      <div class="text-center py-12" style="color: {$colorStore.muted}">
        {flaggedOnly ? "No servers meet the thresholds." : "No servers match the search."}
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
              <th class="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onchange={toggleSelectAllVisible}
                  aria-label="Select every listed server"
                  class="h-4 w-4 accent-current"
                  style="color: {$colorStore.primary}"
                />
              </th>
              <th class="text-left font-semibold px-4 py-3" style="color: {$colorStore.text}">Server</th>
              <th class="text-right font-semibold px-4 py-3" style="color: {$colorStore.text}">Members</th>
              <th class="text-right font-semibold px-4 py-3" style="color: {$colorStore.text}">Humans</th>
              <th class="text-right font-semibold px-4 py-3" style="color: {$colorStore.text}">Bots</th>
              <th class="text-left font-semibold px-4 py-3" style="color: {$colorStore.text}">Trigger</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {#each visible as entry (entry.guildId.toString())}
              <tr style="border-top: 1px solid {$colorStore.primary}20;
                         background: {isSelected(entry) ? `${$colorStore.primary}0c` : "transparent"};">
                <td class="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isSelected(entry)}
                    onchange={() => toggleSelect(entry)}
                    aria-label={`Select ${entry.guildName}`}
                    class="h-4 w-4"
                  />
                </td>
                <td class="px-4 py-3" style="color: {$colorStore.text}">
                  <div class="flex items-center gap-3">
                    {#if entry.iconUrl}
                      <img src={entry.iconUrl} alt="" class="h-8 w-8 rounded-lg flex-shrink-0" loading="lazy" />
                    {:else}
                      <div class="h-8 w-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-semibold"
                           style="background: {$colorStore.primary}20; color: {$colorStore.primary}">
                        {entry.guildName.slice(0, 2).toUpperCase()}
                      </div>
                    {/if}
                    <div class="min-w-0">
                      <div class="font-medium truncate">{entry.guildName}</div>
                      <div class="text-xs mt-0.5 font-mono" style="color: {$colorStore.muted}">
                        {entry.guildId.toString()} &middot; joined {formatDate(entry.joinedAt)}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-4 py-3 text-right font-mono" style="color: {$colorStore.text}">{entry.total}</td>
                <td class="px-4 py-3 text-right font-mono" style="color: {$colorStore.text}">{entry.humans}</td>
                <td class="px-4 py-3 text-right font-mono" style="color: {entry.isBotHell ? $colorStore.accent : $colorStore.text}">
                  {entry.bots} <span class="text-xs" style="color: {$colorStore.muted}">({entry.percent}%)</span>
                  {#if !entry.complete}
                    <div class="text-xs font-sans" style="color: {$colorStore.muted}" title="Member cache is partial">partial</div>
                  {/if}
                </td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium"
                    style="background: {entry.isBotHell ? $colorStore.accent : $colorStore.secondary}20;
                           color: {entry.isBotHell ? $colorStore.accent : $colorStore.secondary};"
                  >
                    {triggerLabel(entry)}
                  </span>
                </td>
                <td class="px-4 py-3 text-right whitespace-nowrap">
                  <button
                    onclick={() => recheck(entry)}
                    disabled={checking.has(entry.guildId.toString())}
                    class="rounded-lg px-2 py-1 min-h-[36px] text-xs mr-2 disabled:opacity-40"
                    style="background: {$colorStore.primary}15; color: {$colorStore.text};"
                  >
                    {checking.has(entry.guildId.toString()) ? "Checking..." : "Recheck"}
                  </button>
                  <button
                    onclick={() => requestLeave([entry])}
                    disabled={leaving}
                    aria-label="Leave this server"
                    class="rounded-lg px-2 py-1 min-h-[36px] text-xs disabled:opacity-40"
                    style="background: {$colorStore.accent}15; color: {$colorStore.accent};"
                  >
                    <i class="fa-regular fa-right-from-bracket"></i>
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Mobile cards -->
      <div class="md:hidden space-y-3" in:fade={{ duration: 200 }}>
        {#each visible as entry (entry.guildId.toString())}
          <div
            class="rounded-2xl border p-4"
            style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                   border-color: {isSelected(entry) ? $colorStore.primary : `${$colorStore.primary}30`};"
          >
            <div class="flex items-center justify-between gap-2">
              <label class="flex items-center gap-2 text-sm font-medium min-w-0" style="color: {$colorStore.text}">
                <input type="checkbox" checked={isSelected(entry)} onchange={() => toggleSelect(entry)} class="h-4 w-4" />
                <span class="truncate">{entry.guildName}</span>
              </label>
              <span
                class="inline-flex items-center rounded-lg px-2 py-1 text-xs font-medium flex-shrink-0"
                style="background: {entry.isBotHell ? $colorStore.accent : $colorStore.secondary}20;
                       color: {entry.isBotHell ? $colorStore.accent : $colorStore.secondary};"
              >
                {triggerLabel(entry)}
              </span>
            </div>
            <div class="mt-1 text-xs font-mono" style="color: {$colorStore.muted}">{entry.guildId.toString()}</div>
            <div class="mt-2 text-sm" style="color: {$colorStore.text}">
              {entry.total} members &middot; {entry.humans} humans &middot;
              <span style="color: {entry.isBotHell ? $colorStore.accent : $colorStore.text}">{entry.bots} bots ({entry.percent}%)</span>
              {#if !entry.complete}<span style="color: {$colorStore.muted}"> &middot; partial</span>{/if}
            </div>
            <div class="mt-3 grid grid-cols-2 gap-2">
              <button
                onclick={() => recheck(entry)}
                disabled={checking.has(entry.guildId.toString())}
                class="rounded-xl px-3 min-h-[44px] text-sm font-medium disabled:opacity-40"
                style="background: {$colorStore.primary}15; color: {$colorStore.text};"
              >
                {checking.has(entry.guildId.toString()) ? "Checking..." : "Recheck"}
              </button>
              <button
                onclick={() => requestLeave([entry])}
                disabled={leaving}
                class="rounded-xl px-3 min-h-[44px] text-sm font-medium disabled:opacity-40"
                style="background: {$colorStore.accent}15; color: {$colorStore.accent};"
              >
                Leave
              </button>
            </div>
          </div>
        {/each}
      </div>

      <p class="text-sm mt-4" style="color: {$colorStore.muted}">
        Showing {visible.length} of {entries.length} servers
      </p>
    {/if}
  {/if}
</DashboardPageLayout>

<ConfirmationModal
  bind:isOpen={confirmLeaveOpen}
  title={leaveTargets.length === 1 ? "Leave server" : `Leave ${leaveTargets.length} servers`}
  message={leaveTargets.length === 1
    ? `Leave ${leaveTargets[0]?.guildName ?? "this server"}? The bot will have to be re-invited to come back.`
    : `Leave ${leaveTargets.length} servers? The bot will have to be re-invited to come back to any of them.`}
  confirmText="Leave"
  variant="danger"
  onconfirm={confirmLeave}
  oncancel={() => (leaveTargets = [])}
/>
