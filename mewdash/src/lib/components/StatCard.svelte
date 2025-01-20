<!-- lib/components/StatCard.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";
  import type { ComponentType } from "svelte";

  export let icon: ComponentType<any>;
  export let label: string;
  export let value: string | number;
  export let iconColor: "primary" | "secondary" | "accent" = "primary";
  export let subtitle: string | undefined = undefined;
  export let valueColor: "primary" | "text" = "text";
</script>

<div class="backdrop-blur-sm flex items-center justify-between p-3 rounded-xl"
     style="background: linear-gradient(135deg, {$colorStore.gradientStart}10, {$colorStore.gradientMid}15);
            border-color: {$colorStore.primary}30;">
  <div class="flex items-center gap-3">
    <div class="p-2 rounded-xl"
         style="background: linear-gradient(135deg, {$colorStore.primary}20, {$colorStore.secondary}20);
                color: {$colorStore[iconColor]};">
      <svelte:component
        class="w-5 h-5"
        this={icon}
      />
    </div>
    <span style="color: {$colorStore.muted}">{label}</span>
  </div>
  <div class="flex items-center gap-2">
    <span class="font-medium" style="color: {$colorStore[valueColor]}">
      {value}
    </span>
    {#if subtitle}
      <span class="text-sm" style="color: {$colorStore.muted}">
        ({subtitle})
      </span>
    {/if}
  </div>
</div>