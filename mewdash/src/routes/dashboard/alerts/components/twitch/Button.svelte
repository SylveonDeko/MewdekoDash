<script lang="ts">
  import type { Snippet } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    variant?: "primary" | "quiet" | "danger";
    disabled?: boolean;
    compact?: boolean;
    onclick: () => void;
    children: Snippet;
  }

  let { variant = "quiet", disabled = false, compact = false, onclick, children }: Props = $props();

  const style = $derived(
    variant === "primary"
      ? `background: ${$colorStore.primary}; color: ${$colorStore.onPrimary};`
      : variant === "danger"
        ? `background: ${$colorStore.accent}15; color: ${$colorStore.accent}; border: 1px solid ${$colorStore.accent}30;`
        : `background: ${$colorStore.primary}20; color: ${$colorStore.text}; border: 1px solid ${$colorStore.primary}30;`
  );
</script>

<button
  type="button"
  class="flex items-center justify-center gap-2 px-5 rounded-xl font-medium disabled:opacity-50 {compact ? 'min-h-[44px]' : 'min-h-[50px]'}"
  {style}
  {disabled}
  {onclick}
>
  {@render children()}
</button>
