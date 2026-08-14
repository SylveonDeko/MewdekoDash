<!-- routes/dashboard/currency/+page.svelte -->
<script lang="ts">
  import { onDestroy } from "svelte";
  import { fade, fly } from "svelte/transition";
  import {
    CategoryScale,
    Chart,
    Filler,
    Legend,
    LinearScale,
    LineController,
    LineElement,
    PointElement,
    Tooltip,
  } from "chart.js";
  import { colorStore } from "$lib/stores/colorStore";
  import { currentGuild } from "$lib/stores/currentGuild";
  import { clientApi, currencyApi } from "$lib/api/index.ts";
  import { ShopItemType } from "$lib/api/currency/models";
  import type {
    EconomyAnalytics,
    EconomyConfig,
    LeaderboardEntry,
    ShopItem,
    ShopItemRequest,
  } from "$lib/api/currency/models";
  import { logger } from "$lib/logger";

  import StatCard from "$lib/components/monitoring/StatCard.svelte";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";
  import DashboardPageLayout from "$lib/components/layout/DashboardPageLayout.svelte";

  Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip, Legend);

  let loading = $state(false);
  let saving = $state(false);
  let message = $state("");
  let messageType: "success" | "error" | "info" = $state("info");

  let analytics = $state<EconomyAnalytics | null>(null);
  let config = $state<EconomyConfig | null>(null);
  let shopItems = $state<ShopItem[]>([]);
  let leaderboard = $state<LeaderboardEntry[]>([]);
  let leaderboardTotal = $state(0);
  let guildRoles = $state<Array<{ id: string; name: string; color: number }>>([]);
  let guildMembers = $state<Array<{ id: string; name: string }>>([]);

  let activeTab = $state("analytics");
  let windowDays = $state(30);
  let leaderboardPage = $state(0);
  const leaderboardPageSize = 25;

  let showShopEditor = $state(false);
  let editingName = $state<string | null>(null);
  let shopForm = $state<ShopItemRequest>(blankShopItem());

  let adjustUserId = $state<string | null>(null);
  let adjustAmount = $state(0);
  let adjustReason = $state("");

  let supplyCanvas = $state<HTMLCanvasElement | null>(null);
  let supplyChart: Chart | null = null;

  const itemTypeOptions = [
    { id: ShopItemType.Role.toString(), name: "Role", label: "Role (grants a Discord role)" },
    { id: ShopItemType.Collectible.toString(), name: "Collectible", label: "Collectible (inventory only)" },
    { id: ShopItemType.Text.toString(), name: "Text", label: "Text (DMs the buyer some content)" },
  ];

  function blankShopItem(): ShopItemRequest {
    return {
      name: "",
      description: "",
      price: 100,
      itemType: ShopItemType.Collectible,
      roleId: null,
      textContent: "",
      stock: -1,
      maxPerUser: 0,
      requiredRoleId: null,
      consumable: false,
      enabled: true,
      sortOrder: 0,
    };
  }

  function notify(text: string, type: "success" | "error" | "info" = "success") {
    message = text;
    messageType = type;
    setTimeout(() => (message = ""), 5000);
  }

  function formatNumber(value: number | null | undefined): string {
    return (value ?? 0).toLocaleString();
  }

  function formatSigned(value: number): string {
    return `${value > 0 ? "+" : ""}${value.toLocaleString()}`;
  }

  function formatPercent(value: number, digits = 1): string {
    return `${(value * 100).toFixed(digits)}%`;
  }

  function formatDuration(seconds: number): string {
    if (seconds <= 0) return "none";
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${(seconds / 3600).toFixed(seconds % 3600 === 0 ? 0 : 1)}h`;
  }

  /**
   * Faucets and sinks are the same shape with opposite signs, so the split is by
   * net rather than by category name. Anything net-zero counts as a sink so it
   * does not read as free currency.
   */
  let faucets = $derived((analytics?.flow ?? []).filter((f) => f.net > 0));
  let sinks = $derived((analytics?.flow ?? []).filter((f) => f.net <= 0));
  let largestFlow = $derived(
    Math.max(1, ...(analytics?.flow ?? []).map((f) => Math.abs(f.net))),
  );

  async function loadAll() {
    if (!$currentGuild?.id) return;

    loading = true;
    try {
      const [analyticsData, configData, shopData, leaderboardData, rolesData, membersData] = await Promise.all([
        currencyApi.getAnalytics($currentGuild.id, windowDays).catch(() => null),
        currencyApi.getConfig($currentGuild.id).catch(() => null),
        currencyApi.getShop($currentGuild.id).catch(() => []),
        currencyApi.getLeaderboard($currentGuild.id, leaderboardPage, leaderboardPageSize).catch(() => null),
        clientApi.getRoles($currentGuild.id).catch(() => []),
        clientApi.getMembers($currentGuild.id).catch(() => []),
      ]);

      analytics = analyticsData;
      config = configData;
      shopItems = shopData ?? [];
      leaderboard = leaderboardData?.entries ?? [];
      leaderboardTotal = leaderboardData?.total ?? 0;

      guildRoles = (rolesData || [])
        .filter((role: any) => role.id !== $currentGuild?.id?.toString() && !role.managed && !role.name.startsWith("@"))
        .map((role: any) => ({ id: role.id.toString(), name: role.name, color: role.color || 0 }))
        .sort((a, b) => a.name.localeCompare(b.name));

      guildMembers = (membersData || [])
        .map((member: any) => ({ id: member.id.toString(), name: member.username ?? member.id.toString() }))
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      logger.error("Failed to load currency data", err);
      notify("Failed to load economy data", "error");
    } finally {
      loading = false;
    }
  }

  async function reloadAnalytics() {
    if (!$currentGuild?.id) return;

    loading = true;
    try {
      analytics = await currencyApi.getAnalytics($currentGuild.id, windowDays);
    } catch (err) {
      logger.error("Failed to load analytics", err);
      notify("Failed to load analytics", "error");
    } finally {
      loading = false;
    }
  }

  async function loadLeaderboardPage(page: number) {
    if (!$currentGuild?.id) return;

    leaderboardPage = Math.max(0, page);
    try {
      const data = await currencyApi.getLeaderboard($currentGuild.id, leaderboardPage, leaderboardPageSize);
      leaderboard = data.entries;
      leaderboardTotal = data.total;
    } catch (err) {
      logger.error("Failed to load leaderboard", err);
      notify("Failed to load leaderboard", "error");
    }
  }

  async function saveConfig() {
    if (!$currentGuild?.id || !config) return;

    saving = true;
    try {
      const { id, guildId, ...changes } = config;
      config = await currencyApi.updateConfig($currentGuild.id, changes);
      notify("Economy settings saved");
    } catch (err) {
      logger.error("Failed to save economy config", err);
      notify("Failed to save settings", "error");
    } finally {
      saving = false;
    }
  }

  async function resetConfig() {
    if (!$currentGuild?.id) return;
    if (!confirm("Reset every economy setting to its default?")) return;

    saving = true;
    try {
      config = await currencyApi.resetConfig($currentGuild.id);
      notify("Economy settings reset to defaults");
    } catch (err) {
      logger.error("Failed to reset economy config", err);
      notify("Failed to reset settings", "error");
    } finally {
      saving = false;
    }
  }

  function openShopEditor(item: ShopItem | null) {
    if (item) {
      editingName = item.name;
      shopForm = {
        name: item.name,
        description: item.description ?? "",
        price: item.price,
        itemType: item.itemType,
        roleId: item.roleId,
        textContent: item.textContent ?? "",
        stock: item.stock,
        maxPerUser: item.maxPerUser,
        requiredRoleId: item.requiredRoleId,
        consumable: item.consumable,
        enabled: item.enabled,
        sortOrder: item.sortOrder,
      };
    } else {
      editingName = null;
      shopForm = blankShopItem();
    }

    showShopEditor = true;
  }

  async function saveShopItem() {
    if (!$currentGuild?.id) return;

    if (!shopForm.name.trim()) {
      notify("The item needs a name", "error");
      return;
    }

    if (shopForm.itemType === ShopItemType.Role && !shopForm.roleId) {
      notify("Role items need a role to grant", "error");
      return;
    }

    saving = true;
    try {
      if (editingName) {
        await currencyApi.updateShopItem($currentGuild.id, editingName, shopForm);
        notify(`Updated ${shopForm.name}`);
      } else {
        await currencyApi.createShopItem($currentGuild.id, shopForm);
        notify(`Added ${shopForm.name} to the shop`);
      }

      showShopEditor = false;
      shopItems = await currencyApi.getShop($currentGuild.id);
    } catch (err: any) {
      logger.error("Failed to save shop item", err);
      notify(err?.message ?? "Failed to save item", "error");
    } finally {
      saving = false;
    }
  }

  async function deleteShopItem(item: ShopItem) {
    if (!$currentGuild?.id) return;
    if (!confirm(`Delete "${item.name}"? Everyone who owns one loses it.`)) return;

    try {
      await currencyApi.deleteShopItem($currentGuild.id, item.name);
      shopItems = shopItems.filter((x) => x.id !== item.id);
      notify(`Deleted ${item.name}`);
    } catch (err) {
      logger.error("Failed to delete shop item", err);
      notify("Failed to delete item", "error");
    }
  }

  async function toggleShopItem(item: ShopItem) {
    if (!$currentGuild?.id) return;

    try {
      await currencyApi.updateShopItem($currentGuild.id, item.name, {
        name: item.name,
        description: item.description,
        price: item.price,
        itemType: item.itemType,
        roleId: item.roleId,
        textContent: item.textContent,
        stock: item.stock,
        maxPerUser: item.maxPerUser,
        requiredRoleId: item.requiredRoleId,
        consumable: item.consumable,
        enabled: !item.enabled,
        sortOrder: item.sortOrder,
      });

      shopItems = await currencyApi.getShop($currentGuild.id);
    } catch (err) {
      logger.error("Failed to toggle shop item", err);
      notify("Failed to update item", "error");
    }
  }

  async function adjustBalance() {
    if (!$currentGuild?.id) return;

    if (!adjustUserId) {
      notify("Pick a member first", "error");
      return;
    }

    const userId = BigInt(adjustUserId);

    if (!adjustAmount) {
      notify("Enter a non-zero amount", "error");
      return;
    }

    saving = true;
    try {
      const result = await currencyApi.adjustBalance($currentGuild.id, {
        userId,
        amount: adjustAmount,
        reason: adjustReason || null,
      });

      notify(`Adjusted. Wallet is now ${formatNumber(result.wallet)}.`);
      adjustUserId = null;
      adjustAmount = 0;
      adjustReason = "";
      await loadLeaderboardPage(leaderboardPage);
    } catch (err) {
      logger.error("Failed to adjust balance", err);
      notify("Failed to adjust balance", "error");
    } finally {
      saving = false;
    }
  }

  /**
   * Draws the supply history. Rebuilt rather than updated in place because the
   * dataset is small and the window can change its length entirely.
   */
  function renderSupplyChart() {
    if (!supplyCanvas || !analytics) return;

    supplyChart?.destroy();

    const points = analytics.supplyHistory;
    let running = 0;
    const cumulative = points.map((p) => (running += p.net));

    // A line needs two points to draw a segment, so a window with activity on a single day
    // would otherwise render an empty chart that still answers tooltips. Show the markers
    // themselves whenever there is too little data to form a visible line.
    const sparse = points.length < 3;

    supplyChart = new Chart(supplyCanvas, {
      type: "line",
      data: {
        labels: points.map((p) => new Date(p.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })),
        datasets: [
          {
            label: "Cumulative change",
            data: cumulative,
            borderColor: $colorStore.primary,
            backgroundColor: `${$colorStore.primary}20`,
            fill: true,
            tension: 0.3,
            pointRadius: sparse ? 5 : 0,
            pointHoverRadius: sparse ? 7 : 4,
            pointBackgroundColor: $colorStore.primary,
            borderWidth: 2,
          },
          {
            label: "Daily net",
            data: points.map((p) => p.net),
            borderColor: $colorStore.accent,
            backgroundColor: "transparent",
            fill: false,
            tension: 0.3,
            pointRadius: sparse ? 5 : 0,
            pointHoverRadius: sparse ? 7 : 4,
            pointBackgroundColor: $colorStore.accent,
            borderWidth: 1,
            borderDash: [4, 4],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { labels: { color: $colorStore.text } },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: ${formatSigned(Number(ctx.parsed.y))}`,
            },
          },
        },
        scales: {
          x: { ticks: { color: $colorStore.muted }, grid: { color: `${$colorStore.muted}20` } },
          y: { ticks: { color: $colorStore.muted }, grid: { color: `${$colorStore.muted}20` } },
        },
      },
    });
  }

  $effect(() => {
    if ($currentGuild?.id) {
      loadAll();
    }
  });

  $effect(() => {
    if (activeTab === "analytics" && supplyCanvas && analytics) {
      renderSupplyChart();
    }
  });

  onDestroy(() => supplyChart?.destroy());

  const tabs = [
    { id: "analytics", label: "Analytics", icon: "fa-chart-line" },
    { id: "config", label: "Configuration", icon: "fa-gear" },
    { id: "shop", label: "Shop", icon: "fa-bag-shopping" },
    { id: "leaderboard", label: "Leaderboard", icon: "fa-ranking-star" },
  ];

  let actionButtons = $derived([
    {
      label: "Refresh",
      icon: "fa-arrows-rotate",
      action: loadAll,
      loading: loading,
    },
  ]);
