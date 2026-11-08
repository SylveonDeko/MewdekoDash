<script lang="ts">
  /**
   * One setting group on a feature page, with an optional on/off switch.
   */
  import type { Snippet } from "svelte";
  import { slide } from "svelte/transition";
  import { m } from "$lib/i18n";
  import { colorStore } from "$lib/stores/colorStore";
  import Card from "$lib/components/analytics/Card.svelte";
  import ToggleRow from "$lib/components/forms/ToggleRow.svelte";

  interface Props {
    title: string;
    /** Short meta text shown beside the title. */
    note?: string;
    /** The section's enable setting. Leave undefined for a card without a switch. */
    enabled?: boolean;
    /** Called with the new value when the card's switch is flipped. */
    onToggle?: (enabled: boolean) => void;
    /** Keeps the body open while the switch is off, for sections that need setup before they can turn on. */
    alwaysOpen?: boolean;
    /** Extra controls beside the switch. */
    actions?: Snippet;
    children: Snippet;
  }

  let { title, note, enabled, onToggle, alwaysOpen = false, actions, children }: Props = $props();
</script>

{#snippet header()}
  {@render actions?.()}
  {#if enabled !== undefined}
    <ToggleRow
      checked={enabled}
      title={enabled ? m.common.enabled() : m.common.disabled()}
      colors={$colorStore}
      onchange={(value) => onToggle?.(value)}
    />
  {/if}
{/snippet}

<Card {title} {note} actions={actions || enabled !== undefined ? header : undefined}>
  {#if alwaysOpen || enabled !== false}
    <div class="space-y-4 mt-3" transition:slide={{ duration: 150 }}>
      {@render children()}
    </div>
  {/if}
</Card>
