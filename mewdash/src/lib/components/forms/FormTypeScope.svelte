<script lang="ts">
  /**
   * Shows its contents only for the form types it applies to.
   *
   * Most settings on a form only mean anything for one kind of form: appeal limits belong to a ban
   * appeal, invite settings to a join application, anonymity to a plain form. Declaring that on the
   * container keeps the rule next to the setting it governs, rather than spread across a dozen
   * conditionals that have to be found and updated whenever a form type is added.
   */
  import { slide } from "svelte/transition";
  import type { Snippet } from "svelte";

  interface Props {
    /** The form type currently selected: 0 Regular, 1 BanAppeal, 2 JoinApplication. */
    formType: number;
    /** The form types these settings apply to. */
    types: number[];
    /** A further condition, for a setting that also depends on something else being on. */
    when?: boolean;
    /** Set false on a container that is a grid cell, so it does not break the grid flow. */
    animate?: boolean;
    children: Snippet;
  }

  let { formType, types, when = true, animate = true, children }: Props = $props();

  let visible = $derived(when && types.includes(formType));
</script>

{#if visible}
  {#if animate}
    <div transition:slide={{ duration: 150 }}>
      {@render children()}
    </div>
  {:else}
    {@render children()}
  {/if}
{/if}
