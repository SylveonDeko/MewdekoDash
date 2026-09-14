<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { fade } from "svelte/transition";

  import { fly } from "svelte/transition";
  import DiscordSelector from "$lib/components/forms/DiscordSelector.svelte";

  /** Manual XP adjustment requested from the leaderboard */
  type XpAdjustment =
    | { mode: "add"; userId: string; amount: number }
    | { mode: "set"; userId: string; amount: number }
    | { mode: "reset"; userId: string; resetBonus: boolean };

  interface Props {
    leaderboard?: any[];
    leaderboardPage?: number;
    loading?: boolean;
    error?: string | null;
    onPageChange: (page: number) => void;
    onAdjust?: (adjustment: XpAdjustment) => Promise<void>;
  }

  let {
    leaderboard = [],
    leaderboardPage = 1,
    loading = false,
    error = null,
    onPageChange,
    onAdjust
  }: Props = $props();

  let adjustTarget = $state<any | null>(null);
  let adjustMode = $state<"add" | "set" | "reset">("add");
  let adjustAmount = $state(100);
  let adjustResetBonus = $state(false);
  let adjustSaving = $state(false);
  let adjustError = $state("");

  const adjustModeOptions = [
    { id: "add", name: "Add XP" },
    { id: "set", name: "Set total XP" },
    { id: "reset", name: "Reset XP" }
  ];

  function formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
  }

  function goToPage(page: number) {
    if (page < 1) return;
    onPageChange(page);
  }

  function openAdjust(user: any) {
    adjustTarget = user;
    adjustMode = "add";
    adjustAmount = 100;
    adjustResetBonus = false;
    adjustError = "";
  }

  function closeAdjust() {
    adjustTarget = null;
    adjustError = "";
  }

  async function submitAdjust() {
    if (!adjustTarget || !onAdjust) return;
    adjustError = "";
    if (adjustMode !== "reset" && (!Number.isFinite(adjustAmount) || adjustAmount < 0)) {
      adjustError = "Enter a non-negative amount of XP.";
      return;
    }
    if (adjustMode === "add" && adjustAmount === 0) {
      adjustError = "Amount must be greater than zero.";
      return;
    }
    adjustSaving = true;
    try {
      const userId = adjustTarget.userId.toString();
      if (adjustMode === "reset") await onAdjust({ mode: "reset", userId, resetBonus: adjustResetBonus });
      else await onAdjust({ mode: adjustMode, userId, amount: Math.floor(adjustAmount) });
      closeAdjust();
    } catch (err) {
      adjustError = err instanceof Error ? err.message : "Failed to update XP.";
    } finally {
      adjustSaving = false;
    }
  }
</script>

<div class="flex items-center gap-3 mb-6">
  <div
    class="p-3 rounded-xl"
    style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
           color: {$colorStore.primary};"
  >
    <i aria-hidden="true"
       class="fa-utility-duo fa-regular fa-star"
       style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"></i>
  </div>
  <h2 class="text-xl font-bold" style="color: {$colorStore.text}">XP Leaderboard</h2>
</div>

