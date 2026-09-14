<!-- lib/components/analytics/StatTile.svelte -->
<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    label: string;
    value: string;
    sub?: string;
    loading?: boolean;
    tone?: "ok" | "warn" | "crit" | null;
  }

  let { label, value, sub, loading = false, tone = null }: Props = $props();

  let color = $derived(tone === "ok" ? "#4ade80" : tone === "warn" ? "#fdac41" : tone === "crit" ? "#f87171" : $colorStore.text);
</script>

<div
  class="rounded-xl border p-3 flex flex-col gap-1 min-h-[88px]"
  style="background: {$colorStore.primary}08; border-color: {$colorStore.primary}20;"
>
  <p class="text-xs truncate" style="color: {$colorStore.muted}" title={label}>{label}</p>
  <div class="text-xl font-semibold tabular-nums leading-tight" style="color: {color}">
    {#if loading}
      <span class="inline-block h-5 w-16 rounded animate-pulse" style="background: {$colorStore.primary}20"></span>
    {:else}
      {value}
    {/if}
  </div>
  {#if sub}
    <p class="text-[11px] mt-auto truncate" style="color: {$colorStore.muted}" title={sub}>{sub}</p>
  {/if}
</div>
