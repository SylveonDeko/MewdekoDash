<script lang="ts">
  import { AlertCircle, Award, Users } from "lucide-svelte";
  import { colorStore } from "$lib/stores/colorStore";
  import { fade } from "svelte/transition";

  export let leaderboard: any[] = [];
  export let leaderboardPage: number = 1;
  export let loading: boolean = false;
  export let error: string | null = null;
  export let onPageChange: (page: number) => void;

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
    <Award aria-hidden="true" class="w-6 h-6" />
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
    <AlertCircle class="w-5 h-5" style="color: {$colorStore.accent}" aria-hidden="true" />
    <p style="color: {$colorStore.accent}">{error}</p>
  </div>
{:else}
  {#if leaderboard.length === 0}
    <div
      class="text-center py-12"
      transition:fade
    >
      <Users class="w-12 h-12 mx-auto mb-4" style="color: {$colorStore.muted}" aria-hidden="true" />
      <p style="color: {$colorStore.muted}">No XP data available</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {#each leaderboard as user, i}
        <div
          class="rounded-xl p-4 border transition-all duration-200"
          style="background: {$colorStore.primary}10;
                 border-color: {$colorStore.primary}20;
                 hover:border-color: {$colorStore.primary}30;"
        >
          <div class="flex items-center gap-4">
            <div
              class="w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold flex-shrink-0"
              style="background: {i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : $colorStore.primary}20;
                     color: {i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : $colorStore.primary};"
              aria-label={`Rank ${user.rank}`}
            >
              #{user.rank}
            </div>
            <img
              src={user.avatarUrl}
              alt=""
              class="w-12 h-12 rounded-full border-2 flex-shrink-0"
              style="border-color: {$colorStore.primary}30;"
            />
            <div class="flex-grow min-w-0">
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
        on:click={() => goToPage(leaderboardPage - 1)}
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
        on:click={() => goToPage(leaderboardPage + 1)}
        aria-label="Next page"
      >
        Next
      </button>
    </div>
  {/if}
{/if}