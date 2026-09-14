<script lang="ts">
  /**
   * One labelled setting, with the hint that says what it actually does.
   *
   * The hint is not optional in the way it usually is. Most of these settings are a role picker
   * that looks exactly like the twelve other role pickers around it, so the label and hint are the
   * only thing telling them apart, including for anyone tabbing through by ear.
   */
  import type { Snippet } from "svelte";
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    label: string;
    /** What this setting does, in one line. Read out after the label by screen readers. */
    hint: string;
    /** The id of the control inside, so the label points at it. */
    id: string;
    required?: boolean;
    children: Snippet;
  }

  let { label, hint, id, required = false, children }: Props = $props();

  let hintId = $derived(`${id}-hint`);
</script>

<div>
  <label for={id} class="block text-sm font-medium mb-1" style="color: {$colorStore.text};">
    {label}
    {#if required}
      <span style="color: #ef4444;" aria-hidden="true">*</span>
      <span class="sr-only">(required)</span>
    {/if}
  </label>

  <p id={hintId} class="text-xs mb-2" style="color: {$colorStore.muted};">
    {hint}
  </p>

  {@render children()}
</div>
