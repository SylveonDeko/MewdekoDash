<script lang="ts">
  /**
   * A named, collapsible group of form settings.
   *
   * Groups are titled by the question they answer, not by the kind of data they hold, so somebody
   * looking for "the role people get while their answer is being reviewed" has one place to look
   * rather than scanning thirteen role pickers.
   */
  import { slide } from "svelte/transition";
  import { type Snippet, untrack } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    title: string;
    /** One line saying what the group decides, shown under the title. */
    summary: string;
    icon: string;
    /**
     * Whether the group starts open, read once when it first renders. Later changes are ignored
     * on purpose, so a group somebody has collapsed does not spring back open underneath them.
     */
    initiallyOpen?: boolean;
    /** How many settings inside are set, shown as a badge when collapsed. */
    changed?: number;
    children: Snippet;
  }

  let { title, summary, icon, initiallyOpen = false, changed = 0, children }: Props = $props();

  let expanded = $state(untrack(() => initiallyOpen));
</script>

<div
  class="rounded-xl border overflow-hidden"
  style="background: {$colorStore.primary}05; border-color: {$colorStore.primary}25;"
>
  <button
    type="button"
    onclick={() => (expanded = !expanded)}
    aria-expanded={expanded}
    class="w-full flex items-start justify-between gap-3 p-4 text-left transition-colors"
  >
    <div class="flex items-start gap-3 min-w-0">
      <i
        class="fa-solid {icon} mt-0.5 flex-shrink-0"
        style="color: {$colorStore.primary};"
        aria-hidden="true"
      ></i>
      <div class="min-w-0">
        <div class="font-semibold" style="color: {$colorStore.text};">{title}</div>
        <div class="text-sm" style="color: {$colorStore.muted};">{summary}</div>
      </div>
    </div>

    <div class="flex items-center gap-2 flex-shrink-0">
      {#if changed > 0 && !expanded}
        <span
          class="px-2 py-0.5 text-xs rounded-full"
          style="background: {$colorStore.primary}20; color: {$colorStore.primary};"
        >
          {changed} set
        </span>
      {/if}
      <i
        class="fa-solid {expanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-sm"
        style="color: {$colorStore.muted};"
        aria-hidden="true"
      ></i>
    </div>
  </button>

  {#if expanded}
    <div class="px-4 pb-4 space-y-4" transition:slide={{ duration: 150 }}>
      {@render children()}
    </div>
  {/if}
</div>
