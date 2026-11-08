<script lang="ts">
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    value: string | number;
    id?: string;
    label?: string;
    placeholder?: string;
    type?: "text" | "number" | "url";
    rows?: number;
    min?: number;
    max?: number;
    maxlength?: number;
    oninput?: () => void;
    onblur?: () => void;
  }

  let { value = $bindable(), id, label, placeholder, type = "text", rows, min, max, maxlength, oninput, onblur }: Props = $props();

  const style = $derived(`background: ${$colorStore.primary}10; border-color: ${$colorStore.primary}30; color: ${$colorStore.text};`);
  const classes = "w-full p-3 rounded-lg border focus:ring-2 min-h-[50px]";
</script>

{#if rows}
  <textarea {id} {rows} {placeholder} {maxlength} aria-label={label} bind:value class="{classes} resize-y" {style} {oninput} {onblur}></textarea>
{:else if type === "number"}
  <input {id} type="number" {min} {max} {placeholder} aria-label={label} bind:value class={classes} {style} {oninput} {onblur}>
{:else}
  <input {id} {type} {placeholder} {maxlength} aria-label={label} bind:value class={classes} {style} {oninput} {onblur}>
{/if}
