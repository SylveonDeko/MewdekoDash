<script lang="ts">
  import { m } from "$lib/i18n";
  /**
   * Shows where an auto-saving page's changes are: waiting, saving, saved, or failed.
   *
   * Replaces the success toast on pages that save as you go, where a toast per keystroke
   * would be noise. Failures still offer a retry here; the page decides whether to toast too.
   */
  import { fade } from "svelte/transition";
  import { colorStore } from "$lib/stores/colorStore";
  import type { AutoSave } from "$lib/utils/autoSave.svelte";

  interface Props {
    autoSave: AutoSave;
  }

  let { autoSave }: Props = $props();

  let status = $derived(autoSave.status);
</script>

<div class="flex items-center gap-2 text-sm min-h-[44px]" role="status" aria-live="polite">
  {#if status === "pending" || status === "saving"}
    <span class="flex items-center gap-2" style="color: {$colorStore.muted};" in:fade={{ duration: 120 }}>
      <i class="fa-solid fa-circle-notch fa-spin" aria-hidden="true"></i>
      {m.common.saving()}
    </span>
  {:else if status === "saved"}
    <span class="flex items-center gap-2" style="color: {$colorStore.primary};" in:fade={{ duration: 120 }}>
      <i class="fa-solid fa-check" aria-hidden="true"></i>
      {m.common.saved()}
    </span>
  {:else if status === "error"}
    <span class="flex items-center gap-2 text-red-400" in:fade={{ duration: 120 }}>
      <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
      {m.layout.saveStatusFailed()}
      <button
        type="button"
        class="underline font-medium px-1 min-h-[44px]"
        onclick={() => autoSave.retry()}
      >
        {m.common.retry()}
      </button>
    </span>
  {:else}
    <span class="flex items-center gap-2" style="color: {$colorStore.muted};">
      <i class="fa-solid fa-cloud" aria-hidden="true"></i>
      {m.common.changesSaveAutomatically()}
    </span>
  {/if}
</div>
