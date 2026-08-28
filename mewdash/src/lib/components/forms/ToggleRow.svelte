<!-- lib/components/forms/ToggleRow.svelte -->
<script lang="ts">
  /**
   * A labelled iOS style switch.
   *
   * The dashboard's toggle look is a Tailwind peer pattern that was previously pasted inline at
   * every use, which made it easy to end up with a plain checkbox by accident. This keeps the
   * markup and the reduced-motion behaviour in one place.
   */
  interface Props {
    checked: boolean;
    title: string;
    colors: any;
    subtitle?: string;
    id?: string;
    disabled?: boolean;
    onchange?: (checked: boolean) => void;
  }

  let { checked, title, colors, subtitle, id, disabled = false, onchange }: Props = $props();
</script>

<label
  class="flex items-start gap-3 p-3 rounded-lg min-h-[44px] cursor-pointer"
  class:opacity-50={disabled}
  style="background: {colors.primary}08;"
>
  <input
    {id}
    type="checkbox"
    {checked}
    {disabled}
    class="sr-only peer"
    onchange={(e) => onchange?.((e.target as HTMLInputElement).checked)}
  />
  <div
    class="switch-toggle shrink-0 mt-0.5 w-11 h-6 rounded-full relative transition-all
           peer-focus-visible:ring-2
           after:content-[''] after:absolute after:top-[2px] after:left-[2px]
           after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
           peer-checked:after:translate-x-full"
    style="background: {checked ? colors.primary : `${colors.primary}20`};
           {checked ? `box-shadow: 0 0 8px ${colors.primary}40, inset 0 1px 0 rgba(255,255,255,0.2);` : ''}"
  ></div>
  <span class="min-w-0">
    <span class="block text-sm" style="color: {colors.text}">{title}</span>
    {#if subtitle}
      <span class="block text-xs" style="color: {colors.muted}">{subtitle}</span>
    {/if}
  </span>
</label>

<style>
    @media (prefers-reduced-motion: no-preference) {
        .switch-toggle {
            transition: box-shadow 0.3s ease;
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .switch-toggle {
            box-shadow: none !important;
            transition: none;
        }

        .switch-toggle::after {
            transition: none;
        }
    }
</style>
