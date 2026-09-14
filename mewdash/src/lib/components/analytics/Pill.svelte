<!-- lib/components/analytics/Pill.svelte -->
<script lang="ts">
  import { pillColor, type PillTone } from "./palette";

  interface Props {
    tone?: PillTone;
    text: string;
    icon?: string;
  }

  let { tone = "muted", text, icon }: Props = $props();
  let color = $derived(pillColor(tone));
</script>

<span
  class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap"
  style="background: {color}20; color: {color};"
>
  {#if icon}<i class="fa-solid {icon} text-[10px]"></i>{/if}{text}
</span>