</script>

{#snippet statusMessages()}
  {#if message}
    <div class="mb-6 p-4 rounded-xl flex items-center gap-3 transition-all"
         style="background: {messageType === 'error' ? $colorStore.accent + '20' : $colorStore.primary + '20'};
          border: 1px solid {messageType === 'error' ? $colorStore.accent : $colorStore.primary}30;"
         in:fly={{ x: 20, duration: 300 }}>
      {#if messageType === 'success'}
        <i class="fa-utility-duo fa-regular fa-circle-check"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
      {:else if messageType === 'error'}
        <i class="fa-utility-duo fa-regular fa-circle-exclamation"
           style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
      {:else}
        <i class="fa-utility-duo fa-regular fa-bell"
           style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
      {/if}
      <span style="color: {messageType === 'error' ? $colorStore.accent : $colorStore.primary}">{message}</span>
    </div>
  {/if}
{/snippet}

{#snippet switchControl(label: string, value: boolean, onToggle: () => void)}
  <button aria-label={label} aria-pressed={value} onclick={onToggle}
          class="relative inline-flex items-center h-6 rounded-full w-11 transition-colors shrink-0"
          style="background: {value ? $colorStore.primary : $colorStore.muted};">
    <span class="inline-block w-4 h-4 transform transition-transform bg-white rounded-full"
          style="transform: translateX({value ? '1.5rem' : '0.25rem'})"></span>
  </button>
{/snippet}

{#snippet switchRow(label: string, description: string, value: boolean, onToggle: () => void)}
  <div class="flex items-center justify-between gap-4 p-4 rounded-xl"
       style="background: {$colorStore.primary}08;">
    <div>
      <div class="font-medium mb-1" style="color: {$colorStore.text}">{label}</div>
      {#if description}
        <div class="text-sm" style="color: {$colorStore.muted}">{description}</div>
      {/if}
    </div>
    {@render switchControl(label, value, onToggle)}
  </div>
{/snippet}

<DashboardPageLayout
  {actionButtons}
  bind:activeTab
  guildName={$currentGuild?.name || "Dashboard"}
  icon="fa-money-bill"
  statusMessages={statusMessages}
  subtitle="Money supply, payout rates, shop and balances"
  {tabs}
  title="Currency & Economy"
>

  {#if activeTab === 'analytics'}
    <div class="w-full space-y-6 md:space-y-8" in:fade={{ duration: 200 }}>

      <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <span id="window-label" class="text-sm font-medium shrink-0" style="color: {$colorStore.muted}">Window</span>
        <div class="grid grid-cols-4 gap-2 sm:flex sm:gap-3" role="radiogroup" aria-labelledby="window-label">
          {#each [{ days: 7, short: "7d", long: "7 days" }, { days: 30, short: "30d", long: "30 days" }, { days: 90, short: "90d", long: "90 days" }, { days: 365, short: "1y", long: "1 year" }] as option}
            <button
              onclick={() => { windowDays = option.days; reloadAnalytics(); }}
              role="radio"
              aria-checked={windowDays === option.days}
              aria-label={option.long}
              class="px-2 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all min-h-[44px] whitespace-nowrap"
              style="background: {windowDays === option.days ? $colorStore.primary + '20' : 'transparent'};
                     color: {windowDays === option.days ? $colorStore.primary : $colorStore.muted};
                     border: 1px solid {windowDays === option.days ? $colorStore.primary + '40' : $colorStore.primary + '20'};"
            >
              <span class="sm:hidden">{option.short}</span>
              <span class="hidden sm:inline">{option.long}</span>
            </button>
          {/each}
        </div>
      </div>

      {#if analytics && analytics.snapshot.holders > 0}
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div class="rounded-2xl border p-3 sm:p-4"
               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
            <StatCard
              icon="fa-circle-dollar"
              label="Money Supply"
              value={formatNumber(analytics.snapshot.moneySupply)}
              subtitle="{formatNumber(analytics.snapshot.holders)} holders"
              iconColor="primary"
            />
          </div>
          <div class="rounded-2xl border p-3 sm:p-4"
               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
            <StatCard
              icon="fa-chart-simple"
              label="Net Change"
              value={formatSigned(analytics.snapshot.netChange)}
              subtitle="over {analytics.windowDays} days"
              iconColor={analytics.snapshot.netChange >= 0 ? "accent" : "secondary"}
              trend={analytics.snapshot.netChange > 0 ? "up" : analytics.snapshot.netChange < 0 ? "down" : "neutral"}
            />
          </div>
          <div class="rounded-2xl border p-3 sm:p-4"
               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
            <StatCard
              icon="fa-chart-pie"
              label="Gini"
              value={analytics.snapshot.gini.toFixed(3)}
              subtitle="top 10% hold {formatPercent(analytics.snapshot.topTenPercentShare)}"
              iconColor="secondary"
            />
          </div>
          <div class="rounded-2xl border p-3 sm:p-4"
               style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;">
            <StatCard
              icon="fa-credit-card"
              label="Median Holding"
              value={formatNumber(analytics.snapshot.median)}
              subtitle="mean {formatNumber(analytics.snapshot.mean)}"
              iconColor="primary"
            />
          </div>
        </div>

        <!-- Supply over time -->
        <div class="rounded-2xl border p-6 md:p-8 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                    border-color: {$colorStore.primary}30;">
          <div class="flex items-center gap-3 mb-2">
            <i class="fa-utility-duo fa-regular fa-clock"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Money supply over time</h2>
          </div>
          <p class="text-sm mb-6" style="color: {$colorStore.muted}">
            Currency created minus currency destroyed. A line that only climbs means your faucets outpace your sinks.
          </p>

          {#if analytics.supplyHistory.length > 0}
            <div class="h-64 md:h-80">
              <canvas bind:this={supplyCanvas}></canvas>
            </div>
          {:else}
            <p class="text-center py-12" style="color: {$colorStore.muted}">No ledger activity in this window.</p>
          {/if}
        </div>

        <!-- Wallet vs bank -->
        <div class="rounded-2xl border p-6 md:p-8 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                    border-color: {$colorStore.primary}30;">
          <h2 class="text-xl font-bold mb-4" style="color: {$colorStore.text}">Where the money sits</h2>
          <div class="flex h-8 rounded-full overflow-hidden mb-3" style="background: {$colorStore.primary}10;">
            {#if analytics.snapshot.moneySupply > 0}
              <div style="width: {(analytics.snapshot.inWallets / analytics.snapshot.moneySupply) * 100}%; background: {$colorStore.primary};"></div>
              <div style="width: {(analytics.snapshot.inBanks / analytics.snapshot.moneySupply) * 100}%; background: {$colorStore.secondary};"></div>
            {/if}
          </div>
          <div class="flex flex-wrap gap-6 text-sm">
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" style="background: {$colorStore.primary}"></span>
              <span style="color: {$colorStore.text}">Wallets {formatNumber(analytics.snapshot.inWallets)}</span>
              <span style="color: {$colorStore.muted}">(robbable, spendable)</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-3 h-3 rounded-full" style="background: {$colorStore.secondary}"></span>
              <span style="color: {$colorStore.text}">Banked {formatNumber(analytics.snapshot.inBanks)}</span>
              <span style="color: {$colorStore.muted}">(safe, idle)</span>
            </div>
          </div>
        </div>

        <!-- Faucets and sinks -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {#each [{ title: "Faucets", note: "currency entering circulation", data: faucets, color: $colorStore.primary }, { title: "Sinks", note: "currency leaving circulation", data: sinks, color: $colorStore.accent }] as panel}
            <div class="rounded-2xl border p-6 shadow-2xl"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                        border-color: {$colorStore.primary}30;">
              <h3 class="text-lg font-bold" style="color: {$colorStore.text}">{panel.title}</h3>
              <p class="text-sm mb-4" style="color: {$colorStore.muted}">{panel.note}</p>

              {#if panel.data.length === 0}
                <p class="text-sm py-6 text-center" style="color: {$colorStore.muted}">Nothing recorded.</p>
              {:else}
                <div class="space-y-3">
                  {#each panel.data as bucket}
                    <div>
                      <div class="flex justify-between text-sm mb-1">
                        <span style="color: {$colorStore.text}">{bucket.category}</span>
                        <span style="color: {panel.color}">{formatSigned(bucket.net)}</span>
                      </div>
                      <div class="h-2 rounded-full overflow-hidden" style="background: {$colorStore.primary}10;">
                        <div class="h-full rounded-full"
                             style="width: {(Math.abs(bucket.net) / largestFlow) * 100}%; background: {panel.color};"></div>
                      </div>
                      <div class="text-xs mt-1" style="color: {$colorStore.muted}">
                        {formatNumber(bucket.entries)} entries
                      </div>
                    </div>
                  {/each}
                </div>
              {/if}
            </div>
          {/each}
        </div>

        {#if analytics.transferTax > 0}
          <div class="rounded-xl p-4 text-sm" style="background: {$colorStore.primary}08; color: {$colorStore.muted};">
            <strong style="color: {$colorStore.text}">{formatNumber(analytics.transferTax)}</strong>
            was destroyed as transfer tax over this window. Tax has no ledger row of its own, so it is derived from the
            gap between what senders paid and what recipients received.
          </div>
        {/if}

        <!-- Game performance -->
        <div class="rounded-2xl border p-6 md:p-8 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                    border-color: {$colorStore.primary}30;">
          <div class="flex items-center gap-3 mb-2">
            <i class="fa-utility-duo fa-regular fa-gamepad-modern"
               style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 20px;"></i>
            <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Game performance</h2>
          </div>
          <p class="text-sm mb-6" style="color: {$colorStore.muted}">
            RTP is what players actually got back per unit wagered. Above 100% means the game is printing currency and
            wants its payout multiplier lowered.
          </p>

          {#if analytics.games.length === 0}
            <p class="text-center py-8" style="color: {$colorStore.muted}">No games played in this window.</p>
          {:else}
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                <tr style="color: {$colorStore.muted}">
                  <th class="text-left py-2 px-3">Game</th>
                  <th class="text-right py-2 px-3">RTP</th>
                  <th class="text-right py-2 px-3">Wagered</th>
                  <th class="text-right py-2 px-3">Returned</th>
                  <th class="text-right py-2 px-3">House</th>
                  <th class="text-right py-2 px-3">Plays</th>
                  <th class="text-right py-2 px-3">Players</th>
                </tr>
                </thead>
                <tbody>
                {#each analytics.games as game}
                  <tr style="border-top: 1px solid {$colorStore.primary}15;">
                    <td class="py-2 px-3 font-medium" style="color: {$colorStore.text}">{game.game}</td>
                    <td class="py-2 px-3 text-right font-bold"
                        style="color: {game.actualRtp > 1 ? '#ef4444' : game.actualRtp > 0.97 ? '#f59e0b' : '#10b981'}">
                      {formatPercent(game.actualRtp)}
                    </td>
                    <td class="py-2 px-3 text-right" style="color: {$colorStore.text}">{formatNumber(game.wagered)}</td>
                    <td class="py-2 px-3 text-right" style="color: {$colorStore.text}">{formatNumber(game.returned)}</td>
                    <td class="py-2 px-3 text-right"
                        style="color: {game.houseTake >= 0 ? $colorStore.text : '#ef4444'}">
                      {formatSigned(game.houseTake)}
                    </td>
                    <td class="py-2 px-3 text-right" style="color: {$colorStore.muted}">{formatNumber(game.plays)}</td>
                    <td class="py-2 px-3 text-right" style="color: {$colorStore.muted}">{formatNumber(game.players)}</td>
                  </tr>
                {/each}
                </tbody>
              </table>
            </div>
          {/if}
        </div>
      {:else if !loading}
        <div class="rounded-2xl border p-12 text-center"
             style="border-color: {$colorStore.primary}30; color: {$colorStore.muted};">
          Nobody on this server holds any currency yet.
        </div>
      {/if}
    </div>
  {/if}

  {#if activeTab === 'config'}
    <div class="w-full space-y-6 md:space-y-8" in:fade={{ duration: 200 }}>
      {#if config}
        {#snippet toggle(label: string, description: string, value: boolean, onToggle: () => void)}
          <div class="md:col-span-2 lg:col-span-3">
            {@render switchRow(label, description, value, onToggle)}
          </div>
        {/snippet}

        {#snippet numberField(label: string, hint: string, value: number, onInput: (v: number) => void, min = 0)}
          <div>
            <label for="cfg-{label.replace(/\W+/g, '-').toLowerCase()}" class="block text-sm font-medium mb-2"
                   style="color: {$colorStore.text}">{label}</label>
            <input id="cfg-{label.replace(/\W+/g, '-').toLowerCase()}" type="number" min={min} value={value}
                   oninput={(e) => onInput(Number((e.currentTarget as HTMLInputElement).value))}
                   class="w-full p-3 rounded-xl border transition-all min-h-[44px] text-base"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
            {#if hint}
              <p class="text-xs mt-1" style="color: {$colorStore.muted}">{hint}</p>
            {/if}
          </div>
        {/snippet}

        <!-- Betting -->
        <div class="rounded-2xl border p-6 md:p-8 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                    border-color: {$colorStore.primary}30;">
          <h2 class="text-xl font-bold mb-6" style="color: {$colorStore.text}">Betting</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {@render toggle("Enable gambling", "Turns every wagering game on or off", config.gamblingEnabled, () => (config!.gamblingEnabled = !config!.gamblingEnabled))}
            {@render numberField("Minimum bet", "", config.minBet, (v) => (config!.minBet = v), 1)}
            {@render numberField("Maximum bet", "0 for unlimited. A ceiling stops one lucky run ending the economy.", config.maxBet, (v) => (config!.maxBet = v))}
            {@render numberField("Payout multiplier", "Scales winnings only, never the returned stake. Below 1.0 widens the house edge.", config.payoutMultiplier, (v) => (config!.payoutMultiplier = v))}
            {@render numberField("Game cooldown (seconds)", formatDuration(config.gameCooldownSeconds), config.gameCooldownSeconds, (v) => (config!.gameCooldownSeconds = v))}
            {@render numberField("Daily loss limit", "0 to disable. Cuts a user off after losing this much in 24h.", config.lossLimitPerDay, (v) => (config!.lossLimitPerDay = v))}
          </div>
        </div>

        <!-- Earning -->
        <div class="rounded-2xl border p-6 md:p-8 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                    border-color: {$colorStore.primary}30;">
          <h2 class="text-xl font-bold mb-6" style="color: {$colorStore.text}">Earning</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {@render toggle("Enable work", "The low-risk, steady earning command", config.workEnabled, () => (config!.workEnabled = !config!.workEnabled))}
            {@render numberField("Work minimum", "", config.workMinReward, (v) => (config!.workMinReward = v))}
            {@render numberField("Work maximum", "", config.workMaxReward, (v) => (config!.workMaxReward = v))}
            {@render numberField("Work cooldown (seconds)", formatDuration(config.workCooldownSeconds), config.workCooldownSeconds, (v) => (config!.workCooldownSeconds = v))}
            {@render toggle("Enable crime", "Pays better than work but fails often enough to stay behind it on average", config.crimeEnabled, () => (config!.crimeEnabled = !config!.crimeEnabled))}
            {@render numberField("Crime minimum", "", config.crimeMinReward, (v) => (config!.crimeMinReward = v))}
            {@render numberField("Crime maximum", "", config.crimeMaxReward, (v) => (config!.crimeMaxReward = v))}
            {@render numberField("Crime success chance (%)", "", config.crimeSuccessChance, (v) => (config!.crimeSuccessChance = v))}
            {@render numberField("Crime fine minimum", "", config.crimeFineMin, (v) => (config!.crimeFineMin = v))}
            {@render numberField("Crime fine maximum", "", config.crimeFineMax, (v) => (config!.crimeFineMax = v))}
            {@render numberField("Crime cooldown (seconds)", formatDuration(config.crimeCooldownSeconds), config.crimeCooldownSeconds, (v) => (config!.crimeCooldownSeconds = v))}
          </div>
        </div>

        <!-- Bank -->
        <div class="rounded-2xl border p-6 md:p-8 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                    border-color: {$colorStore.primary}30;">
          <h2 class="text-xl font-bold mb-1" style="color: {$colorStore.text}">Bank</h2>
          <p class="text-sm mb-6" style="color: {$colorStore.muted}">
            Banked currency cannot be robbed. Interest is a faucet, so it is off by default.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {@render toggle("Enable bank", "Lets users move currency out of reach of robbery", config.bankEnabled, () => (config!.bankEnabled = !config!.bankEnabled))}
            {@render numberField("Bank capacity", "0 for unlimited", config.bankCapacity, (v) => (config!.bankCapacity = v))}
            {@render numberField("Interest (%)", "Paid per interval on the banked balance", config.bankInterestPercent, (v) => (config!.bankInterestPercent = v))}
            {@render numberField("Interest interval (hours)", "", config.bankInterestHours, (v) => (config!.bankInterestHours = v), 1)}
          </div>
        </div>

        <!-- Transfers -->
        <div class="rounded-2xl border p-6 md:p-8 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                    border-color: {$colorStore.primary}30;">
          <h2 class="text-xl font-bold mb-1" style="color: {$colorStore.text}">Transfers</h2>
          <p class="text-sm mb-6" style="color: {$colorStore.muted}">
            Transfer tax is a sink: the taxed portion is destroyed rather than moved.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {@render toggle("Enable transfers", "Lets users pay each other", config.payEnabled, () => (config!.payEnabled = !config!.payEnabled))}
            {@render numberField("Transfer tax (%)", "", config.payTaxPercent, (v) => (config!.payTaxPercent = v))}
            {@render numberField("Transfer cooldown (seconds)", formatDuration(config.payCooldownSeconds), config.payCooldownSeconds, (v) => (config!.payCooldownSeconds = v))}
            {@render numberField("Minimum transfer", "", config.payMinimum, (v) => (config!.payMinimum = v), 1)}
          </div>
        </div>

        <!-- Robbery -->
        <div class="rounded-2xl border p-6 md:p-8 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                    border-color: {$colorStore.primary}30;">
          <h2 class="text-xl font-bold mb-1" style="color: {$colorStore.text}">Robbery</h2>
          <p class="text-sm mb-6" style="color: {$colorStore.muted}">
            Off by default because it is disruptive in servers that did not opt into it. Only wallets can be robbed.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {@render toggle("Enable robbery", "Lets users steal from each other's wallets", config.robEnabled, () => (config!.robEnabled = !config!.robEnabled))}
            {@render numberField("Success chance (%)", "", config.robSuccessChance, (v) => (config!.robSuccessChance = v))}
            {@render numberField("Maximum steal (%)", "Share of the target's wallet a success takes", config.robMaxStealPercent, (v) => (config!.robMaxStealPercent = v), 1)}
            {@render numberField("Failure fine (%)", "Share of the robber's wallet destroyed on failure", config.robFinePercent, (v) => (config!.robFinePercent = v))}
            {@render numberField("Protected below", "Targets holding less than this cannot be robbed", config.robMinimumWallet, (v) => (config!.robMinimumWallet = v))}
            {@render numberField("Robbery cooldown (seconds)", formatDuration(config.robCooldownSeconds), config.robCooldownSeconds, (v) => (config!.robCooldownSeconds = v))}
          </div>
        </div>

        <!-- Daily -->
        <div class="rounded-2xl border p-6 md:p-8 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                    border-color: {$colorStore.primary}30;">
          <h2 class="text-xl font-bold mb-6" style="color: {$colorStore.text}">Daily reward streaks</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {@render toggle("Enable streaks", "Consecutive daily claims earn an escalating bonus", config.dailyStreakEnabled, () => (config!.dailyStreakEnabled = !config!.dailyStreakEnabled))}
            {@render numberField("Bonus per day", "Added per consecutive day claimed", config.dailyStreakBonus, (v) => (config!.dailyStreakBonus = v))}
            {@render numberField("Maximum bonus", "0 for uncapped", config.dailyStreakMaxBonus, (v) => (config!.dailyStreakMaxBonus = v))}
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <button onclick={saveConfig} disabled={saving}
                  class="px-6 py-3 rounded-xl font-medium transition-all min-h-[44px] disabled:opacity-50"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
            {saving ? "Saving..." : "Save settings"}
          </button>
          <button onclick={resetConfig} disabled={saving}
                  class="px-6 py-3 rounded-xl font-medium transition-all min-h-[44px] disabled:opacity-50"
                  style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;">
            Reset to defaults
          </button>
        </div>
      {:else if !loading}
        <p class="text-center py-12" style="color: {$colorStore.muted}">Could not load economy settings.</p>
      {/if}
    </div>
  {/if}

  {#if activeTab === 'shop'}
    <div class="w-full space-y-6" in:fade={{ duration: 200 }}>
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-xl font-bold" style="color: {$colorStore.text}">Shop items</h2>
          <p class="text-sm" style="color: {$colorStore.muted}">
            The shop is the economy's main sink. Without one, balances only ever accumulate.
          </p>
        </div>
        <button onclick={() => openShopEditor(null)}
                class="px-6 py-3 rounded-xl font-medium transition-all min-h-[44px]"
                style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
          Add item
        </button>
      </div>

      {#if shopItems.length === 0}
        <div class="rounded-2xl border p-12 text-center"
             style="border-color: {$colorStore.primary}30; color: {$colorStore.muted};">
          No shop items yet. Add one to give currency somewhere to go.
        </div>
      {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {#each shopItems as item}
            <div class="rounded-2xl border p-5 shadow-xl transition-all"
                 style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
                        border-color: {$colorStore.primary}30; opacity: {item.enabled ? 1 : 0.55};">
              <div class="flex items-start justify-between gap-3 mb-2">
                <div>
                  <h3 class="font-bold text-lg" style="color: {$colorStore.text}">{item.name}</h3>
                  <div class="text-sm font-medium" style="color: {$colorStore.primary}">
                    {formatNumber(item.price)}
                  </div>
                </div>
                <span class="text-xs px-2 py-1 rounded-lg shrink-0"
                      style="background: {$colorStore.primary}15; color: {$colorStore.muted};">
                  {item.itemType === ShopItemType.Role ? "Role" : item.itemType === ShopItemType.Text ? "Text" : "Item"}
                </span>
              </div>

              {#if item.description}
                <p class="text-sm mb-3" style="color: {$colorStore.muted}">{item.description}</p>
              {/if}

              <div class="text-xs space-y-1 mb-4" style="color: {$colorStore.muted}">
                {#if item.roleName}<div>Grants {item.roleName}</div>{/if}
                {#if item.requiredRoleName}<div>Requires {item.requiredRoleName}</div>{/if}
                <div>{item.stock < 0 ? "Unlimited stock" : `${item.stock} in stock`}</div>
                {#if item.maxPerUser > 0}<div>Limit {item.maxPerUser} per person</div>{/if}
                <div>{formatNumber(item.owned)} owned · {formatNumber(item.revenue)} spent</div>
              </div>

              <div class="flex flex-wrap gap-2">
                <button onclick={() => openShopEditor(item)}
                        class="px-3 py-2 rounded-lg text-sm transition-all"
                        style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">Edit
                </button>
                <button onclick={() => toggleShopItem(item)}
                        class="px-3 py-2 rounded-lg text-sm transition-all"
                        style="background: {$colorStore.secondary}20; color: {$colorStore.secondary}; border: 1px solid {$colorStore.secondary}30;">
                  {item.enabled ? "Hide" : "Show"}
                </button>
                <button onclick={() => deleteShopItem(item)}
                        class="px-3 py-2 rounded-lg text-sm transition-all"
                        style="background: {$colorStore.accent}20; color: {$colorStore.accent}; border: 1px solid {$colorStore.accent}30;">Delete
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}

      {#if showShopEditor}
        <div class="rounded-2xl border p-6 md:p-8 shadow-2xl"
             style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                    border-color: {$colorStore.primary}30;"
             in:fly={{ y: 20, duration: 200 }}>
          <h3 class="text-lg font-bold mb-6" style="color: {$colorStore.text}">
            {editingName ? `Editing ${editingName}` : "New shop item"}
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label for="shop-name" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Name</label>
              <input id="shop-name" type="text" bind:value={shopForm.name}
                     class="w-full p-3 rounded-xl border min-h-[44px]"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
            </div>

            <div>
              <label for="shop-price" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Price</label>
              <input id="shop-price" type="number" min="0" bind:value={shopForm.price}
                     class="w-full p-3 rounded-xl border min-h-[44px]"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
            </div>

            <div class="md:col-span-2">
              <label for="shop-desc" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Description</label>
              <input id="shop-desc" type="text" bind:value={shopForm.description}
                     class="w-full p-3 rounded-xl border min-h-[44px]"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
            </div>

            <div>
              <label for="shop-type" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Type</label>
              <DiscordSelector id="shop-type" ariaLabel="Item type" type="custom" options={itemTypeOptions}
                               selected={shopForm.itemType.toString()}
                               onchange={(d) => (shopForm.itemType = Number(d.selected) as ShopItemType)} />
            </div>

            {#if shopForm.itemType === ShopItemType.Role}
              <div>
                <label for="shop-role" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Role granted</label>
                <DiscordSelector id="shop-role" ariaLabel="Role granted" type="role" options={guildRoles}
                                 selected={shopForm.roleId?.toString() ?? null}
                                 placeholder="Pick a role"
                                 onchange={(d) => (shopForm.roleId = d.selected ? BigInt(d.selected as string) : null)} />
              </div>
            {/if}

            {#if shopForm.itemType === ShopItemType.Text}
              <div class="md:col-span-2">
                <label for="shop-text" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Delivered text</label>
                <textarea id="shop-text" rows="3" bind:value={shopForm.textContent}
                          class="w-full p-3 rounded-xl border"
                          style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};"></textarea>
              </div>
            {/if}

            <div>
              <label for="shop-stock" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Stock</label>
              <input id="shop-stock" type="number" min="-1" bind:value={shopForm.stock}
                     class="w-full p-3 rounded-xl border min-h-[44px]"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
              <p class="text-xs mt-1" style="color: {$colorStore.muted}">-1 for unlimited</p>
            </div>

            <div>
              <label for="shop-max" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Limit per user</label>
              <input id="shop-max" type="number" min="0" bind:value={shopForm.maxPerUser}
                     class="w-full p-3 rounded-xl border min-h-[44px]"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
              <p class="text-xs mt-1" style="color: {$colorStore.muted}">0 for unlimited</p>
            </div>

            <div>
              <label for="shop-required-role" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Required role</label>
              <DiscordSelector id="shop-required-role" ariaLabel="Required role" type="role" options={guildRoles}
                               selected={shopForm.requiredRoleId?.toString() ?? null}
                               placeholder="Anyone can buy"
                               onchange={(d) => (shopForm.requiredRoleId = d.selected ? BigInt(d.selected as string) : null)} />
            </div>

            <div>
              <label for="shop-sort" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Sort order</label>
              <input id="shop-sort" type="number" bind:value={shopForm.sortOrder}
                     class="w-full p-3 rounded-xl border min-h-[44px]"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
            </div>

            <div class="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {@render switchRow("Consumable", "Can be used up after purchase", shopForm.consumable,
                () => (shopForm.consumable = !shopForm.consumable))}
              {@render switchRow("Visible in shop", "Members can see and buy this item", shopForm.enabled,
                () => (shopForm.enabled = !shopForm.enabled))}
            </div>
          </div>

          <div class="flex flex-wrap gap-3 mt-6">
            <button onclick={saveShopItem} disabled={saving}
                    class="px-6 py-3 rounded-xl font-medium min-h-[44px] disabled:opacity-50"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
              {saving ? "Saving..." : editingName ? "Save changes" : "Create item"}
            </button>
            <button onclick={() => (showShopEditor = false)}
                    class="px-6 py-3 rounded-xl font-medium min-h-[44px]"
                    style="background: transparent; color: {$colorStore.muted}; border: 1px solid {$colorStore.primary}30;">
              Cancel
            </button>
          </div>
        </div>
      {/if}
    </div>
  {/if}

  {#if activeTab === 'leaderboard'}
    <div class="w-full space-y-6" in:fade={{ duration: 200 }}>

      <!-- Balance adjustment -->
      <div class="rounded-2xl border p-6 shadow-2xl"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <h2 class="text-lg font-bold mb-4" style="color: {$colorStore.text}">Adjust a balance</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="adj-user" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Member</label>
            <DiscordSelector id="adj-user" ariaLabel="Member" type="user" options={guildMembers}
                             bind:selected={adjustUserId} searchable placeholder="Select a member" />
          </div>
          <div>
            <label for="adj-amount" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Amount</label>
            <input id="adj-amount" type="number" bind:value={adjustAmount}
                   class="w-full p-3 rounded-xl border min-h-[44px]"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          </div>
          <div>
            <label for="adj-reason" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Reason</label>
            <input id="adj-reason" type="text" bind:value={adjustReason} placeholder="Recorded on the ledger"
                   class="w-full p-3 rounded-xl border min-h-[44px]"
                   style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3 mt-4">
          <button onclick={adjustBalance} disabled={saving}
                  class="px-6 py-3 rounded-xl font-medium min-h-[44px] disabled:opacity-50"
                  style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">
            Apply
          </button>
          <span class="text-xs" style="color: {$colorStore.muted}">A negative amount removes currency.</span>
        </div>
      </div>

      <!-- Leaderboard -->
      <div class="rounded-2xl border p-6 shadow-2xl"
           style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15, {$colorStore.gradientEnd}10);
                  border-color: {$colorStore.primary}30;">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h2 class="text-lg font-bold" style="color: {$colorStore.text}">Richest members</h2>
          <span class="text-sm" style="color: {$colorStore.muted}">{formatNumber(leaderboardTotal)} holders</span>
        </div>

        {#if leaderboard.length === 0}
          <p class="text-center py-12" style="color: {$colorStore.muted}">Nobody holds any currency yet.</p>
        {:else}
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
              <tr style="color: {$colorStore.muted}">
                <th class="text-left py-2 px-3">#</th>
                <th class="text-left py-2 px-3">Member</th>
                <th class="text-right py-2 px-3">Wallet</th>
                <th class="text-right py-2 px-3">Bank</th>
                <th class="text-right py-2 px-3">Net worth</th>
                <th class="text-right py-2 px-3">Share</th>
              </tr>
              </thead>
              <tbody>
              {#each leaderboard as entry}
                <tr style="border-top: 1px solid {$colorStore.primary}15;">
                  <td class="py-2 px-3" style="color: {$colorStore.muted}">{entry.rank}</td>
                  <td class="py-2 px-3">
                    <div class="flex items-center gap-2">
                      {#if entry.avatarUrl}
                        <img src={entry.avatarUrl} alt="" class="w-6 h-6 rounded-full" />
                      {/if}
                      <span style="color: {$colorStore.text}">{entry.username ?? entry.userId.toString()}</span>
                    </div>
                  </td>
                  <td class="py-2 px-3 text-right" style="color: {$colorStore.text}">{formatNumber(entry.wallet)}</td>
                  <td class="py-2 px-3 text-right" style="color: {$colorStore.muted}">{formatNumber(entry.bank)}</td>
                  <td class="py-2 px-3 text-right font-bold" style="color: {$colorStore.primary}">{formatNumber(entry.netWorth)}</td>
                  <td class="py-2 px-3 text-right" style="color: {$colorStore.muted}">{formatPercent(entry.shareOfSupply)}</td>
                </tr>
              {/each}
              </tbody>
            </table>
          </div>

          <div class="flex items-center justify-between mt-4">
            <button onclick={() => loadLeaderboardPage(leaderboardPage - 1)} disabled={leaderboardPage === 0}
                    class="px-4 py-2 rounded-xl text-sm min-h-[40px] disabled:opacity-40"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">Previous
            </button>
            <span class="text-sm" style="color: {$colorStore.muted}">
              Page {leaderboardPage + 1} of {Math.max(1, Math.ceil(leaderboardTotal / leaderboardPageSize))}
            </span>
            <button onclick={() => loadLeaderboardPage(leaderboardPage + 1)}
                    disabled={(leaderboardPage + 1) * leaderboardPageSize >= leaderboardTotal}
                    class="px-4 py-2 rounded-xl text-sm min-h-[40px] disabled:opacity-40"
                    style="background: {$colorStore.primary}20; color: {$colorStore.primary}; border: 1px solid {$colorStore.primary}30;">Next
            </button>
          </div>
        {/if}
      </div>
    </div>
  {/if}

</DashboardPageLayout>
