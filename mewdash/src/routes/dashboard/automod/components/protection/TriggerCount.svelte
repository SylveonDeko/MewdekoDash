<script lang="ts">
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";

  let { count }: { count: number } = $props();
</script>

{#if count > 0}
  <p class="text-xs" style="color: {$colorStore.muted}">{m.automod.triggered({ count })}</p>
{/if}
