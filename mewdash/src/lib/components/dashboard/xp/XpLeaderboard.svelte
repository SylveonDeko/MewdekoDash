<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import { fade } from "svelte/transition";

  interface Props {
    leaderboard?: any[];
    leaderboardPage?: number;
    loading?: boolean;
    error?: string | null;
    onPageChange: (page: number) => void;
  }

  let {
    leaderboard = [],
    leaderboardPage = 1,
    loading = false,
    error = null,
    onPageChange
  }: Props = $props();

  function formatNumber(num: number): string {
    return new Intl.NumberFormat().format(num);
  }

  function goToPage(page: number) {
    if (page < 1) return;
    onPageChange(page);
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