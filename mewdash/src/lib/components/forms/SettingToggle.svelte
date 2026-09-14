<script lang="ts">
  /**
   * An on/off setting, with the hint that says what turning it on does.
   *
   * The form builder had eleven of these written out by hand with three different markups between
   * them, several with no explanation at all.
   */
  import { colorStore } from "$lib/stores/colorStore";

  interface Props {
    label: string;
    hint: string;
    id: string;
    checked: boolean;
    disabled?: boolean;
    /** Colour of the track when on. Defaults to the guild's own accent. */
    accent?: string;
    onchange: (checked: boolean) => void;
  }

  let { label, hint, id, checked, disabled = false, accent, onchange }: Props = $props();

  let trackColor = $derived(checked ? (accent ?? $colorStore.primary) : "#4b5563");
</script>

<div
  class="flex items-start justify-between gap-3 p-3 rounded-lg"
  class:opacity-50={disabled}
  style="background: {$colorStore.primary}08;"
>
  <div class="min-w-0">
    <label for={id} class="block text-sm font-medium" style="color: {$colorStore.text};">
      {label}
    </label>
    <p id="{id}-hint" class="text-xs mt-0.5" style="color: {$colorStore.muted};">
      {hint}
    </p>
  </div>

  <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-0.5">
    <input
      {id}
      type="checkbox"
      class="sr-only peer"
      {checked}
      {disabled}
      aria-describedby="{id}-hint"
      onchange={(e) => onchange(e.currentTarget.checked)}
    />
    <span
      class="w-11 h-6 rounded-full block transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2
             after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full
             after:h-[18px] after:w-[18px] after:transition-transform peer-checked:after:translate-x-5"
      style="background-color: {trackColor};"
    ></span>
  </label>
</div>
