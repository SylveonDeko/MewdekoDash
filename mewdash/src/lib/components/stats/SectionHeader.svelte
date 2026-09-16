<!-- lib/components/stats/SectionHeader.svelte -->
<script lang="ts">
  import type { Snippet } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    /** A utility duo icon name such as fa-gear. */
    icon: string;
    title: string;
    subtitle?: string;
    /** Controls rendered on the right, such as a window picker. */
    actions?: Snippet;
  }

  let { icon, title, subtitle, actions }: Props = $props();
</script>

<div class="flex flex-wrap items-center justify-between gap-3 mb-6">
  <div class="flex items-center gap-3 min-w-0">
    <div
      class="p-3 rounded-xl shrink-0"
      style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);"
    >
      <i
        class="fa-utility-duo fa-regular {icon}"
        style="--fa-primary-color: {$colorStore.primary}; --fa-secondary-color: {$colorStore.secondary}; font-size: 24px;"
        aria-hidden="true"
      ></i>
    </div>
    <div class="min-w-0">
      <h2 class="text-xl font-bold truncate" style="color: {$colorStore.text}">{title}</h2>
      {#if subtitle}
        <p class="text-sm" style="color: {$colorStore.muted}">{subtitle}</p>
      {/if}
    </div>
  </div>
  {#if actions}
    <div class="flex flex-wrap items-center gap-2">
      {@render actions()}
    </div>
  {/if}
</div>