{#if loading}
  <div class="flex justify-center items-center min-h-[200px]">
    <div
      class="w-12 h-12 border-4 rounded-full animate-spin"
      style="border-color: {$colorStore.primary}20;
             border-top-color: {$colorStore.primary};"
      aria-label="Loading"
    >
    </div>
  </div>
{:else if error}
  <div
    class="rounded-xl p-4 flex items-center gap-3"
    style="background: {$colorStore.accent}10;"
    role="alert"
  >
    <i class="fa-utility-duo fa-regular fa-bell"
       style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"
       aria-hidden="true"></i>
    <p style="color: {$colorStore.accent}">{error}</p>
  </div>
{:else}
  {#if leaderboard.length === 0}
    <div
      class="text-center py-12"
      transition:fade
    >
      <i class="fa-utility-duo fa-regular fa-users"
         style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; display: block; margin: 0 auto 16px;"
         aria-hidden="true"></i>
      <p style="color: {$colorStore.muted}">No XP data available</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each leaderboard as user, i (user.rank || i)}
        <div
          class="rounded-xl p-4 border transition-all duration-200"
          style="background: {$colorStore.primary}10;
                 border-color: {$colorStore.primary}20;
                 hover:border-color: {$colorStore.primary}30;"
        >
          <div class="flex items-center gap-4">
            <div
                    class="w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold shrink-0"
              style="background: {i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : $colorStore.primary}20;
                     color: {i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : $colorStore.primary};"
              aria-label={`Rank ${user.rank}`}
            >
              #{user.rank}
            </div>
            <img
              src={user.avatarUrl}
              alt=""
              class="w-12 h-12 rounded-full border-2 shrink-0"
              style="border-color: {$colorStore.primary}30;"
            >
            <div class="grow min-w-0">
              <p class="font-medium truncate" style="color: {$colorStore.text}">{user.username}</p>
              <div class="flex flex-col sm:flex-row sm:items-center text-sm gap-1" style="color: {$colorStore.muted}">
                <span class="font-medium" style="color: {$colorStore.secondary}">Level {user.level}</span>
                <span class="hidden sm:inline">•</span>
                <span>{formatNumber(user.totalXp)} XP</span>
              </div>
            </div>
            {#if onAdjust}
              <button
                class="p-2 rounded-lg transition-all hover:scale-[1.05] shrink-0 min-h-[40px] min-w-[40px]"
                style="background: {$colorStore.primary}15; color: {$colorStore.primary};"
                onclick={() => openAdjust(user)}
                aria-label={`Adjust XP for ${user.username}`}
                title="Adjust XP"
              >
                <i class="fa-solid fa-sliders" style="font-size: 14px;"></i>
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>

    <!-- Pagination -->
    <div class="flex justify-center mt-6 space-x-2">
      <button
        class="px-4 py-2 rounded-lg transition-all duration-200 min-h-[44px]"
        style="background: {$colorStore.primary}20;
               color: {$colorStore.text};
               opacity: {leaderboardPage <= 1 ? '0.5' : '1'};"
        onclick={() => goToPage(leaderboardPage - 1)}
        disabled={leaderboardPage <= 1}
        aria-label="Previous page"
      >
        Previous
      </button>
      <div
        class="px-4 py-2 rounded-lg min-h-[44px] flex items-center"
        style="background: {$colorStore.primary}30;
               color: {$colorStore.text};"
        aria-current="page"
      >
        Page {leaderboardPage}
      </div>
      <button
        class="px-4 py-2 rounded-lg transition-all duration-200 min-h-[44px]"
        style="background: {$colorStore.primary}20;
               color: {$colorStore.text};"
        onclick={() => goToPage(leaderboardPage + 1)}
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  {/if}
{/if}

{#if adjustTarget}
  <div class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
       role="presentation"
       onclick={closeAdjust}
       onkeydown={(e) => { if (e.key === "Escape") closeAdjust(); }}
       in:fade={{ duration: 150 }}>
    <div class="rounded-2xl shadow-2xl w-full max-w-md border"
         style="background: linear-gradient(135deg, {$colorStore.gradientStart}, {$colorStore.gradientMid}); border-color: {$colorStore.primary}30;"
         role="dialog"
         aria-modal="true"
         aria-labelledby="xp-adjust-title"
         tabindex="-1"
         onclick={(e) => e.stopPropagation()}
         onkeydown={(e) => e.stopPropagation()}
         in:fly={{ y: 20, duration: 250 }}>
      <div class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <img src={adjustTarget.avatarUrl} alt="" class="w-10 h-10 rounded-full border-2" style="border-color: {$colorStore.primary}30;">
          <div class="min-w-0">
            <h3 id="xp-adjust-title" class="text-lg font-bold truncate" style="color: {$colorStore.text}">Adjust XP</h3>
            <p class="text-xs truncate" style="color: {$colorStore.muted}">{adjustTarget.username} · Level {adjustTarget.level} · {formatNumber(adjustTarget.totalXp)} XP</p>
          </div>
        </div>

        <form class="space-y-4" onsubmit={(e) => { e.preventDefault(); submitAdjust(); }}>
          <div>
            <span id="xp-adjust-mode" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">Action</span>
            <DiscordSelector type="custom" options={adjustModeOptions} selected={adjustMode} searchable={false}
                             ariaLabelledby="xp-adjust-mode"
                             onchange={(e) => { if (typeof e.selected === "string") adjustMode = e.selected as typeof adjustMode; }} />
          </div>

          {#if adjustMode === "reset"}
            <label class="flex items-center gap-3 p-3 rounded-lg cursor-pointer min-h-[44px]"
                   style="background: {$colorStore.primary}08; color: {$colorStore.text};">
              <input type="checkbox" bind:checked={adjustResetBonus} class="w-4 h-4 rounded" style="accent-color: {$colorStore.primary};">
              <span class="text-sm">Also reset bonus XP</span>
            </label>
            <p class="text-xs" style="color: {$colorStore.muted}">This sets the member's server XP back to zero. It cannot be undone.</p>
          {:else}
            <div>
              <label for="xp-adjust-amount" class="block text-sm font-medium mb-2" style="color: {$colorStore.text}">
                {adjustMode === "add" ? "XP to add" : "New total XP"}
              </label>
              <input id="xp-adjust-amount" type="number" min="0" step="1" bind:value={adjustAmount}
                     class="w-full px-4 py-3 rounded-lg border min-h-[44px]"
                     style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}30; color: {$colorStore.text};">
            </div>
          {/if}

          {#if adjustError}
            <div class="p-3 rounded-lg flex items-center gap-2 text-sm" role="alert"
                 style="background: #ef444420; border: 1px solid #ef444430; color: #ef4444;">
              <i class="fa-solid fa-circle-exclamation"></i>
              <span>{adjustError}</span>
            </div>
          {/if}

          <div class="flex flex-col sm:flex-row gap-3 pt-2">
            <button type="button" onclick={closeAdjust}
                    class="flex-1 px-4 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] min-h-[44px]"
                    style="background: {$colorStore.muted}20; color: {$colorStore.muted};">
              Cancel
            </button>
            <button type="submit" disabled={adjustSaving}
                    class="flex-1 px-4 py-3 rounded-lg font-medium transition-all hover:scale-[1.02] min-h-[44px] disabled:opacity-50"
                    style="background: {adjustMode === 'reset' ? '#ef444420' : $colorStore.primary + '20'}; color: {adjustMode === 'reset' ? '#ef4444' : $colorStore.primary}; border: 1px solid {adjustMode === 'reset' ? '#ef444430' : $colorStore.primary + '30'};">
              {#if adjustSaving}<i class="fa-solid fa-spinner fa-spin mr-2"></i>{/if}
              {adjustMode === "reset" ? "Reset XP" : "Apply"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}