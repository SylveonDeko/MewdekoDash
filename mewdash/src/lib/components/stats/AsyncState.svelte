<!-- lib/components/stats/AsyncState.svelte -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    loading?: boolean;
    error?: string | null;
    /** When true the empty message is shown instead of the children. */
    empty?: boolean;
    emptyMessage?: string;
    emptyIcon?: string;
    children: Snippet;
  }

  let {
    loading = false,
    error = null,
    empty = false,
    emptyMessage = "Nothing here yet",
    emptyIcon = "fa-chart-simple",
    children,
  }: Props = $props();
</script>

{#if loading}
  <div class="flex justify-center items-center min-h-[160px]">
    <div
      class="w-10 h-10 border-4 rounded-full animate-spin"
      style="border-color: {$colorStore.primary}20; border-top-color: {$colorStore.primary};"
      aria-label="Loading"
    ></div>
  </div>
{:else if error}
  <div class="rounded-xl p-4 flex items-center gap-3" style="background: {$colorStore.accent}10;" role="alert">
    <i
      class="fa-utility-duo fa-regular fa-circle-exclamation"
      style="--fa-primary-color: {$colorStore.accent}; --fa-secondary-color: {$colorStore.primary}; font-size: 20px;"
      aria-hidden="true"
    ></i>
    <p style="color: {$colorStore.accent}">{error}</p>
  </div>
{:else if empty}
  <div class="text-center py-12">
    <i
      class="fa-utility-duo fa-regular {emptyIcon} block mx-auto mb-4"
      style="--fa-primary-color: {$colorStore.muted}; --fa-secondary-color: {$colorStore.muted}; font-size: 48px; opacity: 0.5;"
      aria-hidden="true"
    ></i>
    <p style="color: {$colorStore.muted}">{emptyMessage}</p>
  </div>
{:else}
  {@render children()}
{/if}
